## Seed de demo (datos de ejemplo)

Este proyecto incluye un “seed” (siembra) para que el Dashboard tenga información real y se vea completo en demos.

### Dónde está el seed
- **Archivo**: `apps/api/supabase/migrations/006_demo_seed.sql`

### Qué datos crea
Para un solo padre y un solo menor de ejemplo, se crean:
- **1 padre** (`parents`)
- **1 menor** (`minors`)
- **1 dispositivo** (`devices`)
- **3 alertas** (`alerts`) (2 importantes + 1 informativa)
- **Tiempo de pantalla de 7 días** (`screen_time_logs`)
- **Eventos recientes de apps** (`app_events`)

### Importante: para verlo en tu Dashboard
El Dashboard solo muestra datos que pertenezcan al usuario con el que inicias sesión (por seguridad).

En el seed viene un `parent_id` fijo de demo (reemplázalo por tu usuario real).

Nota: el seed usa UUIDs “válidos” (versión/variante RFC) porque el proyecto valida IDs con `isUuid()` en frontend/backend.

En tu proyecto, `parents.id` tiene una llave foránea a **Supabase Auth** (`auth.users.id`), así que si ese UUID no existe como usuario, el seed **va a fallar** (esto es normal y es lo correcto).

#### Opción recomendada (la más simple)
1. Abre `apps/api/supabase/migrations/006_demo_seed.sql`
2. Cambia este valor:
   - `demo_parent_id := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'`
3. Pon tu `auth.users.id` (tu UUID real). Lo encuentras en Supabase: **Authentication → Users → columna `id`**
4. Corre el SQL en el **SQL Editor** de Supabase (o vuelve a ejecutar los scripts SQL versionados en `apps/api/supabase/migrations/` si tu flujo los aplica automáticamente)

### Cómo saber que funcionó
Cuando entres al Dashboard autenticado deberías ver:
- Un menor llamado **“Mateo (Demo)”**
- Un dispositivo “**Teléfono de Mateo (Demo)**”
- Alertas recientes (Instagram/WhatsApp)
- Gráficas con tiempo de pantalla (hoy + semana)
- Lista de apps recientes

