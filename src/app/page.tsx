import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight, BookOpen, ShieldCheck, Users2, MessagesSquare, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoLockup, LogoMark } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/app-shell/language-switcher";

export default async function LandingPage() {
  const t = await getTranslations("landing");
  const tBrand = await getTranslations("brand");

  const FEATURES = [
    { icon: Landmark, title: t("feature1Title"), desc: t("feature1Desc") },
    { icon: Users2, title: t("feature2Title"), desc: t("feature2Desc") },
    { icon: MessagesSquare, title: t("feature3Title"), desc: t("feature3Desc") },
    { icon: ShieldCheck, title: t("feature4Title"), desc: t("feature4Desc") },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-background/75 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 min-h-16 py-3 flex flex-wrap items-center justify-center sm:justify-between gap-3">
          <LogoLockup size="md" />
          <div className="flex flex-wrap items-center justify-center gap-2">
            <LanguageSwitcher className="flex items-center gap-1 rounded-full bg-secondary/60 px-3 py-1.5 text-sm text-secondary-foreground hover:bg-secondary transition-colors" />
            <Button
              render={<Link href="/login" />}
              variant="ghost"
              className="h-11 px-5 rounded-full text-[15px] font-semibold transition-all hover:bg-primary/10 hover:text-primary active:scale-[0.96]"
            >
              {t("loginNav")}
            </Button>
            <Button
              render={<Link href="/signup" />}
              className="h-11 px-6 rounded-full text-[15px] font-semibold shadow-warm-md transition-all hover:shadow-warm-lg hover:-translate-y-0.5 active:scale-[0.96] active:translate-y-0"
            >
              {t("signupNav")}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="absolute -top-24 -left-24 size-96 rounded-full bg-primary/15 blur-3xl pointer-events-none"
          />
          <div
            aria-hidden
            className="absolute top-32 -right-32 size-[28rem] rounded-full bg-accent/20 blur-3xl pointer-events-none"
          />

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-28 grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-in-rise">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
                <BookOpen className="size-3.5" /> {t("badge")}
              </span>
              <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.05]">
                {t("headlinePrefix")} <span className="text-gradient-brand">{t("headlineHighlight")}</span>{" "}
                {t("headlineSuffix")}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">{t("subtitle")}</p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Button
                  render={<Link href="/signup" />}
                  className="group h-14 px-8 rounded-full gradient-brand text-primary-foreground text-base font-semibold shadow-warm-lg transition-all hover:shadow-[0_16px_40px_-8px_hsl(var(--shadow-color)/0.35)] hover:-translate-y-1 active:scale-[0.97] active:translate-y-0"
                >
                  {t("ctaPrimary")}
                  <ArrowRight className="size-5 transition-transform duration-200 group-hover:translate-x-1.5" />
                </Button>
                <Button
                  render={<Link href="/login" />}
                  variant="outline"
                  className="h-14 px-8 rounded-full border-2 text-base font-semibold transition-all hover:border-primary hover:bg-primary/5 hover:text-primary hover:-translate-y-1 active:scale-[0.97] active:translate-y-0"
                >
                  {t("ctaSecondary")}
                </Button>
              </div>
            </div>

            <div className="relative animate-in-fade flex items-center justify-center">
              <LogoMark className="h-56 sm:h-72 w-auto opacity-95" />
            </div>
          </div>
        </section>

        <section className="border-y bg-secondary/30">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border bg-card p-5 space-y-3 card-interactive"
              >
                <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  <f.icon className="size-5 text-primary" />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-20 text-center space-y-4">
          <div className="mx-auto size-12 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="size-6 text-primary" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold">{t("standardsTitle")}</h2>
          <p className="text-muted-foreground leading-relaxed text-base">{t("standardsBody")}</p>
        </section>

        <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-16 sm:pb-24">
          <div className="relative overflow-hidden rounded-3xl gradient-brand px-6 sm:px-12 py-14 sm:py-16 text-center space-y-5">
            <div
              aria-hidden
              className="absolute -bottom-20 -right-20 size-64 rounded-full bg-white/10 blur-2xl pointer-events-none"
            />
            <h2 className="relative text-2xl sm:text-3xl font-semibold text-primary-foreground">{t("closingTitle")}</h2>
            <p className="relative text-primary-foreground/85 max-w-xl mx-auto leading-relaxed">{t("closingBody")}</p>
            <div className="relative">
              <Button
                render={<Link href="/signup" />}
                className="group h-14 px-8 rounded-full bg-white text-primary text-base font-semibold shadow-[0_12px_32px_-6px_rgba(0,0,0,0.35)] transition-all hover:bg-white/90 hover:shadow-[0_16px_40px_-6px_rgba(0,0,0,0.4)] hover:-translate-y-1 active:scale-[0.97] active:translate-y-0"
              >
                {t("closingCta")}
                <ArrowRight className="size-5 transition-transform duration-200 group-hover:translate-x-1.5" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <LogoLockup size="sm" />
          <p>
            © {new Date().getFullYear()} {tBrand("name")} — {t("footerNote")}
          </p>
        </div>
      </footer>
    </div>
  );
}
