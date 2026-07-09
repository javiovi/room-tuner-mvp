"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ChevronLeft } from "lucide-react"
import { CenteredLayout } from "@/components/CenteredLayout"
import { Button } from "@/components/Button"
import { OptionCard } from "@/components/OptionCard"
import { InfoCallout } from "@/components/InfoCallout"
import { useRoomStore } from "@/lib/roomStore"
import { useT } from "@/lib/i18n"
import {
  Armchair,
  Circle,
  BookOpen,
  DoorClosed,
  Archive,
  Monitor,
  Square,
  Radio,
  BedDouble,
  Flower2,
  Music,
  Grid2X2,
  type LucideIcon
} from "lucide-react"

interface FurnitureItem {
  id: string
  labelKey: keyof typeof import("@/lib/translations/es").es.muebles
  Icon: LucideIcon
}

interface FurnitureCategory {
  categoryKey: "seating" | "storage" | "workStudy" | "other"
  items: FurnitureItem[]
}

const furnitureOptions: FurnitureCategory[] = [
  {
    categoryKey: "seating",
    items: [
      { id: "sofa", labelKey: "sofa", Icon: Armchair },
      { id: "silla", labelKey: "chairs", Icon: Square },
      { id: "puff", labelKey: "puff", Icon: Circle },
    ],
  },
  {
    categoryKey: "storage",
    items: [
      { id: "estanteria", labelKey: "shelving", Icon: BookOpen },
      { id: "armario", labelKey: "closet", Icon: DoorClosed },
      { id: "cajonera", labelKey: "drawer", Icon: Archive },
    ],
  },
  {
    categoryKey: "workStudy",
    items: [
      { id: "escritorio", labelKey: "desk", Icon: Monitor },
      { id: "mesa", labelKey: "coffeeTable", Icon: Square },
      { id: "rack", labelKey: "rack", Icon: Radio },
    ],
  },
  {
    categoryKey: "other",
    items: [
      { id: "cama", labelKey: "bed", Icon: BedDouble },
      { id: "plantas", labelKey: "plants", Icon: Flower2 },
      { id: "instrumentos", labelKey: "instruments", Icon: Music },
      { id: "alfombra", labelKey: "thickRug", Icon: Grid2X2 },
    ],
  },
]

export default function MueblesPage() {
  const router = useRouter()
  const updateProject = useRoomStore((s) => s.updateProject)
  const [selected, setSelected] = useState<string[]>([])
  const { t } = useT()

  const toggleFurniture = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const handleContinue = () => {
    updateProject({
      furniture: selected.length > 0 ? selected : undefined,
    })
    router.push("/medicion")
  }

  const totalSelected = selected.length

  return (
    <CenteredLayout>
      <Link
        href="/disposicion"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
      >
        <ChevronLeft className="w-4 h-4" />
        {t.common.back}
      </Link>

      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-base md:text-lg font-semibold text-foreground leading-snug">
              {t.muebles.title}
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              {t.muebles.subtitle}
            </p>
          </div>
          {totalSelected > 0 && (
            <div className="px-2 py-0.5 border border-primary text-primary font-mono text-[10px] flex-shrink-0">
              {totalSelected} {totalSelected > 1 ? t.common.items : t.common.item}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {furnitureOptions.map((category) => (
          <div key={category.categoryKey} className="space-y-1">
            <h2 className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground pb-1 border-b border-dotted border-border">
              {t.muebles[category.categoryKey]}
            </h2>
            <div>
              {category.items.map((item) => (
                <OptionCard
                  key={item.id}
                  variant="checkbox"
                  selected={selected.includes(item.id)}
                  onSelect={() => toggleFurniture(item.id)}
                  title={t.muebles[item.labelKey]}
                  icon={item.Icon}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <InfoCallout label={t.common.tip}>{t.muebles.tip}</InfoCallout>

      <Button type="button" onClick={handleContinue} className="w-full">
        {t.muebles.analyzeButton}
      </Button>
    </CenteredLayout>
  )
}
