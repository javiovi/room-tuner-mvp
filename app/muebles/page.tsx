"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ChevronLeft, Check } from "lucide-react"
import { CenteredLayout } from "@/components/CenteredLayout"
import { PrimaryButton } from "@/components/PrimaryButton"
import { useRoomStore } from "@/lib/roomStore"
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
  label: string
  Icon: LucideIcon
}

interface FurnitureCategory {
  category: string
  items: FurnitureItem[]
}

const furnitureOptions: FurnitureCategory[] = [
  {
    category: "Asientos",
    items: [
      { id: "sofa", label: "Sofá / Sillón", Icon: Armchair },
      { id: "silla", label: "Sillas", Icon: Square },
      { id: "puff", label: "Puff / Banquetas", Icon: Circle },
    ],
  },
  {
    category: "Almacenamiento",
    items: [
      { id: "estanteria", label: "Estantería / Biblioteca", Icon: BookOpen },
      { id: "armario", label: "Armario / Placard", Icon: DoorClosed },
      { id: "cajonera", label: "Cajonera / Cómoda", Icon: Archive },
    ],
  },
  {
    category: "Trabajo/Estudio",
    items: [
      { id: "escritorio", label: "Escritorio / Mesa", Icon: Monitor },
      { id: "mesa", label: "Mesa ratona / Centro", Icon: Square },
      { id: "rack", label: "Rack de equipos", Icon: Radio },
    ],
  },
  {
    category: "Otros",
    items: [
      { id: "cama", label: "Cama", Icon: BedDouble },
      { id: "plantas", label: "Plantas grandes", Icon: Flower2 },
      { id: "instrumentos", label: "Instrumentos musicales", Icon: Music },
      { id: "alfombra", label: "Alfombra gruesa", Icon: Grid2X2 },
    ],
  },
]

export default function MueblesPage() {
  const router = useRouter()
  const updateProject = useRoomStore((s) => s.updateProject)
  const [selected, setSelected] = useState<string[]>([])

  const toggleFurniture = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const handleContinue = () => {
    updateProject({
      furniture: selected.length > 0 ? selected : undefined,
    })
    router.push("/analizando")
  }

  const totalSelected = selected.length

  return (
    <CenteredLayout>
      <Link
        href="/disposicion"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
      >
        <ChevronLeft className="w-4 h-4" />
        Volver
      </Link>

      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-base md:text-lg font-semibold text-foreground">
              Muebles en el espacio
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              Seleccioná todo lo que aplique
            </p>
          </div>
          {totalSelected > 0 && (
            <div className="px-2.5 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full flex-shrink-0">
              {totalSelected} item{totalSelected > 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {furnitureOptions.map((category) => (
          <div key={category.category} className="space-y-2">
            <h2 className="text-xs font-medium text-muted-foreground pb-1 border-b border-border">
              {category.category}
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
                  <span className="text-xs md:text-sm text-foreground">{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-muted rounded-xl">
        <p className="text-xs text-muted-foreground">
          <span className="text-foreground font-medium">Tip:</span> Los muebles afectan la acústica del espacio.
          Más muebles = más absorción de sonido. Estanterías y bibliotecas ayudan a difundir el sonido.
        </p>
      </div>

      <PrimaryButton type="button" onClick={handleContinue}>
        Analizar mi espacio
      </PrimaryButton>
    </CenteredLayout>
  )
}
