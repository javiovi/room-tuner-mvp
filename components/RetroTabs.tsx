"use client"

import { useState, ReactNode } from "react"

export interface Tab {
  id: string
  label: string
  content: ReactNode
  badge?: number | string
}

interface RetroTabsProps {
  tabs: Tab[]
  defaultTab?: string
}

export function RetroTabs({ tabs, defaultTab }: RetroTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-1 overflow-x-auto pb-2 bg-muted rounded-xl p-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-shrink-0 px-4 py-2 text-xs font-medium rounded-lg transition-all
                ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }
              `}
            >
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`ml-2 px-1.5 py-0.5 text-[10px] font-medium rounded-full ${
                    isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTabContent}
      </div>
    </div>
  )
}
