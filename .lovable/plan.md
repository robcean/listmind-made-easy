

## Fix: Error de compilación en ChatView.tsx

### Problema
`react-markdown` v10 eliminó el soporte para la prop `className` directamente en el componente. Esto causa un error de compilación que impide que el proyecto funcione.

### Solución
Envolver `ReactMarkdown` en un `<div>` que lleve la clase CSS, en lugar de pasarla como prop.

### Cambio técnico

**Archivo:** `src/pages/ChatView.tsx`

Cambiar esto:
```tsx
<ReactMarkdown
  className="prose prose-sm prose-invert max-w-none ..."
  components={{...}}
>
  {msg.text}
</ReactMarkdown>
```

Por esto:
```tsx
<div className="prose prose-sm prose-invert max-w-none [&>p]:m-0 [&>ul]:m-0 [&>ol]:m-0 [&>p+p]:mt-1.5 [&>ul]:pl-4 [&>ol]:pl-4">
  <ReactMarkdown
    components={{...}}
  >
    {msg.text}
  </ReactMarkdown>
</div>
```

Es un cambio de 1 archivo, sin impacto visual — el resultado se verá exactamente igual.

