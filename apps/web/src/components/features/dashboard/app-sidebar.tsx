"use client";

import * as React from "react";
import { ContactRound, ShieldPlus } from "lucide-react";

import { NavMain } from "@/components/features/dashboard/nav-main";
import { NavUser } from "@/components/features/dashboard/nav-user";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";

const data = {
  navMain: [
    {
      title: "Patients",
      url: "/patients",
      icon: ContactRound,
    },
    /** TODO: Implement this
    {
      title: "AI Agent",
      url: "/agent",
      icon: Bot,
    },
     */
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5 mt-2"
            >
              <Link href="/">
                <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md ">
                  <ShieldPlus className="size-4" />
                </div>
                <span className="font-semibold text-sm">
                  Patient Management System
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user.role === "ADMIN" ? "Admin User" : "General User",
            email: user.email,
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
