"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Camera } from "lucide-react"
import { CenteredLayout } from "@/components/CenteredLayout"
import { useT } from "@/lib/i18n"
import { useRoomStore } from "@/lib/roomStore"
import { preparePhoto } from "@/lib/evidence/photos"
import { saveEvidence, deleteEvidence } from "@/lib/evidence/storage"

export default function CapturePage() {
  const router = useRouter()
  const { locale } = useT()
  const es = locale === "es"
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  async function start(file?: File) {
    setBusy(true)
    setFailed(false)
    try {
      const previous = sessionStorage.getItem("roomtuner-capture")
      if (file) {
        const key = previous ?? crypto.randomUUID()
        const photo = await preparePhoto(file)
        await saveEvidence({ version: 1, reportKey: key, goal: "pending", photo, zones: [], updatedAt: new Date().toISOString() })
        sessionStorage.setItem("roomtuner-capture", key)
      } else if (previous) {
        await deleteEvidence(previous)
        sessionStorage.removeItem("roomtuner-capture")
      }
      useRoomStore.getState().reset()
      router.push("/medidas")
    } catch {
      setFailed(true)
      setBusy(false)
    }
  }
  return <CenteredLayout>
    <h1 className="text-xl font-semibold">{es ? "Fotografiá tu habitación" : "Photograph your room"}</h1>
    <p className="text-sm">{es ? "Desde una esquina, encuadrá tu puesto y la pared que tenés enfrente. La foto queda en este navegador." : "From a corner, frame your usual spot and the wall ahead. The photo stays in this browser."}</p>
    <fieldset disabled={busy} className="space-y-4">
      <label className="relative flex items-center justify-center gap-2 bg-primary text-primary-foreground p-3 cursor-pointer"><Camera size={18}/>{es ? "Abrir cámara" : "Open camera"}<input className="absolute inset-0 opacity-0 w-full cursor-pointer" type="file" accept="image/*" capture="environment" onChange={e => { const file = e.target.files?.[0]; e.target.value = ""; if (file) void start(file) }}/></label>
      <label className="block text-sm">{es ? "Elegir una foto guardada" : "Choose a saved photo"}<input className="block mt-2 w-full" type="file" accept="image/jpeg,image/png,image/webp" onChange={e => { const file = e.target.files?.[0]; e.target.value = ""; if (file) void start(file) }}/></label>
      <button onClick={() => start()} className="underline min-h-11">{es ? "Seguir sin foto" : "Continue without a photo"}</button>
    </fieldset>
    {failed && <p role="alert">{es ? "No se pudo guardar la foto. Probá un JPG o PNG más chico o seguí sin foto." : "Could not save the photo. Try a smaller JPG or PNG or continue without a photo."}</p>}
  </CenteredLayout>
}
