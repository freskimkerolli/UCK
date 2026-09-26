import type { ModerationCategory } from "@/lib/types";

/**
 * UÇK Connect — AI Content Moderation Engine
 *
 * Flow: User writes post/comment → normalize & analyze text → classify into a
 * risk category → map category to an action (ALLOW / WARNING / BLOCK) → the
 * caller persists the result and, on WARNING/BLOCK, writes a ModerationLog row.
 *
 * Design goal: tell civil historical discussion/criticism apart from personal
 * abuse. The word lists below therefore only contain profanity, slurs, threat
 * verbs and dehumanizing phrases — never neutral/critical vocabulary like
 * "gabim", "dështim", "kritikë", "diktaturë", etc. Mentioning UÇK, the war,
 * politicians or historical events is never by itself flagged.
 *
 * The `reason`/`userMessage` strings are produced via the translator `t`
 * passed in by the caller (scoped to the "moderation" namespace), so the
 * engine's decision text renders in the active locale instead of being
 * hardcoded to one language.
 */

export type ModerationAction = "ALLOW" | "WARNING" | "BLOCK";

type Translate = (key: string, params?: Record<string, string | number>) => string;

export interface ModerationResult {
  category: ModerationCategory;
  action: ModerationAction;
  reason: string;
  matchedTerms: string[];
  userMessage: string | null;
}

// ── Normalization ──────────────────────────────────────────────────────────

const LEET_MAP: Record<string, string> = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "8": "b",
  "@": "a",
  "$": "s",
  "+": "t",
  "!": "i",
};

