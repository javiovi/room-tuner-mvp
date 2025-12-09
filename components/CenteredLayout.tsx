"use client"

import type React from "react"

interface CenteredLayoutProps {
  children: React.ReactNode
}

export function CenteredLayout({ children }: CenteredLayoutProps) {
  return (
    <main className="min-h-svh flex flex-col items-center px-4 py-6 bg-background grid-pattern">
      <div
        className="max-w-md w-full border-primary bg-card p-6 space-y-6 glow-border"
        style={{ borderWidth: "3px", borderStyle: "solid" }}
      >
        {/* Terminal header bar */}
        <div className="flex items-center gap-2 pb-4 border-b-2 border-primary/30">
          <div className="w-3 h-3 bg-destructive border border-black"></div>
          <div className="w-3 h-3 bg-yellow-400 border border-black"></div>
          <div className="w-3 h-3 bg-primary border border-black"></div>
          <span className="ml-2 text-xs text-muted-foreground uppercase tracking-wider">RoomTuner v1.0</span>
        </div>
        {children}
      </div>
    </main>
  )
}
