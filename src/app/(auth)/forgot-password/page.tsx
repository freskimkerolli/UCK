import type { Metadata } from "next";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = { title: "Rivendos fjalëkalimin — UÇK Connect" };

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
