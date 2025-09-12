"use client";

import Logo from "@/components/features/common/logo";

export default function FullScreenLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <Logo />
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary"
          aria-label="Loading"
        />
      </div>
    </div>
  );
}
