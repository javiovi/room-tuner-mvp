import { expect, test } from "@playwright/test"
import { readFileSync } from "node:fs"
import { mockAnalysis } from "../lib/mockData"

const photo = readFileSync(new URL("../public/placeholder.jpg", import.meta.url))
test.beforeEach(async ({ page })=>{
  await page.addInitScript(analysis=>{
    if (!sessionStorage.getItem("roomtuner-session")) sessionStorage.setItem("roomtuner-session",JSON.stringify({ version:1,state:{
      project:{ goal:"work",concern:"noise",noiseSource:"outside",noiseEntry:"window",dimensionSource:"approximate",lengthM:5,widthM:4,heightM:3,floorType:"madera",wallType:"desnudas",furniture:[] },
      analysis:{ ...analysis,generatedAt:"photo-room-a" },projectId:null,analysisPersisted:false,reportPersonalization:{}
    } }))
  },mockAnalysis)
})
async function openPhoto(page: import("@playwright/test").Page) {
  await page.goto("/resultado")
  await page.getByText("Investigá tu espacio con una foto",{ exact:true }).click()
  await expect(page.getByLabel("Elegir foto de la habitación")).toBeEnabled()
}
test("local photos keep observations after reload, isolate reports and delete completely",async ({ page })=>{
  const uploads: string[] = []
  page.on("request",request=>{ if (request.method()==="POST") uploads.push(request.url()) })
  await openPhoto(page)
  await page.getByLabel("Elegir foto de la habitación").setInputFiles({ name:"room.jpg",mimeType:"image/jpeg",buffer:photo })
  await expect(page.getByTestId("room-photo")).toBeVisible()
  await expect(page.getByRole("status").filter({hasText:"Guardado en este navegador."})).toHaveCount(2)
  await page.getByRole("button",{ name:"Agregar marca en el centro" }).click()
  await page.getByLabel("¿Qué observaste?").fill("Tráfico junto al marco")
  await page.getByLabel("Resultado de la comparación").selectOption("better")
  await page.getByRole("button",{name:"1. Ventana",exact:true}).press("ArrowRight")
  await page.getByRole("button",{name:"Guardar marcas y resultados"}).click()
  await expect(page.getByRole("button",{name:"Guardar marcas y resultados"})).toBeDisabled()
  const snapshot = await page.evaluate(async()=>{
    const db = await new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open("roomtuner-evidence-v1",1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})
    const value = await new Promise<{photo:Blob;zones:{x:number}[]}>((resolve,reject)=>{const r=db.transaction("rooms").objectStore("rooms").get("photo-room-a");r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})
    db.close()
    return {type:value.photo.type,x:value.zones[0].x,session:sessionStorage.getItem("roomtuner-session")}
  })
  expect(snapshot.type).toBe("image/jpeg")
  expect(snapshot.x).toBeCloseTo(.52)
  expect(snapshot.session).not.toContain("Tráfico junto al marco")
  await page.reload()
  await page.getByText("Investigá tu espacio con una foto",{ exact:true }).click()
  await expect(page.getByLabel("¿Qué observaste?")).toHaveValue("Tráfico junto al marco")
  await expect(page.getByLabel("Resultado de la comparación")).toHaveValue("better")
  await page.evaluate(()=>{const s=JSON.parse(sessionStorage.getItem("roomtuner-session")!);s.state.analysis.generatedAt="photo-room-b";sessionStorage.setItem("roomtuner-session",JSON.stringify(s))})
  await page.reload()
  await page.getByText("Investigá tu espacio con una foto",{ exact:true }).click()
  await expect(page.getByLabel("Elegir foto de la habitación")).toBeEnabled()
  await expect(page.getByTestId("room-photo")).toHaveCount(0)
  await page.evaluate(()=>{const s=JSON.parse(sessionStorage.getItem("roomtuner-session")!);s.state.analysis.generatedAt="photo-room-a";sessionStorage.setItem("roomtuner-session",JSON.stringify(s))})
  await page.reload()
  await page.getByText("Investigá tu espacio con una foto",{ exact:true }).click()
  await page.getByRole("button",{name:"Eliminar foto y marcas"}).click()
  await expect(page.getByLabel("Elegir foto de la habitación")).toBeEnabled()
  await page.reload()
  await page.getByText("Investigá tu espacio con una foto",{ exact:true }).click()
  await expect(page.getByTestId("room-photo")).toHaveCount(0)
  expect(uploads).toEqual([])
})
test("rejects unsupported photos and reports storage failure without claiming success",async ({ page })=>{
  await openPhoto(page)
  await page.getByLabel("Elegir foto de la habitación").setInputFiles({name:"room.jpg",mimeType:"image/jpeg",buffer:Buffer.from("<svg/>")})
  await expect(page.getByRole("status").filter({hasText:"No pudimos leer o guardar"})).toBeVisible()
  await expect(page.getByTestId("room-photo")).toHaveCount(0)
  await page.evaluate(()=>{IDBObjectStore.prototype.put=function(){throw new DOMException("Full","QuotaExceededError")}})
  await page.getByLabel("Elegir foto de la habitación").setInputFiles({name:"room.jpg",mimeType:"image/jpeg",buffer:photo})
  await expect(page.getByRole("status").filter({hasText:"No pudimos leer o guardar"})).toBeVisible()
  await expect(page.getByTestId("room-photo")).toHaveCount(0)
})
