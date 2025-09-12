"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

import { ModeToggle } from "@/components/features/common/mode-toggle";
import FullScreenLoader from "@/components/features/common/full-screen-loader";
import { AppSidebar } from "@/components/features/dashboard/app-sidebar";
import { PatientBreadcrumbs } from "@/components/features/dashboard/patient-breadcrumbs";
import { CreatePatientModal } from "@/components/features/dashboard/create-patient-modal";

import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { token, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!token) {
      router.replace("/login");
    }
  }, [token, isLoading, router]);

  if (isLoading || !user) {
    return <FullScreenLoader />;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4 min-w-0">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <PatientBreadcrumbs />
          </div>
          <div className="px-4 flex-shrink-0 flex items-center gap-2">
            <CreatePatientModal />
            <ModeToggle />
          </div>
        </header>
        <div className="flex-1 overflow-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
