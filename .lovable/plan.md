

## Modo claro/oscuro con switch en el header

### Resumen
Agregar un switch (toggle) en la esquina superior derecha del header que permita cambiar entre modo claro y modo oscuro. Se elimina el texto "EN"/"ES" que estaba ahí.

### Cambios

**1. Store (`src/store/useStore.ts`)**
- Agregar estado `theme: "light" | "dark"` con default `"dark"`
- Agregar accion `setTheme`
- Persistirlo en localStorage junto con `language`

**2. AppLayout (`src/components/AppLayout.tsx`)**
- Eliminar el `<span>` que muestra `{language}` en la esquina superior derecha
- Agregar un `Switch` (de shadcn) que controle el tema
- Al cambiar el switch: actualizar la clase `dark` en `<html>` y guardar en store
- Agregar iconos de sol/luna al lado del switch para que sea intuitivo

**3. CSS (`src/index.css`)**
- Eliminar la linea `color-scheme: dark` forzada en `html` (linea 91-92), ya que ahora el tema sera dinamico

**4. HTML (`index.html`)**
- Cambiar `class="dark"` por default (se manejara desde JS al cargar)

### Detalle tecnico

El switch leera `theme` del store. Al montarse `AppLayout`, sincronizara `document.documentElement.classList` con el tema guardado. El tema light ya tiene sus variables CSS definidas en `:root`, y el dark en `.dark`, asi que solo hay que togglear la clase.

El switch mostrara un icono de luna (dark) o sol (light) para indicar el estado actual.
