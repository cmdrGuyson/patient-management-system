"use client";

import * as React from "react";
import { Bot, ContactRound, ShieldPlus } from "lucide-react";

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

const data = {
  user: {
    name: "Gayanga Kuruppu",
    email: "gayanga@email.com",
    avatar:
      "https://ui-avatars.com/api/?background=0D8ABC&name=Gayanga+Kuruppu",
  },
  navMain: [
    {
      title: "Patients",
      url: "/patients",
      icon: ContactRound,
    },
    {
      title: "AI Agent",
      url: "/agent",
      icon: Bot,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
