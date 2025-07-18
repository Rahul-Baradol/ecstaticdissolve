"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutDashboard, LogOut, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";


export function AuthButton() {
  const router = useRouter();
  const [user, setUser] = useState<null | { email: string; name: string; image?: string }>(null);

  useEffect(() => {
    fetch("/api/auth/me", {
      method: "GET",
      credentials: "include",
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setUser(data);
      });

  }, []);

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    router.push("/");
  };

  const handleDashboardClick = () => {
    router.push("/dashboard");
  };

  if (!user) {
    return (
      <Button asChild>
        <Link href="/join">Join</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback>
              {user.email ? user.email.charAt(0).toUpperCase() : <UserIcon />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDashboardClick} className="cursor-pointer">
          <LayoutDashboard className="mr-2 h-4 w-4" />
          <span>Dashboard</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
