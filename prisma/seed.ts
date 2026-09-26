import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";
import { moderateText } from "../src/lib/moderation";
import { slugify } from "../src/lib/slugify";
import sqMessages from "../messages/sq.json";

// Seed data is fixed Albanian sample content, so moderateText() here is
// always driven by the sq strings directly rather than a request-scoped translator.
function seedT(key: string, params?: Record<string, string | number>): string {
  const raw = (sqMessages.moderation as Record<string, string>)[key] ?? key;
  if (!params) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? ""));
}

const avatar = (seed: string) => `https://i.pravatar.cc/300?u=${seed}`;
const cover = (seed: string) => `https://picsum.photos/seed/${seed}/1200/400`;
const photo = (seed: string) => `https://picsum.photos/seed/${seed}/900/600`;

async function reset() {
  await prisma.$transaction([
    prisma.moderationLog.deleteMany(),
    prisma.moderationAction.deleteMany(),
    prisma.appeal.deleteMany(),
    prisma.report.deleteMany(),
    prisma.savedPost.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.message.deleteMany(),
    prisma.conversationParticipant.deleteMany(),
    prisma.conversation.deleteMany(),
    prisma.commentLike.deleteMany(),
    prisma.comment.deleteMany(),
    prisma.postLike.deleteMany(),
    prisma.postHashtag.deleteMany(),
    prisma.post.deleteMany(),
    prisma.historicalMaterialTag.deleteMany(),
    prisma.event.deleteMany(),
    prisma.historicalMaterial.deleteMany(),
    prisma.communityMember.deleteMany(),
    prisma.community.deleteMany(),
    prisma.hashtag.deleteMany(),
    prisma.follow.deleteMany(),
    prisma.blockedUser.deleteMany(),
    prisma.verificationToken.deleteMany(),
    prisma.passwordResetToken.deleteMany(),
    prisma.userSettings.deleteMany(),
    prisma.profile.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

interface DemoUser {
  key: string;
  username: string;
  email: string;
  displayName: string;
  bio: string;
  location: string;
  website: string;
  role: "USER" | "MODERATOR" | "ADMIN";
}

const DEMO_USERS: DemoUser[] = [
  {
    key: "arben",
    username: "arben_krasniqi",
    email: "arben.krasniqi@demo.uckconnect.al",
    displayName: "Arben Krasniqi",
    bio: "Themelues i UÇK Connect. Duke ruajtur kujtesën kolektive, një dëshmi në herë. Prishtinë.",
    location: "Prishtinë, Kosovë",
    website: "uckconnect.al",
    role: "ADMIN",
  },
  {
    key: "fatlinda",
    username: "fatlinda_hoti",
    email: "fatlinda.hoti@demo.uckconnect.al",
    displayName: "Fatlinda Hoti",
    bio: "Moderatore e komunitetit. Arkiviste në trajnim. Besoj në diskutim civil dhe respekt reciprok.",
    location: "Prizren, Kosovë",
    website: "",
    role: "MODERATOR",
  },
  {
    key: "besnik",
    username: "besnik_gashi",
    email: "besnik.gashi@demo.uckconnect.al",
    displayName: "Besnik Gashi",
    bio: "Veteran. Ndaj kujtime nga vitet '98-'99 për të mos u harruar historia jonë.",
    location: "Gjakovë, Kosovë",
    website: "",
    role: "USER",
  },
  {
    key: "drita",
    username: "drita_morina",
    email: "drita.morina@demo.uckconnect.al",
    displayName: "Drita Morina",
    bio: "Ruaj arkivin familjar — fotografi, letra dhe kujtime nga gjyshi im.",
    location: "Pejë, Kosovë",
    website: "",
    role: "USER",
  },
  {
    key: "valon",
    username: "valon_krasniqi",
    email: "valon.krasniqi@demo.uckconnect.al",
    displayName: "Valon Krasniqi",
    bio: "Student i historisë, Universiteti i Prishtinës. Hulumtoj dokumentacionin e periudhës '90-'99.",
    location: "Mitrovicë, Kosovë",
    website: "",
    role: "USER",
  },
  {
    key: "lirie",
    username: "lirie_berisha",
    email: "lirie.berisha@demo.uckconnect.al",
    displayName: "Lirie Berisha",
    bio: "Familje dëshmori. Këtu për të mbajtur gjallë kujtesën dhe për t'u lidhur me familje të tjera.",
    location: "Drenicë, Kosovë",
    website: "",
    role: "USER",
  },
  {
    key: "blerim",
    username: "blerim_zeqiri",
    email: "blerim.zeqiri@demo.uckconnect.al",
    displayName: "Blerim Zeqiri",
    bio: "Organizator komunitar në Ferizaj. Bashkohu me komunitetin tonë rajonal!",
    location: "Ferizaj, Kosovë",
    website: "",
    role: "USER",
  },
  {
    key: "adelina",
    username: "adelina_bytyqi",
    email: "adelina.bytyqi@demo.uckconnect.al",
    displayName: "Adelina Bytyqi",
    bio: "E re, kurioze për historinë e vendit tim. Mësoj çdo ditë diçka të re nga gjeneratat para meje.",
    location: "Prishtinë, Kosovë",
    website: "",
    role: "USER",
  },
];

async function seedUsers() {
  const passwordHash = await bcrypt.hash("Demo1234", 10);
  const users: Record<string, Awaited<ReturnType<typeof prisma.user.create>>> = {};

  for (const u of DEMO_USERS) {
    const user = await prisma.user.create({
      data: {
        email: u.email,
        username: u.username,
        passwordHash,
        emailVerified: new Date(),
        role: u.role,
        profile: {
          create: {
            displayName: u.displayName,
            bio: u.bio,
            location: u.location,
            website: u.website,
            avatarUrl: avatar(u.key),
            coverUrl: cover(u.key),
          },
        },
        settings: { create: {} },
      },
    });
    users[u.key] = user;
  }

  return users;
}

async function seedFollows(users: Record<string, { id: string }>) {
  const pairs: [string, string][] = [
    ["fatlinda", "arben"],
    ["besnik", "arben"],
    ["drita", "arben"],
    ["valon", "arben"],
    ["lirie", "besnik"],
    ["adelina", "valon"],
    ["adelina", "drita"],
    ["blerim", "fatlinda"],
    ["arben", "besnik"],
    ["arben", "drita"],
    ["drita", "lirie"],
    ["valon", "drita"],
  ];
  await prisma.follow.createMany({
    data: pairs.map(([followerKey, followingKey]) => ({
      followerId: users[followerKey].id,
      followingId: users[followingKey].id,
    })),
  });
}

interface CommunitySeed {
  key: string;
  name: string;
  description: string;
  category: string;
  rules: string;
  ownerKey: string;
  memberKeys: string[];
}

const COMMUNITIES: CommunitySeed[] = [
  {
    key: "veteranet-drenica",
    name: "Veteranët e UÇK-së — Rajoni i Drenicës",
    description:
      "Hapësirë për veteranët e rajonit të Drenicës për t'u lidhur, ndarë kujtime dhe mbështetur njëri-tjetrin.",
    category: "VETERANET",
    rules:
      "1. Respekt reciprok mes anëtarëve.\n2. Ndalohet gjuha fyese ose sulmet personale.\n3. Diskutime historike po, sharje jo.",
    ownerKey: "besnik",
    memberKeys: ["besnik", "arben", "lirie", "valon"],
  },
  {
    key: "familjet-deshmoreve",
    name: "Familjet e Dëshmorëve",
    description: "Komunitet mbështetës për familjet e dëshmorëve — për të ndarë kujtime dhe për t'u lidhur me familje të tjera.",
    category: "FAMILJET",
    rules: "Trajtoni njëri-tjetrin me dinjitet. Ky është hapësirë e sigurt për kujtesë dhe mbështetje.",
    ownerKey: "lirie",
    memberKeys: ["lirie", "drita", "fatlinda", "arben"],
  },
  {
    key: "studiues-historie",
    name: "Studiues të Historisë së Kosovës",
    description: "Për studentë, hulumtues dhe të interesuar në dokumentimin akademik të periudhës '90-'99.",
    category: "STUDIUESIT",
    rules: "Citoni burimet kur është e mundur. Mirëpritet debati civil dhe kritika e bazuar në fakte.",
    ownerKey: "valon",
    memberKeys: ["valon", "adelina", "arben", "fatlinda"],
  },
  {
    key: "arkivistet-vullnetare",
    name: "Arkivistët Vullnetarë",
    description: "Vullnetarë që digjitalizojnë dhe organizojnë materiale historike familjare e komunitare.",
    category: "ARKIVISTET",
    rules: "Verifikoni burimin përpara se ta kontribuoni. Etiketoni qartë materialet e paverifikuara.",
    ownerKey: "drita",
    memberKeys: ["drita", "fatlinda", "valon"],
  },
  {
    key: "komuniteti-gjakoves",
    name: "Komuniteti i Gjakovës",
    description: "Komunitet rajonal për banorët dhe të interesuarit për historinë dhe të tashmen e Gjakovës.",
    category: "RAJONI",
    rules: "Mbani diskutimin lokal, respektoni njëri-tjetrin.",
    ownerKey: "besnik",
    memberKeys: ["besnik", "blerim", "adelina"],
  },
];

async function seedCommunities(users: Record<string, { id: string }>) {
  const communities: Record<string, { id: string; slug: string }> = {};
  for (const c of COMMUNITIES) {
    const community = await prisma.community.create({
      data: {
        slug: slugify(c.name),
        name: c.name,
        description: c.description,
        category: c.category,
        rules: c.rules,
        coverUrl: cover(c.key),
        logoUrl: avatar(`logo-${c.key}`),
        createdById: users[c.ownerKey].id,
        members: {
          create: c.memberKeys.map((k) => ({
            userId: users[k].id,
            role: k === c.ownerKey ? "OWNER" : "MEMBER",
          })),
        },
      },
    });
    communities[c.key] = community;
  }
  return communities;
}

async function upsertHashtags(tags: string[]) {
  const map: Record<string, string> = {};
  for (const tag of tags) {
    const h = await prisma.hashtag.upsert({ where: { tag }, update: {}, create: { tag } });
    map[tag] = h.id;
  }
  return map;
}

interface PostSeed {
  authorKey: string;
  content: string;
  communityKey?: string;
  mediaType?: "PHOTO" | "VIDEO" | "DOCUMENT";
  mediaSeed?: string;
  documentName?: string;
  locationLabel?: string;
  hashtags?: string[];
  daysAgo: number;
}

const POSTS: PostSeed[] = [
  {
    authorKey: "besnik",
    content:
      "Sot, shumë vite më vonë, ende më kujtohet çdo detaj i asaj mbrëmjeje kur u bashkuam me shokët e parë të armëtimit. Ndajmë historinë që të mos harrohet asnjëherë. #histori #kujtese",
    locationLabel: "Gjakovë, Kosovë",
    hashtags: ["histori", "kujtese"],
    daysAgo: 6,
  },
  {
    authorKey: "drita",
    content:
      "Duke rregulluar arkivin e gjyshit tim gjeta këto fotografi nga fillimi i viteve '90. Do t'i kontribuoj në Arkivin Historik gjatë javës. #arkivi #familja",
    mediaType: "PHOTO",
    mediaSeed: "archive-photos-1",
    hashtags: ["arkivi", "familja"],
    daysAgo: 5,
  },
  {
    authorKey: "valon",
    content:
      "Diskutim i hapur: si mendoni që duhet dokumentuar periudha '96-'99 për brezat e ardhshëm — më shumë përmes dëshmive gojore apo dokumenteve zyrtare? Interesohem për mendimin tuaj si komunitet. #diskutim #historia",
    communityKey: "studiues-historie",
    hashtags: ["diskutim", "historia"],
    daysAgo: 5,
  },
  {
    authorKey: "lirie",
    content:
      "Sot është përvjetori i lindjes së vëllait tim. E ndaj këtë kujtim me krenari dhe dashuri të pafund. Faleminderit të gjithëve që na mbani shoqëri në këtë udhëtim kujtese. 🕊️",
    communityKey: "familjet-deshmoreve",
    daysAgo: 4,
  },
  {
    authorKey: "arben",
    content:
      "Mirë se vini në UÇK Connect! Ky është hapësira jonë e përbashkët për histori, kujtesë dhe komunitet. Ju lutem lexoni rregullat e komunitetit dhe silluni me respekt ndaj njëri-tjetrit dhe ndaj historisë sonë. #mireseerdhe",
    hashtags: ["mireseerdhe"],
    daysAgo: 10,
  },
  {
    authorKey: "fatlinda",
    content:
      "Kam ngarkuar një dokument të digjitalizuar nga arkivi komunitar — një letër personale nga viti 1998. E kam etiketuar si e paverifikuar deri sa të konfirmohet origjina e saktë.",
    mediaType: "DOCUMENT",
    documentName: "Letër personale, 1998 (e paverifikuar).pdf",
    daysAgo: 4,
  },
  {
    authorKey: "blerim",
    content: "Java e ardhshme organizojmë një takim të komunitetit të Gjakovës për të diskutuar bashkëpunimin me arkivin qytetar. Kush është i interesuar?",
    communityKey: "komuniteti-gjakoves",
    locationLabel: "Qendra Kulturore, Gjakovë",
    daysAgo: 3,
  },
  {
    authorKey: "adelina",
    content:
      "Si student e historisë, gjithmonë më prek kur dëgjoj dëshmi direkte nga njerëz që e kanë jetuar atë periudhë. Faleminderit të gjithëve që ndani kujtimet tuaja këtu — na ndihmoni ta kuptojmë historinë më mirë. #dëshmi",
    hashtags: ["deshmi"],
    daysAgo: 3,
  },
  {
    authorKey: "besnik",
    content:
      "Dje pata rastin të flas me disa të rinj rreth përvojave tona. Është e rëndësishme që gjenerata e re ta njohë historinë drejtpërdrejt nga ne, jo vetëm nga librat.",
    communityKey: "veteranet-drenica",
    daysAgo: 2,
  },
  {
    authorKey: "valon",
    content:
      "Sapo publikova një material të ri në Arkivin Historik — një intervistë e regjistruar me një dëshmitar nga rajoni i Drenicës. Ju lutem shikojeni dhe jepni komente konstruktive.",
    daysAgo: 2,
  },
  {
    authorKey: "drita",
    content: "Foto nga arkivi familjar — dasma e prindërve të mi, pak muaj para se gjithçka të ndryshonte. #kujtese #familja",
    mediaType: "PHOTO",
    mediaSeed: "family-wedding-archive",
    hashtags: ["kujtese", "familja"],
    daysAgo: 1,
  },
  {
    authorKey: "lirie",
    content:
      "Dua të falenderoj këtë komunitet për mbështetjen e vazhdueshme. Nuk jam vetëm kur ndaj kujtimet e mia këtu. Faleminderit UÇK Connect!",
    daysAgo: 1,
  },
  {
    authorKey: "adelina",
    content:
      "Pyetje për komunitetin: cilat libra ose dokumentarë do të rekomandonit për dikë që sapo po fillon të mësojë për historinë e UÇK-së? #historia #burime",
    hashtags: ["historia", "burime"],
    daysAgo: 1,
  },
  {
    authorKey: "blerim",
    content:
      "Nuk pajtohem plotësisht me interpretimin e ngjarjeve të vitit 1998 që u prezantua në dokumentarin e fundit — mendoj se i mungojnë disa burime të rëndësishme lokale. Le të diskutojmë me argumente, jo me sulme.",
    daysAgo: 0,
  },
  {
    authorKey: "besnik",
    content:
      "Kjo qeveri korruptive dhe budallenj e ka lënë pas dore financimin e arkivit kombëtar — turp!!!",
    daysAgo: 0,
  },
];

async function seedPosts(
  users: Record<string, { id: string }>,
  communities: Record<string, { id: string }>,
) {
  const createdPosts: { id: string; authorKey: string; content: string }[] = [];

  for (const p of POSTS) {
    const verdict = moderateText(p.content, seedT);
    const moderationStatus = verdict.action === "BLOCK" ? "BLOCKED" : verdict.action === "WARNING" ? "PENDING_REVIEW" : "PUBLISHED";
    const createdAt = new Date(Date.now() - p.daysAgo * 24 * 60 * 60 * 1000);

    const post = await prisma.post.create({
      data: {
        authorId: users[p.authorKey].id,
        content: p.content,
        mediaType: p.mediaType ?? null,
        mediaUrls: JSON.stringify(p.mediaType === "PHOTO" ? [photo(p.mediaSeed ?? "demo")] : []),
        documentName: p.documentName,
        locationLabel: p.locationLabel,
        communityId: p.communityKey ? communities[p.communityKey].id : null,
        moderationStatus,
        moderationCategory: verdict.category,
        moderationReason: verdict.reason,
        createdAt,
        updatedAt: createdAt,
      },
    });

    if (p.hashtags?.length) {
      const tagMap = await upsertHashtags(p.hashtags);
      await prisma.postHashtag.createMany({
        data: p.hashtags.map((t) => ({ postId: post.id, hashtagId: tagMap[t] })),
      });
    }

    if (verdict.action !== "ALLOW") {
      await prisma.moderationLog.create({
        data: {
          moderatorId: null,
          action: verdict.action === "BLOCK" ? "AUTO_BLOCK_POST" : "AUTO_FLAG_POST_FOR_REVIEW",
          targetType: "POST",
          targetId: post.id,
          reason: verdict.reason,
          createdAt,
        },
      });
    }

    createdPosts.push({ id: post.id, authorKey: p.authorKey, content: p.content });
  }

  return createdPosts;
}

async function seedEngagement(
  users: Record<string, { id: string }>,
  posts: { id: string; authorKey: string }[],
) {
  const userKeys = Object.keys(users);

  // Likes: a handful of random-ish but deterministic likes
  for (const post of posts) {
    const likers = userKeys.filter((k) => k !== post.authorKey).slice(0, 3);
    await prisma.postLike.createMany({
      data: likers.map((k) => ({ postId: post.id, userId: users[k].id })),
    });
  }

  // Comments on the first few posts
  const commentSeeds: { postIndex: number; authorKey: string; content: string; replyToAuthor?: string }[] = [
    { postIndex: 0, authorKey: "drita", content: "Faleminderit që e ndave këtë, Besnik. Historia jote na frymëzon." },
    { postIndex: 0, authorKey: "adelina", content: "Shumë prekëse. A ke menduar ta kontribuosh si dëshmi në Arkivin Historik?" },
    { postIndex: 1, authorKey: "fatlinda", content: "Fotografi të mrekullueshme! Mezi presim t'i shohim në arkiv." },
    { postIndex: 2, authorKey: "arben", content: "Mendoj se kombinimi i të dyjave është më i forti — dëshmitë japin zë njerëzor, dokumentet japin kontekst zyrtar." },
    { postIndex: 2, authorKey: "adelina", content: "Pajtohem plotësisht me Arben." },
    { postIndex: 3, authorKey: "besnik", content: "Të fala nga zemra, Lirie. Kujtesa e tij jeton përmes nesh." },
  ];

  const createdComments: { id: string; postId: string }[] = [];
  for (const c of commentSeeds) {
    const post = posts[c.postIndex];
    const verdict = moderateText(c.content, seedT);
    const comment = await prisma.comment.create({
      data: {
        postId: post.id,
        authorId: users[c.authorKey].id,
        content: c.content,
        moderationStatus: verdict.action === "BLOCK" ? "BLOCKED" : verdict.action === "WARNING" ? "PENDING_REVIEW" : "PUBLISHED",
        moderationCategory: verdict.category,
      },
    });
    createdComments.push({ id: comment.id, postId: post.id });
  }

  // A reply to the first comment
  await prisma.comment.create({
    data: {
      postId: createdComments[0].postId,
      parentId: createdComments[0].id,
      authorId: users.besnik.id,
      content: "Faleminderit Drita! Po, e kam në plan ta ndaj si dëshmi të plotë së shpejti.",
      moderationStatus: "PUBLISHED",
      moderationCategory: "SAFE",
    },
  });

  await prisma.commentLike.createMany({
    data: [
      { commentId: createdComments[0].id, userId: users.arben.id },
      { commentId: createdComments[3].id, userId: users.fatlinda.id },
    ],
  });

  await prisma.savedPost.createMany({
    data: [
      { userId: users.arben.id, postId: posts[1].id },
      { userId: users.adelina.id, postId: posts[2].id },
      { userId: users.adelina.id, postId: posts[9].id },
    ],
  });
}

interface MaterialSeed {
  key: string;
  title: string;
  description: string;
  type: string;
  eventDate: string;
  location: string;
  source: string;
  author: string;
  contributorKey: string;
  mediaSeed?: string;
  verificationStatus: "VERIFIED" | "UNVERIFIED" | "DISPUTED";
  tags: string[];
}

const MATERIALS: MaterialSeed[] = [
  {
    key: "photo-1",
    title: "Fotografi familjare, fillimi i viteve '90",
    description:
      "Fotografi e kontribuar nga arkivi personal i familjes Morina, e ruajtur për brezat e ardhshëm. Data dhe rrethanat e sakta janë ende në verifikim e sipër.",
    type: "PHOTO",
    eventDate: "rreth 1991",
    location: "Pejë, Kosovë",
    source: "Arkivi familjar Morina",
    author: "Drita Morina (kontribuese)",
    contributorKey: "drita",
    mediaSeed: "material-photo-1",
    verificationStatus: "UNVERIFIED",
    tags: ["familja", "arkivi"],
  },
  {
    key: "testimony-1",
    title: "Dëshmi: Kujtime nga periudha e mobilizimit të parë",
    description:
      "Dëshmi gojore e regjistruar nga një veteran i rajonit të Drenicës, mbi përvojat personale gjatë periudhës së organizimit të parë. Dëshmia pasqyron kujtimin personal të kontribuesit dhe nuk përfaqëson domosdoshmërisht pikëpamjen zyrtare historike.",
    type: "TESTIMONY",
    eventDate: "1997-1998",
    location: "Drenicë, Kosovë",
    source: "Regjistrim personal, kontribuar nga dëshmitari",
    author: "Besnik Gashi",
    contributorKey: "besnik",
    verificationStatus: "UNVERIFIED",
    tags: ["deshmi", "veteran"],
  },
  {
    key: "document-1",
    title: "Letër personale e digjitalizuar, 1998",
    description:
      "Letër personale nga arkivi komunitar, e digjitalizuar për ruajtje. Origjina dhe autenticiteti i plotë janë duke u shqyrtuar nga ekipi i arkivistëve.",
    type: "DOCUMENT",
    eventDate: "1998",
    location: "E panjohur",
    source: "Arkivi komunitar",
    author: "I panjohur",
    contributorKey: "fatlinda",
    verificationStatus: "DISPUTED",
    tags: ["dokument"],
  },
  {
    key: "interview-1",
    title: "Intervistë: Jeta e përditshme gjatë periudhës së luftës",
    description:
      "Intervistë e regjistruar për projektin e historisë gojore të komunitetit, me fokus në përvojat e përditshme të civilëve gjatë periudhës së konfliktit.",
    type: "INTERVIEW",
    eventDate: "1999",
    location: "Mitrovicë, Kosovë",
    source: "Projekti i Historisë Gojore — UÇK Connect",
    author: "Valon Krasniqi (hulumtues)",
    contributorKey: "valon",
    verificationStatus: "VERIFIED",
    tags: ["intervista", "historia"],
  },
  {
    key: "biography-1",
    title: "Biografi: Kontribues anonim i lëvizjes çlirimtare",
    description:
      "Biografi e shkurtër, e kontribuar nga familja, mbi jetën e një pjesëtari të lëvizjes. Detajet janë siguruar nga familja dhe janë subjekt verifikimi shtesë.",
    type: "BIOGRAPHY",
    eventDate: "1970-1999",
    location: "Gjakovë, Kosovë",
    source: "Kontribut familjar",
    author: "Lirie Berisha (familja)",
    contributorKey: "lirie",
    verificationStatus: "UNVERIFIED",
    tags: ["biografi", "familja"],
  },
  {
    key: "event-photo-1",
    title: "Fotografi: Tubim komunitar pas lirisë",
    description: "Fotografi nga një tubim publik i komunitetit në muajt pas përfundimit të konfliktit, e dokumentuar për arkivin qytetar.",
    type: "PHOTO",
    eventDate: "korrik 1999",
    location: "Prishtinë, Kosovë",
    source: "Arkivi qytetar i Prishtinës",
    author: "Arben Krasniqi (kontribues)",
    contributorKey: "arben",
    mediaSeed: "material-photo-2",
    verificationStatus: "VERIFIED",
    tags: ["ngjarje", "prishtina"],
  },
  {
    key: "document-2",
    title: "Dokument administrativ i digjitalizuar",
    description: "Dokument administrativ lokal i periudhës, i kontribuar për qëllime dokumentimi historik nga arkivistët vullnetarë.",
    type: "DOCUMENT",
    eventDate: "1996",
    location: "Ferizaj, Kosovë",
    source: "Arkivi lokal i Ferizajt",
    author: "I panjohur",
    contributorKey: "blerim",
    verificationStatus: "UNVERIFIED",
    tags: ["dokument", "ferizaj"],
  },
  {
    key: "video-1",
    title: "Video: Dëshmi e shkurtër komunitare",
    description: "Video e shkurtër e regjistruar për projektin e ruajtjes së kujtesës kolektive të komunitetit.",
    type: "VIDEO",
    eventDate: "2023 (regjistrim i kujtimeve)",
    location: "Prizren, Kosovë",
    source: "Projekti UÇK Connect — Ruajtja e Kujtesës",
    author: "Fatlinda Hoti (moderatore, regjistrim)",
    contributorKey: "fatlinda",
    verificationStatus: "VERIFIED",
    tags: ["video", "kujtese"],
  },
];

async function seedArchive(users: Record<string, { id: string }>) {
  const materials: Record<string, { id: string }> = {};
  for (const m of MATERIALS) {
    const material = await prisma.historicalMaterial.create({
      data: {
        title: m.title,
        description: m.description,
        type: m.type,
        eventDate: m.eventDate,
        location: m.location,
        source: m.source,
        author: m.author,
        contributorId: users[m.contributorKey].id,
        mediaUrl: m.mediaSeed ? photo(m.mediaSeed) : "",
        verificationStatus: m.verificationStatus,
      },
    });
    if (m.tags.length) {
      const tagMap = await upsertHashtags(m.tags);
      await prisma.historicalMaterialTag.createMany({
        data: m.tags.map((t) => ({ materialId: material.id, hashtagId: tagMap[t] })),
      });
    }
    materials[m.key] = material;
  }
  return materials;
}

async function seedTimeline(users: Record<string, { id: string }>, materials: Record<string, { id: string }>) {
  const events = [
    {
      title: "Fillimi i organizimit publik",
      description: "Periudha kur aktiviteti i lëvizjes çlirimtare filloi të bëhet gradualisht i njohur publikisht.",
      eventDate: "1996",
      location: "Kosovë",
      materialKey: undefined,
    },
    {
      title: "Intensifikimi i konfliktit",
      description: "Periudhë e përshkallëzimit të konfliktit të armatosur në disa rajone të Kosovës.",
      eventDate: "1998",
      location: "Drenicë dhe rajone të tjera",
      materialKey: "testimony-1" as const,
    },
    {
      title: "Fillimi i ndërhyrjes së NATO-s",
      description: "Fillimi i fushatës ajrore të NATO-s, siç raportohet gjerësisht në burime publike ndërkombëtare.",
      eventDate: "Mars 1999",
      location: "Kosovë dhe rajoni",
      materialKey: undefined,
    },
    {
      title: "Përfundimi i konfliktit dhe hyrja e forcave paqeruajtëse",
      description: "Nënshkrimi i marrëveshjes që shënoi përfundimin e konfliktit dhe vendosjen e forcave paqeruajtëse ndërkombëtare, siç dokumentohet gjerësisht publikisht.",
      eventDate: "Qershor 1999",
      location: "Kumanovë / Kosovë",
      materialKey: "event-photo-1" as const,
    },
    {
      title: "Rindërtimi dhe periudha e para-pasluftës",
      description: "Fillimi i periudhës së rindërtimit dhe kthimit të popullsisë së zhvendosur.",
      eventDate: "1999-2000",
      location: "Kosovë",
      materialKey: undefined,
    },
  ];

  for (const e of events) {
    await prisma.event.create({
      data: {
        title: e.title,
        description: e.description,
        eventDate: e.eventDate,
        location: e.location,
        materialId: e.materialKey ? materials[e.materialKey].id : null,
        createdById: users.arben.id,
      },
    });
  }
}

async function seedMessaging(users: Record<string, { id: string }>) {
  const conversation = await prisma.conversation.create({
    data: {
      participants: { create: [{ userId: users.arben.id }, { userId: users.besnik.id }] },
    },
  });

  const now = Date.now();
  await prisma.message.createMany({
    data: [
      { conversationId: conversation.id, senderId: users.arben.id, content: "Përshëndetje Besnik! Faleminderit për dëshminë që kontribuove.", createdAt: new Date(now - 1000 * 60 * 60 * 5) },
      { conversationId: conversation.id, senderId: users.besnik.id, content: "S'ka përse Arben, gëzohem që ka një hapësirë të tillë për ne.", createdAt: new Date(now - 1000 * 60 * 60 * 4) },
      { conversationId: conversation.id, senderId: users.arben.id, content: "A do ishe i interesuar të kontribuosh edhe një intervistë video?", createdAt: new Date(now - 1000 * 60 * 30) },
    ],
  });

  const conversation2 = await prisma.conversation.create({
    data: {
      participants: { create: [{ userId: users.adelina.id }, { userId: users.valon.id }] },
    },
  });
  await prisma.message.createMany({
    data: [
      { conversationId: conversation2.id, senderId: users.adelina.id, content: "Përshëndetje Valon, pashë intervistën që publikove — shumë interesante!", createdAt: new Date(now - 1000 * 60 * 60 * 2) },
      { conversationId: conversation2.id, senderId: users.valon.id, content: "Faleminderit Adelina! Do publikoj edhe një tjetër javën e ardhshme.", createdAt: new Date(now - 1000 * 60 * 60) },
    ],
  });
}

async function seedNotifications(users: Record<string, { id: string }>, posts: { id: string }[]) {
  await prisma.notification.createMany({
    data: [
      { userId: users.arben.id, actorId: users.fatlinda.id, type: "FOLLOW", isRead: false },
      { userId: users.arben.id, actorId: users.besnik.id, type: "LIKE", postId: posts[4].id, isRead: false },
      { userId: users.drita.id, actorId: users.fatlinda.id, type: "COMMENT", postId: posts[1].id, isRead: true },
      { userId: users.besnik.id, actorId: users.drita.id, type: "COMMENT", postId: posts[0].id, isRead: false },
    ],
  });
}

async function seedReportsAndAppeals(users: Record<string, { id: string }>, posts: { id: string; authorKey: string }[]) {
  // A pending report on the "budallenj" post for the admin queue
  const target = posts.find((p) => p.authorKey === "besnik" && posts.indexOf(p) === posts.length - 1);
  if (target) {
    await prisma.report.create({
      data: {
        reporterId: users.adelina.id,
        postId: target.id,
        reason: "OFENSE",
        description: "Gjuhë e ashpër ndaj institucioneve, mendoj se duhet shqyrtuar.",
        status: "PENDING",
      },
    });

    // The author appeals the auto-block of the same post
    const post = await prisma.post.findUnique({ where: { id: target.id } });
    if (post?.moderationStatus === "BLOCKED") {
      await prisma.appeal.create({
        data: {
          userId: users.besnik.id,
          targetType: "POST",
          targetId: target.id,
          contentSnapshot: post.content,
          reason: "Kritika ime ishte e drejtuar ndaj politikave financiare të qeverisë, jo sulm personal ndaj dikujt. Ju lutem rishikoni.",
          status: "PENDING",
        },
      });
    }
  }
}

async function main() {
  console.log("Resetting database...");
  await reset();

  console.log("Seeding users...");
  const users = await seedUsers();

  console.log("Seeding follows...");
  await seedFollows(users);

  console.log("Seeding communities...");
  const communities = await seedCommunities(users);

  console.log("Seeding posts...");
  const posts = await seedPosts(users, communities);

  console.log("Seeding engagement (likes/comments/saves)...");
  await seedEngagement(users, posts);

  console.log("Seeding historical archive...");
  const materials = await seedArchive(users);

  console.log("Seeding timeline events...");
  await seedTimeline(users, materials);

  console.log("Seeding messaging...");
  await seedMessaging(users);

  console.log("Seeding notifications...");
  await seedNotifications(users, posts);

  console.log("Seeding reports & appeals...");
  await seedReportsAndAppeals(users, posts);

  console.log("\nDone. Demo accounts (password for all: Demo1234):");
  for (const u of DEMO_USERS) {
    console.log(`  ${u.email}  (@${u.username})  [${u.role}]`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
