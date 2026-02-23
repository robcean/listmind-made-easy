
## Usar el emoji de categoría como drag handle

### Cambio
Reemplazar el ícono de 6 puntitos (`GripVertical`) por el emoji de la categoría como zona de long-press para activar el drag.

### Cómo funciona ahora
- Hay un `div` separado a la izquierda con `GripVertical` (los 6 puntitos) que actúa como drag handle
- El emoji está dentro del `button` de expand/collapse

### Qué cambia
1. **Eliminar** el `div` del `GripVertical` y su import
2. **Mover** el emoji fuera del `button` y convertirlo en el drag handle con `onTouchStart`
3. **El emoji** tendrá `touch-none select-none` para funcionar como grip
4. Tocar el emoji brevemente seguirá sin hacer nada (se necesita long press de 500ms para arrastrar)
5. El `button` de expand/collapse pierde el emoji pero mantiene el nombre, count y chevron
6. **Ghost flotante** también usa el emoji en vez de `GripVertical`

### Detalle técnico

**CategoryAccordion.tsx** - Estructura actual del row:
```
[GripVertical div] [Button: emoji + nombre + count + chevron]
```

Nueva estructura:
```
[Emoji div (drag handle)] [Button: nombre + count + chevron]
```

- El `div` del emoji tendrá las mismas props de drag: `onTouchStart`, `touch-none`, `select-none`
- Se elimina el import de `GripVertical`
- El ghost flotante al fondo del archivo también se actualiza para mostrar el emoji en vez de los puntitos
