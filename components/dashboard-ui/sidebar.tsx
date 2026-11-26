"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { gsap } from "gsap";
import {
  GraduationCap,
  LayoutDashboard,
  PlusCircle,
  BookOpen,
  Users,
  ClipboardList,
  Heart,
  CreditCard,
  UserRound,
  LogOut,
  type LucideIcon,
} from "lucide-react";

import { useSession, signOut } from "@/lib/auth-client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type UserRole = "student" | "tutor" | "admin";

type MenuItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const menuItemsByRole: Record<UserRole, MenuItem[]> = {
  student: [
    {
      label: "Overview",
      href: "/student-dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "My Applications",
      href: "/student-dashboard/applications",
      icon: ClipboardList,
    },
    {
      label: "Saved Tuitions",
      href: "/student-dashboard/saved",
      icon: Heart,
    },
  ],

  tutor: [
    {
      label: "Overview",
      href: "/tutor-dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Post Tuition",
      href: "/tutor-dashboard/create-tuition",
      icon: PlusCircle,
    },
    {
      label: "My Tuitions",
      href: "/tutor-dashboard/tuitions",
      icon: BookOpen,
    },
    {
      label: "Applicants",
      href: "/tutor-dashboard/applicants",
      icon: Users,
    },
  ],

  admin: [
    {
      label: "Overview",
      href: "/admin-dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Users",
      href: "/admin-dashboard/users",
      icon: Users,
    },
    {
      label: "Tuitions",
      href: "/admin-dashboard/tuitions",
      icon: BookOpen,
    },
    {
      label: "Transactions",
      href: "/admin-dashboard/transactions",
      icon: CreditCard,
    },
  ],
};

function isUserRole(role: unknown): role is UserRole {
  return role === "student" || role === "tutor" || role === "admin";
}

export function DashboardSidebar() {
  const { data: session, isPending } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const sidebarRef = useRef<HTMLDivElement>(null);

  const rawRole = (session?.user as { role?: string } | undefined)?.role;

  const role: UserRole = isUserRole(rawRole) ? rawRole : "student";
  const menuItems = menuItemsByRole[role];

  useEffect(() => {
    if (isPending) return;

    const sidebar = sidebarRef.current;
    if (!sidebar) return;

    const context = gsap.context(() => {
      const logo = sidebar.querySelector(".sidebar-logo");
      const menuItems = sidebar.querySelectorAll(".sidebar-menu-item");

      const timeline = gsap.timeline({
        defaults: {
          ease: "power3.out",
        },
      });

      if (logo) {
        timeline.fromTo(
          logo,
          { opacity: 0, y: -12 },
          { opacity: 1, y: 0, duration: 0.45 }
        );
      }

      if (menuItems.length > 0) {
        timeline.fromTo(
          menuItems,
          { opacity: 0, x: -12 },
          {
            opacity: 1,
            x: 0,
            duration: 0.35,
            stagger: 0.07,
          },
          "-=0.2"
        );
      }
    }, sidebar);

    return () => context.revert();
  }, [isPending, role]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/sign-in");
      router.refresh();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <div ref={sidebarRef} className="h-full">
      <Sidebar className="border-r-0 bg-[#1c0b49] text-[#e8dcff]">
        <SidebarHeader className="bg-[#1c0b49] px-5 pb-6 pt-8">
          <Link
            href="/"
            className="sidebar-logo flex flex-col items-start gap-2 opacity-0"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#d414a6] text-white">
              <GraduationCap className="size-6" />
            </span>

            <span className="text-[25px] font-bold leading-tight tracking-tight">
              Mentor<span className="text-[#ec4bc0]">Lagbe</span>
            </span>
          </Link>
        </SidebarHeader>

        <SidebarContent className="bg-[#1c0b49] px-2">
          <SidebarMenu className="gap-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;

              const isActive =
                pathname === item.href ||
                (item.href !== `/${role}-dashboard` &&
                  pathname.startsWith(`${item.href}/`));

              return (
                <SidebarMenuItem
                  key={item.href}
                  className="sidebar-menu-item opacity-0"
                >
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={isActive}
                    className="h-10 rounded-xl px-3 text-[15px] text-[#e8dcff] hover:bg-[#3c176b] hover:text-white data-[active=true]:bg-[#681da5] data-[active=true]:text-white"
                  >
                    <Icon className="size-[18px]" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="bg-[#1c0b49] px-2 pb-5">
          <SidebarMenu className="gap-1.5">
            <SidebarMenuItem className="sidebar-menu-item opacity-0">
              <SidebarMenuButton
                render={<Link href="/profile" />}
                isActive={pathname === "/profile"}
                className="h-10 rounded-xl px-3 text-[15px] text-[#e8dcff] hover:bg-[#3c176b] hover:text-white data-[active=true]:bg-[#681da5] data-[active=true]:text-white"
              >
                <UserRound className="size-[18px]" />
                <span>Update Profile</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem className="sidebar-menu-item opacity-0">
              <SidebarMenuButton
                onClick={handleSignOut}
                disabled={isPending}
                className="h-10 rounded-xl px-3 text-[15px] text-[#e8dcff] hover:bg-[#3c176b] hover:text-white"
              >
                <LogOut className="size-[18px]" />
                <span>Sign Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </div>
  );
}