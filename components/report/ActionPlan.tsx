"use client"

import { ArrowRight, Clock } from "lucide-react"

interface ActionItem {
  title: string
  description: string
  priority: "high" | "medium" | "low"
  cost: string
  impact: string
}

interface ActionPlanProps {
  roomCharacter: "viva" | "equilibrada" | "seca"
  hasBudget?: boolean
}

export function ActionPlan({ roomCharacter, hasBudget = false }: ActionPlanProps) {
  // Generate prioritized action plan based on room character
  const quickWins: ActionItem[] = [
    {
      title: "Optimizar posición de escucha",
      description: "Mover punto de escucha al 38% de la profundidad del espacio (evitar el 50%)",
      priority: "high",
      cost: "Gratis",
      impact: "Alto - Reduce problemas de modos"
    },
    {
      title: "Ajustar separación de parlantes",
      description: "Formar triángulo equilátero con el punto de escucha",
      priority: "high",
      cost: "Gratis",
      impact: "Alto - Mejora imagen stereo"
    }
  ]

  if (roomCharacter === "viva") {
    quickWins.push({
      title: "Agregar alfombra gruesa",
      description: "Colocar entre parlantes y punto de escucha",
      priority: "high",
      cost: "~ARS $50k",
      impact: "Alto - Controla reflexiones de piso"
    })
  }

  const mediumTerm: ActionItem[] = []

  if (roomCharacter === "viva") {
    mediumTerm.push(
      {
        title: "Instalar paneles absorbentes",
        description: "First reflection points en paredes laterales (4-6 paneles)",
        priority: "high",
        cost: "~ARS $60-90k",
        impact: "Alto - Reduce reverberación"
      },
      {
        title: "Bass traps en esquinas",
        description: "Mínimo 2 esquinas frontales, idealmente las 4",
        priority: "high",
        cost: "~ARS $120-240k",
        impact: "Alto - Controla graves"
      }
    )
  } else if (roomCharacter === "equilibrada") {
    mediumTerm.push(
      {
        title: "Tratamiento selectivo",
        description: "2-4 paneles en first reflections más problemáticos",
        priority: "medium",
        cost: "~ARS $30-60k",
        impact: "Medio - Fine-tuning"
      },
      {
        title: "Bass traps en esquinas",
        description: "2 bass traps en esquinas frontales",
        priority: "medium",
        cost: "~ARS $120k",
        impact: "Medio - Control de graves"
      }
    )
  } else {
    // seca
    mediumTerm.push({
      title: "Agregar difusión",
      description: "Difusores en pared posterior para recuperar vitalidad",
      priority: "medium",
      cost: "~ARS $80-150k",
      impact: "Medio - Agrega espacialidad"
    })
  }

  const longTerm: ActionItem[] = [
    {
      title: "Medición con micrófono calibrado",
      description: "Usar REW para medir respuesta real del espacio",
      priority: "medium",
      cost: "~ARS $80k (micrófono)",
      impact: "Medio - Datos objetivos"
    }
  ]

  if (hasBudget) {
    longTerm.push(
      {
        title: "Tratamiento profesional completo",
        description: "Paneles absorbentes de alta densidad + difusores + bass traps",
        priority: "low",
        cost: "~USD $1000-2000",
        impact: "Alto - Resultado profesional"
      },
      {
        title: "Ceiling clouds",
        description: "Paneles en techo para controlar reflexiones superiores",
        priority: "low",
        cost: "~USD $300-600",
        impact: "Medio - Control completo"
      }
    )
  }

  return (
    <div className="border-2 border-primary bg-card p-5 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-sm font-bold text-primary uppercase tracking-wide">
          [PLAN DE ACCIÓN PRIORIZADO]
        </h2>
        <p className="text-[10px] text-muted-foreground mt-1">
          Orden recomendado de implementación para máximo impacto
        </p>
      </div>

      {/* Timeline Sections */}
      <div className="space-y-6">
        {/* Week 1 - Quick Wins */}
        <TimelineSection
          title="Semana 1"
          subtitle="Cambios inmediatos"
          icon="⚡"
          items={quickWins}
          accentColor="accent"
        />

        {/* Month 1-3 - Medium Term */}
        <TimelineSection
          title="Mes 1-3"
          subtitle="Mejoras principales"
          icon="📦"
          items={mediumTerm}
          accentColor="primary"
        />

        {/* 6+ Months - Long Term */}
        <TimelineSection
          title="6+ meses"
          subtitle="Optimización avanzada"
          icon="🎯"
          items={longTerm}
          accentColor="muted-foreground"
        />
      </div>

      {/* Summary */}
      <div className="border-t-2 border-primary pt-4">
        <div className="p-3 border border-accent/30 bg-accent/5">
          <p className="text-[10px] text-muted-foreground">
            <span className="text-accent font-bold">Recomendación:</span> Empezar con los cambios gratuitos, medir el resultado, y luego invertir progresivamente según el impacto observado. No es necesario hacer todo de una vez.
          </p>
        </div>
      </div>
    </div>
  )
}

// Timeline Section Component
interface TimelineSectionProps {
  title: string
  subtitle: string
  icon: string
  items: ActionItem[]
  accentColor: string
}

function TimelineSection({ title, subtitle, icon, items, accentColor }: TimelineSectionProps) {
  if (items.length === 0) return null

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 border-2 border-${accentColor} flex items-center justify-center text-sm`}>
          {icon}
        </div>
        <div>
          <h3 className={`text-xs font-bold text-${accentColor} uppercase tracking-wide flex items-center gap-2`}>
            <Clock className="w-3 h-3" />
            {title}
          </h3>
          <p className="text-[10px] text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      {/* Items */}
      <div className="ml-10 space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="border-l-2 border-accent/30 pl-4 pb-3 last:pb-0"
          >
            <div className="flex items-start gap-2">
              <ArrowRight className="w-3 h-3 text-accent mt-0.5 flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <h4 className="text-xs font-semibold text-foreground">
                  {item.title}
                </h4>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
                <div className="flex items-center gap-4 text-[10px] mt-1">
                  <span className={`${
                    item.priority === "high"
                      ? "text-destructive"
                      : item.priority === "medium"
                        ? "text-accent"
                        : "text-muted-foreground"
                  } font-bold uppercase`}>
                    {item.priority === "high" ? "Alta prioridad" : item.priority === "medium" ? "Media" : "Baja"}
                  </span>
                  <span className="text-muted-foreground">
                    • Costo: <span className="text-foreground font-mono">{item.cost}</span>
                  </span>
                  <span className="text-muted-foreground">
                    • {item.impact}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
