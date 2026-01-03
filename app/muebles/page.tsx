"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
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
        className="text-xs text-accent hover:text-primary transition-colors inline-flex items-center gap-1 uppercase tracking-wide"
      >
        {"<"} VOLVER
      </Link>

      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-base md:text-lg font-bold text-primary glow-text font-mono">
              {"> "}Muebles en el espacio
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              {"// "}Seleccioná todo lo que aplique
            </p>
          </div>
          {totalSelected > 0 && (
            <div className="px-2 py-1 bg-primary text-primary-foreground text-xs font-bold border-2 border-black flex-shrink-0">
              {totalSelected} ITEM{totalSelected > 1 ? "S" : ""}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {furnitureOptions.map((category) => (
          <div key={category.category} className="space-y-2">
            <h2 className="text-xs font-bold text-accent uppercase tracking-wide border-b border-accent/30 pb-1">
              [{category.category}]
            </h2>
            <div className="grid grid-cols-1 gap-2">
              {category.items.map((item) => (
                <label
                  key={item.id}
                  className={`flex items-center gap-3 p-3 border-2 cursor-pointer transition-all touch-manipulation ${
                    selected.includes(item.id)
                      ? "border-primary bg-primary/10"
                      : "border-muted-foreground/30 bg-card hover:border-primary/50"
                  }`}
                >
                  <div
                    className={`w-5 h-5 border-2 flex items-center justify-center flex-shrink-0 ${
                      selected.includes(item.id) ? "border-primary bg-primary" : "border-muted-foreground"
                    }`}
                  >
                    {selected.includes(item.id) && <span className="text-primary-foreground text-xs font-bold">✓</span>}
                  </div>
                  <input
                    type="checkbox"
                    checked={selected.includes(item.id)}
                    onChange={() => toggleFurniture(item.id)}
                    className="sr-only"
                  />
                  <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                    <item.Icon className="w-6 h-6 text-primary" strokeWidth={2} />
                  </div>
                  <span className="text-xs md:text-sm text-foreground">{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Info box */}
      <div className="p-3 border border-accent/20 bg-accent/5">
        <p className="text-[10px] text-muted-foreground">
          <span className="text-accent font-bold">Tip:</span> Los muebles afectan la acústica del espacio.
          Más muebles = más absorción de sonido. Estanterías y bibliotecas ayudan a difundir el sonido.
        </p>
      </div>

      <PrimaryButton type="button" onClick={handleContinue}>
        [ANALIZAR MI ESPACIO]
      </PrimaryButton>
    </CenteredLayout>
  )
}
