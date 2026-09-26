import type { Metadata } from "next";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = { title: "Regjistrohu — UÇK Connect" };

export default function SignupPage() {
  return <SignupForm />;
}
