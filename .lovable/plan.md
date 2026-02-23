

## Fix auto-scroll en mobile accordion

### Cambio
Actualizar el cálculo de scroll en `src/components/CategoryAccordion.tsx` para usar `getBoundingClientRect()` en lugar de `offsetTop`.

### Detalle técnico
En la función `toggle`, dentro del `setTimeout`, reemplazar:
```
const elTop = el.offsetTop - container.offsetTop;
container.scrollTo({ top: elTop, behavior: "smooth" });
```
Por:
```
const containerRect = container.getBoundingClientRect();
const elRect = el.getBoundingClientRect();
const targetTop = container.scrollTop + (elRect.top - containerRect.top);
container.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
```

Esto calcula la posición real del elemento relativa al contenedor visible, sumando el scroll actual, lo que garantiza que la categoría quede alineada al tope sin importar la estructura de layout.

### Archivo modificado
- `src/components/CategoryAccordion.tsx` (solo la función `toggle`, lineas 28-33)

### Sin cambios
- Vista tablet/desktop
- Chat view, bottom nav, SwipeableItem
- Lógica backend

