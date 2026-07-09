"use client"

import { useState, type ReactNode } from "react"

export interface Tab {
  id: string
  label: string
  content: ReactNode
  badge?: number | string
}

interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
}

/** Blueprint grammar: CAD layer toggles (square + label), not a segmented pill bar. */
export function Tabs({ tabs, defaultTab }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)
  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-border pb-2 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-wide transition-colors ${
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span
                aria-hidden
                className={`h-2 w-2 border ${isActive ? "border-primary bg-primary" : "border-muted-foreground"}`}
              />
              {tab.label}
              {tab.badge !== undefined && (
                <span className={isActive ? "text-primary" : "text-muted-foreground"}>({tab.badge})</span>
              )}
            </button>
          )
        })}
      </div>
      <div className="min-h-[400px]">{activeTabContent}</div>
    </div>
  )
}
