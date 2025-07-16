import Link from "next/link";
import { BookMarked } from "lucide-react";
import { AuthButton } from "./auth-button";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center space-x-2">
          <BookMarked className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline text-lg">Ecstatic Dissolve</span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <Button asChild variant="ghost">
            <Link href="/submit">Submit Resource</Link>
          </Button>
          <ThemeToggle />
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
