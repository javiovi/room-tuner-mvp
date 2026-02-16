# RoomTuner — Features & Roadmap

---

## Features actuales

### Flujo del usuario

| Paso | Ruta | Descripción |
|------|------|-------------|
| Landing | `/` | Página de marketing con hero, features, casos de uso, preview del reporte, CTAs |
| Objetivo | `/objetivo` | Selección de uso: escucha de música, instrumento, trabajo/concentración |
| Espacio | `/espacio` | Dimensiones (largo, ancho, alto en metros), tipo de piso y paredes |
| Disposición | `/disposicion` | Ubicación de parlantes y posición de escucha |
| Muebles | `/muebles` | Selección de muebles por categoría (asientos, almacenamiento, trabajo, otros) |
| Medición | `/medicion` | Medición de ruido ambiente con micrófono + test de aplauso para RT60 |
| Analizando | `/analizando` | Loading animado con tips educativos sobre acústica |
| Resultado | `/resultado` | Reporte completo con 7 tabs + descarga de PDF |

### Reporte de resultados (7 tabs)

- **Resumen** — Diagnóstico ejecutivo, carácter de sala (viva/equilibrada/seca), badges de prioridad, próximos pasos
- **Análisis** — Gráfico de respuesta de frecuencia (Recharts) + gráfico de modos de sala con severidad
- **Diagrama** — Planta 2D interactiva con drag-and-drop de parlantes, posición de escucha y muebles. Toggle de heatmap de presión sonora
- **Cambios gratis** — Recomendaciones sin costo (reposicionar muebles, mover parlantes, etc.)
- **Productos** — Tabla de productos acústicos con precios reales (bajo presupuesto + avanzados)
- **Presupuesto** — Calculadora de costos por nivel de inversión
- **Plan de acción** — Roadmap de implementación con timeline, prioridad, costo e impacto + glosario

### Motor de cálculos acústicos

| Cálculo | Estado | Detalle |
|---------|--------|---------|
| Modos axiales | Implementado | Frecuencias de resonancia en cada eje (largo, ancho, alto) |
| Modos tangenciales | Implementado | Modos en pares de dimensiones (2D) con clasificación de severidad |
| Modos oblicuos | Implementado | Modos en las tres dimensiones (3D), siempre severidad baja |
| RT60 Sabine | Implementado | Fórmula clásica para salas con baja absorción |
| RT60 Eyring | Implementado | Fórmula para salas con alta absorción (auto-selección si absorción > 0.2) |
| RT60 por bandas | Implementado | Estimación separada para graves (125Hz), medios (1kHz) y agudos (4kHz) |
| Métricas de sala | Implementado | Volumen, superficie de piso/paredes/total, ratios dimensionales |
| Carácter de sala | Implementado | Clasificación viva/equilibrada/seca basada en RT60 y absorción |
| Respuesta de frecuencia | Implementado | Estimación 20Hz–20kHz con identificación de problemas |
| Posiciones óptimas | Implementado | Recomendación de ubicación de parlantes y escucha |
| Coeficientes de absorción | Implementado | Por material (piso, paredes, techo) y muebles, en 3 bandas de frecuencia |
| Heatmap de presión | Implementado | Grid 20x20 con standing waves por modo, overlay SVG sobre diagrama |

### Medición con micrófono

| Feature | Estado | Detalle |
|---------|--------|---------|
| Medidor de ruido ambiente | Implementado | Web Audio API, 5 segundos, barra animada con colores, resultado en dB + clasificación |
| Test de aplauso (RT60) | Implementado | Detección de impulso, análisis de decaimiento T20/T30, confianza (alta/media/baja) |
| Comparación medido vs calculado | Implementado | Si hay medición, muestra RT60 medido junto al calculado en métricas |

### Diagrama interactivo

| Feature | Estado |
|---------|--------|
| Planta 2D a escala del espacio | Implementado |
| Drag-and-drop de parlantes | Implementado |
| Drag-and-drop de posición de escucha | Implementado |
| Drag-and-drop de muebles | Implementado |
| Agregar/quitar muebles desde panel | Implementado |
| Triángulo estéreo | Implementado |
| Visualización de tratamientos acústicos | Implementado |
| Heatmap de presión sonora (toggle) | Implementado |
| Recálculo en tiempo real al mover elementos | Implementado |

### Productos y presupuesto

