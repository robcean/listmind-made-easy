

## Preparar la app para conexion con API real

### Resumen
Eliminar todos los bypasses de desarrollo y datos mock que interfieren con el flujo real de autenticacion y carga de datos desde el API.

### Cambios

**1. ProtectedRoute (`src/components/ProtectedRoute.tsx`)**
- Eliminar el `devBypass` que permite acceso sin autenticacion en desarrollo y en lovable.app
- Si el usuario no esta autenticado, siempre redirigir a `/login`

**2. ListsView (`src/pages/ListsView.tsx`)**
- Eliminar el import de `mockCategories` y `mockItems` de `src/mocks/data.ts`
- En el `catch` de carga de categorias: en vez de cargar mock data, mostrar el error al usuario (o dejar las listas vacias)
- En el `catch` de carga de items: igual, dejar vacio en vez de usar fallback mock

**3. CategoryAccordion (`src/components/CategoryAccordion.tsx`)**
- Eliminar el import de `mockItems`
- En el `catch` al cargar items de una categoria expandida: dejar el array vacio en vez de usar mock data

**4. ChatView (`src/pages/ChatView.tsx`)**
- Ya esta correctamente conectado al API, no usa mock data como fallback. No requiere cambios.

**5. Archivos mock (`src/mocks/data.ts`)**
- Mantener el archivo por ahora (puede ser util para tests), pero ya no sera importado por ningun componente de produccion.

### Detalle tecnico

```text
Antes (ProtectedRoute):
  devBypass = import.meta.env.DEV || hostname.includes("lovable.app")
  --> siempre deja pasar

Despues:
  if (!isAuthenticated) --> Navigate to /login
```

```text
Antes (ListsView catch):
  setCategories(mockCategories)
  setItems(mockItems.filter(...))

Despues:
  setCategories([])
  setItems([])
  // Opcionalmente mostrar toast de error
```

```text
Antes (CategoryAccordion catch):
  mockItems.filter(i => i.categoryId === openId)

Despues:
  setItemsMap(prev => ({ ...prev, [openId]: [] }))
```

### Resultado
Al abrir la app, el usuario sera redirigido a `/login`. Una vez autenticado con el API real, las categorias e items se cargaran exclusivamente desde el backend.

