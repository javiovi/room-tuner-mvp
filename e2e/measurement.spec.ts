import { expect, test } from "@playwright/test"

test("missing microphone shows a Spanish error and always permits skipping", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("locale", "en") // An unrelated old key must not change RoomTuner.
    Object.defineProperty(navigator, "mediaDevices", {
      value: { getUserMedia: () => Promise.reject(new DOMException("No device", "NotFoundError")) },
    })
  })
  await page.goto("/medicion")
  await expect(page.getByRole("heading", { name: "Mediciones opcionales" })).toBeVisible()
  await expect(page.locator("html")).toHaveAttribute("lang", "es")
  await page.getByRole("button", { name: "Medir ruido ambiente" }).click()
  await page.getByRole("button", { name: "Medir ruido ambiente" }).click()
  await expect(page.getByRole("alert").filter({ hasText: /No encontramos|No detectamos/ })).toContainText("No encontramos un micrófono")
  await expect(page.getByRole("button", { name: "Omitir y analizar" })).toBeEnabled()
  await page.getByRole("button", { name: "Omitir y analizar" }).click()
  await expect(page).toHaveURL(/\/analizando/)
})

test("pending permission can be cancelled and a late microphone stream is released", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "mediaDevices", {
      value: { getUserMedia: () => new Promise<MediaStream>((resolve) => {
        Object.assign(window, { resolveRoomTunerMic: () => {
          const context = new AudioContext()
          const stream = context.createMediaStreamDestination().stream
          Object.assign(window, { roomTunerLateStream: stream })
          resolve(stream)
        } })
      }) },
    })
  })
  await page.goto("/medicion")
  await page.getByRole("button", { name: "Medir ruido ambiente" }).click()
  await page.getByRole("button", { name: "Medir ruido ambiente" }).click()
  await expect(page.getByRole("button", { name: "Esperando permiso de micrófono…" })).toBeDisabled()
  await page.getByRole("button", { name: "Cancelar prueba", exact: true }).click()
  await page.evaluate(() => (window as unknown as { resolveRoomTunerMic: () => void }).resolveRoomTunerMic())
  await expect.poll(() => page.evaluate(() => (window as unknown as { roomTunerLateStream: MediaStream }).roomTunerLateStream.getTracks()[0].readyState)).toBe("ended")
  await expect(page.getByRole("button", { name: "Medir ruido ambiente" })).toBeEnabled()
})

async function silentMicrophone(page: import("@playwright/test").Page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "mediaDevices", {
      value: { getUserMedia: async () => new AudioContext().createMediaStreamDestination().stream },
    })
  })
  await page.goto("/medicion")
  await page.getByRole("button", { name: "Medir ruido ambiente" }).click()
  await page.getByRole("button", { name: "Medir ruido ambiente" }).click()
  await expect(page.getByRole("button", { name: "Iniciar test de aplauso" })).toBeVisible({ timeout: 15_000 })
  await page.getByRole("button", { name: "Iniciar test de aplauso" }).click()
  await expect(page.getByText("Esperando aplauso...", { exact: true })).toBeVisible()
}

test("waiting for a clap can be skipped immediately", async ({ page }) => {
  await silentMicrophone(page)
  await page.getByRole("button", { name: "Omitir test de aplauso", exact: true }).click()
  await expect(page.getByRole("button", { name: "Continuar al análisis" })).toBeVisible()
  await expect(page.getByText(/Nivel de ruido:.*lectura relativa/)).toBeVisible()
  await expect(page.getByText("{t.experiments.relative}", { exact: false })).not.toBeVisible()
  await expect(page.getByText("Esperando aplauso...", { exact: true })).not.toBeVisible()
})

test("silence times out instead of trapping the user and language persists", async ({ page }) => {
  await silentMicrophone(page)
  await expect(page.getByRole("alert").filter({ hasText: /No encontramos|No detectamos/ })).toContainText("No detectamos un aplauso", { timeout: 16_000 })
  await expect(page.getByRole("button", { name: "Iniciar test de aplauso" })).toBeEnabled()
  await page.getByRole("button", { name: "Cambiar a inglés" }).click()
  await expect(page.getByRole("heading", { name: "Optional measurements" })).toBeVisible()
  await page.reload()
  await expect(page.getByRole("heading", { name: "Optional measurements" })).toBeVisible()
  await expect(page.locator("html")).toHaveAttribute("lang", "en")
  await page.getByRole("button", { name: "Switch to Spanish" }).click()
  await expect(page.getByRole("heading", { name: "Mediciones opcionales" })).toBeVisible()
})