| Feature | Estado |
|---------|--------|
| Base de datos de 40+ productos acústicos | Implementado |
| Precios reales en ARS y USD | Implementado |
| Integración MercadoLibre API (precios en vivo) | Implementado |
| Recomendación por nivel de presupuesto (bajo/avanzado) | Implementado |
| Calculadora de presupuesto con totales | Implementado |
| Links de compra clickeables | Implementado |

### PDF

| Feature | Estado |
|---------|--------|
| Generación de PDF completo | Implementado |
| Portada + resumen ejecutivo | Implementado |
| Métricas, modos, respuesta de frecuencia | Implementado |
| Planta 2D con tratamientos | Implementado |
| Tabla de productos con links clickeables | Implementado |
| Presupuesto y plan de acción | Implementado |

### Infraestructura

| Feature | Estado |
|---------|--------|
| i18n Español/Inglés | Implementado |
| Dark mode / Light mode | Implementado |
| Supabase (proyectos + análisis) | Implementado |
| N8N webhook (extensible para IA) | Implementado |
| Vercel deployment | Implementado |
| Vercel Analytics | Implementado |
| Zustand store con persistencia en navegación | Implementado |

---

## Roadmap de features futuras

### Fase 2 — Fotos + IA

| # | Feature | Descripción | Impacto |
|---|---------|-------------|---------|
| 1 | Foto → detección de materiales | El usuario saca foto de la sala, la IA detecta materiales (piso de madera, paredes de ladrillo, ventanas, cortinas). Reemplaza los selects manuales. | Alto |
| 2 | Foto → detección de muebles | La IA identifica muebles y sus posiciones desde una foto. Auto-completa el formulario. | Alto |
| 3 | Comparación antes/después | Medir antes y después de mover un mueble o agregar tratamiento. "Mejoraste 0.15s en RT60 medios". | Medio |

### Fase 3 — Audio profesional

| # | Feature | Descripción | Impacto |
|---|---------|-------------|---------|
| 4 | Sweep de frecuencia | La app reproduce un barrido 20Hz–20kHz por los parlantes, el mic graba, obtenés respuesta de frecuencia real. | Muy alto |
| 5 | Impulse response completo | Aplauso o globo → captura la "huella acústica" completa de la sala. De ahí se calcula RT60, ITDG, y más. | Muy alto |
| 6 | ITDG (Initial Time Delay Gap) | Tiempo entre sonido directo y primera reflexión. Define claridad. "Las reflexiones llegan en 12ms". | Medio |
| 7 | STC / aislamiento | Cuánto sonido entra/sale por paredes, ventanas, puertas. "Tu pared exterior filtra ~35dB. Para grabar necesitás ~50dB". | Medio |

### Fase 4 — AR/3D (requiere app nativa)

| # | Feature | Descripción | Impacto |
|---|---------|-------------|---------|
| 8 | LiDAR scan para dimensiones | Los iPhone Pro tienen LiDAR — escanear la sala y obtener dimensiones exactas automáticamente. | Muy alto |
| 9 | Modelo 3D de la sala | Visualización 3D del espacio con muebles, parlantes y tratamientos. | Alto |
| 10 | Simulación de tratamiento en AR | "Así se vería un panel acústico en esta pared" — preview en realidad aumentada. | Alto |

### Ideas adicionales

| Feature | Descripción | Complejidad |
|---------|-------------|-------------|
| Importar mediciones de REW | Subir archivo de Room EQ Wizard para comparar con los cálculos de la app | Media |
| Multi-room / proyectos guardados | Analizar varias salas, comparar, guardar historial | Media |
| Cuentas de usuario / autenticación | Login, guardar proyectos en la nube, compartir reportes | Media |
| Waterfall / spectrogram | Visualización 3D del decaimiento de frecuencia en el tiempo | Alta |
| Calibración de micrófono | Perfil de corrección para el mic del celular, mejorando precisión | Alta |
| Export a REW / CSV | Exportar datos para importar en herramientas profesionales | Baja |
| Compartir reporte por link | URL pública con el reporte completo (sin PDF) | Media |
| Modo profesional | Interface avanzada con más parámetros y visualizaciones detalladas | Alta |
| Monetización (freemium) | Análisis básico gratis, PDF/productos/medición como premium | Media |
| Notificaciones / recordatorios | "Hace 30 días mediste tu sala — querés medir de nuevo post-tratamiento?" | Baja |
