"use client"

import Link from "next/link"
import { useState } from "react"
import { CenteredLayout } from "@/components/CenteredLayout"

const furniture = [
  { id: "sofa", label: "Sofá" },
  { id: "bed", label: "Cama" },
  { id: "desk", label: "Escritorio" },
  { id: "libraries", label: "Bibliotecas grandes" },
  { id: "other", label: "Otros muebles grandes" },
  { id: "none", label: "Casi no tengo muebles" },
]

export default function MueblesPage() {
  const [selected, setSelected] = useState<string[]>([])

  const toggleFurniture = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  return (
    <CenteredLayout>
      <div className="space-y-3">
        <h1 className="text-lg md:text-xl font-bold text-primary glow-text font-mono">{"> "}Muebles principales</h1>
        <p className="text-sm text-muted-foreground">{"// "}Marcá qué tenés en la sala</p>
      </div>

      <form className="space-y-2">
        {furniture.map((item, index) => (
          <label
            key={item.id}
            className={`flex items-center gap-3 p-3 border-2 cursor-pointer transition-all ${
              selected.includes(item.id)
                ? "border-primary bg-primary/10"
                : "border-muted-foreground/30 bg-card hover:border-primary/50"
            }`}
          >
            <div
              className={`w-4 h-4 border-2 flex items-center justify-center ${
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
            <span className="text-sm text-foreground">
              <span className="text-accent text-xs mr-2">[{String(index + 1).padStart(2, "0")}]</span>
              {item.label}
            </span>
          </label>
        ))}
      </form>

      <p className="text-xs text-muted-foreground text-center border border-muted-foreground/30 p-2">
        {"// "}Más adelante podrás ajustar la posición con más detalle.
      </p>

      <Link
        href="/medicion"
        className="block w-full bg-primary text-primary-foreground py-3 px-6 font-semibold text-center uppercase text-sm tracking-wide border-black hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 transition-all"
        style={{ borderWidth: "3px", borderStyle: "solid", boxShadow: "4px 4px 0 0 rgba(0,0,0,1)" }}
      >
        [CONTINUAR]
      </Link>

      <div className="text-center">
        <Link
          href="/disposicion"
          className="text-xs text-accent hover:text-primary transition-colors uppercase tracking-wide"
        >
          {"<"} VOLVER
        </Link>
      </div>
    </CenteredLayout>
  )
}
