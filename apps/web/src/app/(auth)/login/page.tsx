import { LoginForm } from "@/components/features/auth/login-form";
import Link from "next/link";
import Logo from "@/components/features/common/logo";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 bg-background">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <Logo />
        </Link>
        <LoginForm />
      </div>
    </div>
  );
}
