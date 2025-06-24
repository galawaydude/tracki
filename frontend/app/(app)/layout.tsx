"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Code2, LayoutDashboard, List, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CircleUser } from "lucide-react"

const NavLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/problems", label: "Problems", icon: List },
]

function NavItem({ href, label, icon: Icon }: { href: string, label: string, icon: React.ElementType }) {
    const pathname = usePathname()
    const isActive = pathname === href
    return (
        <Link href={href}>
            <Button variant={isActive ? "secondary" : "ghost"} className="w-full justify-start">
                <Icon className="mr-2 h-4 w-4" />
                {label}
            </Button>
        </Link>
    )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isClient, setIsClient] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        setIsClient(true);
        const storedToken = localStorage.getItem('access_token');
        setToken(storedToken);

        if (!storedToken) {
            router.push('/login');
        }
    }, [pathname, router]);

    // Render nothing on the server, and a loading state on the client before we have the token
    if (!isClient || !token) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-lg font-semibold">Loading...</div>
            </div>
        );
    }
    
    const handleLogout = () => {
        localStorage.removeItem('access_token');
        router.push('/login');
    };

  return (
    <div className="min-h-screen w-full bg-gray-50">
        <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-white px-4 md:px-6 z-10">
            <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
                <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold md:text-base">
                    <Code2 className="h-6 w-6 text-orange-500" />
                    <span className="sr-only">Tracki</span>
                </Link>
                {NavLinks.map(link => <NavItem key={link.href} {...link} />)}
            </nav>
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left">
                    <nav className="grid gap-6 text-lg font-medium">
                        <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold">
                            <Code2 className="h-6 w-6 text-orange-500" />
                            <span >Tracki</span>
                        </Link>
                        {NavLinks.map(link => <NavItem key={link.href} {...link} />)}
                    </nav>
                </SheetContent>
            </Sheet>
            <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4 justify-end">
                <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                </Button>
            </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            {children}
        </main>
    </div>
  )
} 