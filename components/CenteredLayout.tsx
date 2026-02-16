"use client"

import type React from "react"
import { ThemeToggle } from "@/components/ThemeToggle"

interface CenteredLayoutProps {
  children: React.ReactNode
}

export function CenteredLayout({ children }: CenteredLayoutProps) {
  return (
    <main className="min-h-svh flex flex-col items-center px-4 py-8 bg-secondary/50">
      <div className="max-w-md w-full bg-card rounded-2xl p-6 space-y-6 card-shadow border border-border/50 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        {children}
      </div>
    </main>
  )
}
