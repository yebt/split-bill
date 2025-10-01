# AGENT

## Vision

Aplicación para gestionar grupos de amigos ("parches"), organizar personas en grupos, registrar facturas y dividir cuentas de forma justa y en tiempo real.  
Objetivo: facilitar la división de gastos compartidos en un parche, con soporte para exoneraciones, productos compartidos y reportes listos para compartir en WhatsApp.

---

## Entities

### Parche

- **Descripción:** Contenedor principal de grupos, personas y facturas.
- **Atributos:**
  - `id` (uuid)
  - `name` (string, único)
  - `groups[]`
  - `peopleCount.total` (int)
  - `peopleCount.active` (int)
  - `bills[]`
- **Reglas:**
  - Siempre tiene al menos un grupo por defecto.
  - Se puede duplicar. Duplicación incluye grupos y personas, pero no facturas.
  - Puede existir sin facturas.

### Grupo

- **Descripción:** Subdivisión de un parche que organiza personas.
- **Atributos:**
  - `id` (uuid)
  - `name` (string, único dentro del parche)
  - `color` (hex, por defecto de paleta, editable)
  - `people[]`
- **Reglas:**
  - Puede haber múltiples grupos por parche.
  - Misma persona no puede estar dos veces en un mismo grupo.

### Persona

- **Descripción:** Individuo dentro de un grupo de un parche.
- **Atributos:**
  - `id` (uuid)
  - `name` (string, único dentro del parche)
  - `active` (boolean)
- **Reglas:**
  - Una persona puede estar en múltiples parches.
  - Dentro de un mismo parche no se repiten nombres.

### Factura (Bill)

- **Descripción:** Documento de gasto compartido en un parche.
- **Atributos:**
  - `id` (uuid)
  - `parcheId` (ref)
  - `type` (`equal` | `distributed`)
  - `products[]`
  - `people[]` (con asignaciones de consumo)
  - `exonerated[]`
  - `total` (float)
  - `createdAt`
- **Reglas:**
  - Siempre pertenece a un único parche.
  - Exoneración es por factura, no global.
  - Redistribuye sobrantes en tiempo real.
  - Manejo de decimales con redondeo al más cercano.

### Producto (Item)

- **Descripción:** Elemento de consumo dentro de una factura.
- **Atributos:**
  - `id` (uuid)
  - `name` (string)
  - `quantity` (int)
  - `price` (float)
  - `assignedTo[]` (personas que lo consumieron)
- **Reglas:**
  - Puede ser asignado a varias personas.
  - Si se comparte, se divide proporcionalmente.

---

## Functional Requirements

### Parche

- Crear, editar, eliminar, listar parches.
- Duplicar parche (incluye grupos y personas, no facturas).
- Ver cuentas totales (todas las personas) y cuentas activas.

### Grupo

- Crear, editar, eliminar grupos dentro de un parche.
- Asignar color diferenciado (paleta por defecto + custom).

### Persona

- Agregar personas a grupos dentro de un parche.
- Marcar persona como activa/inactiva.
- Validación de nombres únicos por parche.

### Facturas

- Crear factura manual:
  - Añadir productos (nombre, cantidad, precio).
  - Asignar productos a personas (individual o compartido).
- Crear factura desde imagen:
  - Adjuntar foto (almacenada para futuro OCR).
- Tipos de factura:
  - **Equal**: divide monto total entre personas activas no exoneradas.
  - **Distributed**: asignar productos a personas → restante se reparte igual.
- Exonerar personas por factura.
- Calcular en tiempo real la deuda de cada persona.
- Guardar historial de facturas por parche.

### Reportes

- Resumen de cuentas por factura y por parche.
- Exportar:
  - Texto plano (para copiar/pegar en WhatsApp).
  - Imagen (tabla o card para compartir).

### Persistencia

- Local Storage o IndexedDB (según rendimiento).
- Estructura JSON por parche.
- Exportar/Importar datos (JSON file).

---

## Non-Functional Requirements

- Diseño **mobile first**, con soporte web.
- Dark y light mode.
- Modales personalizados (no nativos).
- Cálculos en tiempo real con feedback visual.
- Repository Pattern en la capa de datos.
- Aplicación 100% offline, sin login.
- Escalable para integrarse a backend futuro.

---

## User Stories

1. **Parche**
   - Como usuario, quiero crear un parche para organizar a mis amigos.
   - Como usuario, quiero duplicar un parche para no empezar desde cero.
   - Como usuario, quiero eliminar un parche que ya no uso.

2. **Grupo**
   - Como usuario, quiero crear grupos dentro de un parche para organizar personas.
   - Como usuario, quiero asignar colores distintos a los grupos para diferenciarlos.

3. **Persona**
   - Como usuario, quiero agregar personas a un grupo con nombre único.
   - Como usuario, quiero activar o desactivar personas según participación.

4. **Factura**
   - Como usuario, quiero registrar manualmente una factura con productos, cantidades y precios.
   - Como usuario, quiero seleccionar productos consumidos por cada persona.
   - Como usuario, quiero marcar personas exoneradas de una factura.
   - Como usuario, quiero dividir la cuenta de forma justa en tiempo real.
   - Como usuario, quiero guardar facturas para consultar en el futuro.

5. **Reportes**
   - Como usuario, quiero generar un reporte de lo que cada persona debe pagar.
   - Como usuario, quiero exportar un reporte en texto para pegar en WhatsApp.
   - Como usuario, quiero exportar un reporte en imagen para compartir en WhatsApp.

6. **Persistencia**
   - Como usuario, quiero importar/exportar mis parches para usarlos en otro dispositivo.

---

## Future Scope

- OCR con Gemini para extraer productos de una foto de factura.
- Generar reportes en PDF o CSV.
- Posible integración backend para sincronización multiusuario.
- Posible integración con servicios de pago (fase futura).

---