function stripDiacritics(input: string): string {
  return input.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function deleet(input: string): string {
  return input.replace(/[013457@$+!]/g, (ch) => LEET_MAP[ch] ?? ch);
}

function collapseRepeats(input: string): string {
  return input.replace(/(.)\1{2,}/g, "$1$1");
}

/**
 * Produces two normalized views of the text:
 *  - spaced: punctuation collapsed to single spaces, safe for whole-word matching
 *  - tight: every non-letter character removed, catches "f.u.c.k" / "f u c k" style evasion
 */
function normalize(raw: string): { spaced: string; tight: string } {
  const lowered = stripDiacritics(raw.toLowerCase());
  const deleeted = deleet(lowered);
  const collapsed = collapseRepeats(deleeted);
  const spaced = collapsed.replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  const tight = collapsed.replace(/[^a-z]/g, "");
  return { spaced, tight };
}

// ── Word lists (root stems, already lowercase / diacritic-free) ────────────
// Kept as stems on purpose so inflected Albanian forms still match
// (e.g. "idiot" matches "idioti", "idiotë", "idiote").

const PROFANITY_ROOTS = [
  "kurv", "pidh", "pisk", "qorr eshte", "bythe", "zi bythe", "lezhe",
  "i qifsha", "te qifsha", "qifsh", "fuck", "shit", "bitch", "asshole",
  "motherfuck", "piçkë", "picke",
];

const INSULT_ROOTS = [
  "idiot", "budall", "debil", "dembel i madh", "kreti", "mor dosh", "dosh i",
  "trap i", "gomar", "derr", "lopa jote", "hajvan", "i marre", "e marre",
  "psikopat", "i çmendur qe je", "stupid", "moron", "loser", "retard",
];

const THREAT_VERB_ROOTS = [
  "vras", "vret", "vrare", "godas", "godet", "djeg", "djegim", "therri",
  "asgjesoj", "shpertheu", "shpertheje", "kill you", "vare", "vdes ti",
];

const THREAT_TARGET_MARKERS = [
  "te ", "ty ", "ju ", "familjen tende", "familjen tuaj", "shtepine tende",
  "you", "your family",
];

const DEHUMANIZATION_PHRASES = [
  "nuk jeni njerez", "jeni kafshe", "jeni plehra", "jeni therrori",
  "nuk jane njerez", "jane kafshe", "subhuman", "nuk ka vlere jeta e",
];

const HARASSMENT_MARKERS = [
  // direct-address patterns that, combined with an insult root, indicate a
  // personal attack rather than commentary about a historical topic
  "ti je", "ti qenke", "je nje", "jeni nje", "mor ti", "more ti",
];

const HATE_PROTECTED_SUBJECTS = [
  "veteran", "deshmor", "familj", "uck", "ushtria clirimtare", "martir",
];

const SPAM_PROMO_PHRASES = [
  "fitim i shpejte", "kredit falas", "kliko linkun", "kliko ketu per",
  "shperndaje tek 10", "bonus falas", "para falas", "click here to win",
  "make money fast", "work from home guaranteed",
];

function countMatches(haystack: string, roots: string[]): string[] {
  const found: string[] = [];
  for (const root of roots) {
    const needle = root.replace(/[^a-z0-9\s]/g, "");
    if (!needle) continue;
    if (needle.includes(" ")) {
      if (haystack.includes(needle)) found.push(root);
    } else {
      // whole-word-ish match on spaced text
      const pattern = new RegExp(`\\b${needle}\\w{0,3}\\b`);
      if (pattern.test(haystack)) found.push(root);
    }
  }
  return found;
}

function tightIncludesAny(tight: string, roots: string[]): string[] {
  const found: string[] = [];
  for (const root of roots) {
    const needle = root.replace(/[^a-z]/g, "");
    if (needle.length >= 4 && tight.includes(needle)) found.push(root);
  }
  return found;
}

const QUOTE_CONTEXT_MARKERS = [
  "citim", "cituar", "sipas dokumentit", "sipas burimit", "citoj", "„", "“", "\"",
];

function isQuotedForDocumentation(spaced: string, original: string): boolean {
  const lowered = original.toLowerCase();
  return QUOTE_CONTEXT_MARKERS.some((m) => spaced.includes(m) || lowered.includes(m));
}

/**
 * Classifies a piece of user text and returns the category + action the
 * caller should enforce. Pure function aside from the translator — callers
 * are responsible for persisting the result and writing audit/log rows.
 */
export function moderateText(raw: string, t: Translate): ModerationResult {
  const text = raw ?? "";
  const blockMessage = t("blockMessage");
  const warningMessage = t("warningMessage");

  if (!text.trim()) {
    return { category: "SAFE", action: "ALLOW", reason: t("emptyText"), matchedTerms: [], userMessage: null };
  }

  const { spaced, tight } = normalize(text);

  // 1. THREAT — highest severity
  const threatVerbs = countMatches(spaced, THREAT_VERB_ROOTS).concat(tightIncludesAny(tight, THREAT_VERB_ROOTS));
  const hasTargetMarker = THREAT_TARGET_MARKERS.some((m) => spaced.includes(m.replace(/[^a-z0-9\s]/g, "")));
  if (threatVerbs.length > 0 && hasTargetMarker) {
    const matched = [...new Set(threatVerbs)];
    return {
      category: "THREAT",
      action: "BLOCK",
      reason: t("threatDetected", { terms: matched.join(", ") }),
      matchedTerms: matched,
      userMessage: blockMessage,
    };
  }

  // 2. HATEFUL — dehumanization, or insult/profanity aimed at protected subjects
  const dehuman = countMatches(spaced, DEHUMANIZATION_PHRASES);
  const profanityHits = countMatches(spaced, PROFANITY_ROOTS).concat(tightIncludesAny(tight, PROFANITY_ROOTS));
  const insultHits = countMatches(spaced, INSULT_ROOTS).concat(tightIncludesAny(tight, INSULT_ROOTS));
  const protectedSubjectPresent = HATE_PROTECTED_SUBJECTS.some((s) => spaced.includes(s));

  if (dehuman.length > 0) {
    const matched = [...new Set(dehuman)];
    if (isQuotedForDocumentation(spaced, text)) {
      return {
        category: "REVIEW",
        action: "WARNING",
        reason: t("dehumanizingQuoted", { terms: matched.join(", ") }),
        matchedTerms: matched,
        userMessage: warningMessage,
      };
    }
    return {
      category: "HATEFUL",
      action: "BLOCK",
      reason: t("dehumanizingDetected", { terms: matched.join(", ") }),
      matchedTerms: matched,
      userMessage: blockMessage,
    };
  }

  if ((profanityHits.length > 0 || insultHits.length > 0) && protectedSubjectPresent) {
    const matched = [...new Set([...profanityHits, ...insultHits])];
    if (isQuotedForDocumentation(spaced, text)) {
      return {
        category: "REVIEW",
        action: "WARNING",
        reason: t("sensitiveTermQuoted", { terms: matched.join(", ") }),
        matchedTerms: matched,
        userMessage: warningMessage,
      };
    }
    return {
      category: "HATEFUL",
      action: "BLOCK",
      reason: t("offensiveTowardProtected", { terms: matched.join(", ") }),
      matchedTerms: matched,
      userMessage: blockMessage,
    };
  }

  // 3. HARASSMENT — insult/profanity with a clear second-person target
  const directAddress = HARASSMENT_MARKERS.some((m) => spaced.includes(m));
  if ((profanityHits.length > 0 || insultHits.length > 0) && directAddress) {
    const matched = [...new Set([...profanityHits, ...insultHits])];
    return {
      category: "HARASSMENT",
      action: "BLOCK",
      reason: t("directPersonalAttack", { terms: matched.join(", ") }),
      matchedTerms: matched,
      userMessage: blockMessage,
    };
  }

  // 4. ABUSIVE — profanity/insults present but no clear personal target
  //    (still not allowed on the platform, just a different severity label)
  if (profanityHits.length > 0 || insultHits.length > 0) {
    const matched = [...new Set([...profanityHits, ...insultHits])];
    return {
      category: "ABUSIVE",
      action: "BLOCK",
      reason: t("offensiveLanguage", { terms: matched.join(", ") }),
      matchedTerms: matched,
      userMessage: blockMessage,
    };
  }

  // 5. SPAM
  const spamPhrase = countMatches(spaced, SPAM_PROMO_PHRASES);
  const urlCount = (text.match(/https?:\/\/\S+/gi) ?? []).length;
  const capsRatio = (() => {
    const letters = text.replace(/[^a-zA-Z]/g, "");
    if (letters.length < 12) return 0;
    const caps = letters.replace(/[^A-Z]/g, "");
    return caps.length / letters.length;
  })();
  if (spamPhrase.length > 0 || urlCount >= 3 || capsRatio > 0.7) {
    return {
      category: "SPAM",
      action: "BLOCK",
      reason:
        spamPhrase.length > 0
          ? t("spamPhrase", { terms: spamPhrase.join(", ") })
          : urlCount >= 3
            ? t("spamLinks")
            : t("spamCaps"),
      matchedTerms: spamPhrase,
      userMessage: blockMessage,
    };
  }

  // 6. REVIEW — soft signal: a single mild marker without enough context to
  //    justify blocking (e.g. one direct-address marker with no insult, or a
  //    protected-subject mention combined with strong emotional punctuation).
  const exclaims = (text.match(/!/g) ?? []).length;
  if (protectedSubjectPresent && exclaims >= 3) {
    return {
      category: "REVIEW",
      action: "WARNING",
      reason: t("emotionalNearSensitive"),
      matchedTerms: [],
      userMessage: warningMessage,
    };
  }

  return { category: "SAFE", action: "ALLOW", reason: t("noIssuesFound"), matchedTerms: [], userMessage: null };
}
