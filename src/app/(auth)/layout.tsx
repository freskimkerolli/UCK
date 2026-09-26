import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LogoLockup } from "@/components/brand/logo";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("auth");
  const tBrand = await getTranslations("brand");

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-primary text-primary-foreground p-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(circle_at_20%_20%,white,transparent_35%),radial-gradient(circle_at_80%_60%,white,transparent_30%)]" />
        <Link href="/" className="relative z-10">
          <LogoLockup size="md" className="text-primary-foreground [&_span]:text-primary-foreground" />
        </Link>
        <div className="relative z-10 space-y-4 max-w-md">
          <h2 className="text-3xl font-semibold leading-tight">{t("promoHeadline")}</h2>
          <p className="text-primary-foreground/85 text-sm leading-relaxed">{t("promoBody")}</p>
        </div>
        <p className="relative z-10 text-xs text-primary-foreground/70">
          © {new Date().getFullYear()} {tBrand("name")} — {t("promoFooter")}
        </p>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm animate-in-rise">
          <Link href="/" className="lg:hidden mb-8 flex justify-center">
            <LogoLockup size="md" />
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
