"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ChevronLeft, Check } from "lucide-react"
import { CenteredLayout } from "@/components/CenteredLayout"
import { PrimaryButton } from "@/components/PrimaryButton"
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
            <div className="px-2.5 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full flex-shrink-0">
              {totalSelected} {totalSelected > 1 ? t.common.items : t.common.item}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {furnitureOptions.map((category) => (
          <div key={category.categoryKey} className="space-y-2">
            <h2 className="text-xs font-medium text-muted-foreground pb-1 border-b border-border">
              {t.muebles[category.categoryKey]}
            </h2>
            <div className="grid grid-cols-1 gap-2">
              {category.items.map((item) => (
                <label
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all touch-manipulation ${
                    selected.includes(item.id)
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      selected.includes(item.id) ? "border-primary bg-primary" : "border-muted-foreground/40"
                    }`}
                  >
                    {selected.includes(item.id) && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
                  </div>
                  <input
                    type="checkbox"
                    checked={selected.includes(item.id)}
                    onChange={() => toggleFurniture(item.id)}
                    className="sr-only"
                  />
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                    <item.Icon className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                  <span className="text-xs md:text-sm text-foreground">{t.muebles[item.labelKey]}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-muted rounded-xl">
        <p className="text-xs text-muted-foreground">
          <span className="text-foreground font-medium">{t.common.tip}</span> {t.muebles.tip}
        </p>
      </div>

      <PrimaryButton type="button" onClick={handleContinue}>
        {t.muebles.analyzeButton}
      </PrimaryButton>
    </CenteredLayout>
  )
}
