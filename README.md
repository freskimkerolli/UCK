# UÇK Connect

Platformë sociale moderne e dedikuar historisë, kujtesës, dokumentimit dhe komunitetit rreth
Ushtrisë Çlirimtare të Kosovës (UÇK). Kombinon një rrjet social, një arkiv historik, komunitete
tematike, mesazhe private dhe një sistem moderimi AI + njerëzor, ndërtuar mbi Next.js.

> Shih [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) për arkitekturën e plotë, rrjedhat e
> përdoruesit, skemën e bazës së të dhënave, strukturën e komponentëve dhe rrjedhat e
> autentikimit/moderimit/adminit.

## Stack

- **Next.js 16** (App Router, Turbopack, Server Actions)
- **React 19**, **TypeScript**, **Tailwind CSS v4**, **shadcn/ui** (mbi Base UI)
- **Prisma 7** + **SQLite** (lokale, zero-config — lehtë e zëvendësueshme me Postgres)
- **Auth.js (NextAuth v5)** me Credentials provider, JWT sessions
- **next-intl** (shqip si gjuhë parazgjedhur, skeletuar për shtim gjuhësh)
- **next-themes** (light/dark mode)

## Fillimi i shpejtë

```bash
npm install
npx prisma migrate dev     # krijon dev.db dhe skemën (bëhet automatikisht nga npm install nëse mungon)
npx tsx prisma/seed.ts     # mbush bazën me të dhëna demo realiste në shqip
npm run dev
```

Hap [http://localhost:3000](http://localhost:3000).

### Llogari demo

Të gjitha llogaritë demo përdorin fjalëkalimin **`Demo1234`**:

| Email | Username | Rol |
|---|---|---|
| arben.krasniqi@demo.uckconnect.al | @arben_krasniqi | Admin |
| fatlinda.hoti@demo.uckconnect.al | @fatlinda_hoti | Moderator |
| besnik.gashi@demo.uckconnect.al | @besnik_gashi | User (veteran) |
| drita.morina@demo.uckconnect.al | @drita_morina | User (arkiviste) |
| valon.krasniqi@demo.uckconnect.al | @valon_krasniqi | User (studiues) |
| lirie.berisha@demo.uckconnect.al | @lirie_berisha | User (familje dëshmori) |
| blerim.zeqiri@demo.uckconnect.al | @blerim_zeqiri | User (organizator komuniteti) |
| adelina.bytyqi@demo.uckconnect.al | @adelina_bytyqi | User (studente) |

Provo `/admin` me llogarinë e Arbenit për të parë raportimet, përmbajtjen e flaguar nga AI, dhe
apelimin e para-mbushur.

## Shënim mbi "dërgimin" e email-eve

Nuk ka ofrues email të konfiguruar në këtë mjedis. Verifikimi i email-it dhe rivendosja e
fjalëkalimit funksionojnë plotësisht, por në vend të një email-i real, linku shfaqet direkt në UI
(`src/lib/mail.ts`) — thjesht zëvendëso atë modul me një ofrues real (Resend, SES, etj.) kur të
jenë gati kredencialet.

## Skriptet

- `npm run dev` — server zhvillimi (Turbopack)
- `npm run build` / `npm run start` — build + server prodhimi
- `npm run lint` — ESLint
- `npx prisma studio` — UI për të parë/ndryshuar bazën e të dhënave
- `npx tsx prisma/seed.ts` — rimbush bazën me të dhëna demo (fshin çdo gjë ekzistuese fillimisht)
