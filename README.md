# Arepa · capa a capa

Proyecto de portfolio de **Wilfredo Salazar**: una experiencia de scroll donde una arepa se corta, se abre y se rellena capa a capa (Reina Pepiada, Pelúa, Dominó y Perico).

- HTML, CSS y JavaScript vanilla, sin dependencias.
- Motor de scroll propio: cada sección mide N pantallas, su contenido queda fijo (`position: sticky`) y un bucle `requestAnimationFrame` convierte el progreso del scroll (0 → 1) en transformaciones, suavizado con interpolación.
- Imágenes generadas con IA (Gemini) sobre fondo magenta y recortadas con un script de Python (chroma key + despill), exportadas a WebP.

Demo: https://codex2856.github.io/arepa/
