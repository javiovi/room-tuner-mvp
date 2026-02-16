"use client"

import type React from "react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { LanguageToggle } from "@/components/LanguageToggle"

interface CenteredLayoutProps {
  children: React.ReactNode
}

export function CenteredLayout({ children }: CenteredLayoutProps) {
  return (
    <main className="min-h-svh flex flex-col items-center px-4 py-8 bg-secondary/50">
      <div className="max-w-md w-full bg-card rounded-2xl p-6 card-shadow border border-border/50">
        <div className="flex justify-end mb-2">
          <ThemeToggle />
        </div>
        <div className="space-y-6">
          {children}
        </div>
        <div className="flex justify-center mt-4">
          <LanguageToggle />
        </div>
      </div>
    </main>
  )
}
