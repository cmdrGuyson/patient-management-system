import Logo from "@/components/features/common/logo";
import { Button } from "@/components/ui/button";
import { ShieldPlus } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col row-start-2 items-center justify-center ">
        <Logo />

        <div className="flex gap-4 items-center flex-col sm:flex-row mt-12">
          <Link href="/patients">
            <Button>Get Started</Button>
          </Link>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 text-sm"
          href="https://www.guyson.xyz"
          target="_blank"
          rel="noopener noreferrer"
        >
          Made with ❤️ by a Gayanga Kuruppu
        </a>
      </footer>
    </div>
  );
}
