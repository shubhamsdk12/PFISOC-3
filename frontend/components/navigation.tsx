"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function Navigation() {
  const pathname = usePathname()

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/investor", label: "Investor Mode" },
    { href: "/regulator", label: "Regulator Mode" },
    { href: "/admin/replay", label: "Replay Mode" },
  ]

  return (
    <nav className="flex gap-1 bg-esg-card-bg/50 p-1 rounded-lg">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "px-3 py-2 rounded text-sm font-medium transition-colors",
            pathname === link.href
              ? "bg-esg-accent text-black"
              : "text-muted-foreground hover:text-foreground hover:bg-esg-card-bg",
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
