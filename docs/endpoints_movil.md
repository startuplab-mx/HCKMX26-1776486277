# Endpoints accesibles desde móvil (PWA / App) — Kipi Safe

Esta guía documenta **los endpoints HTTP que consume el cliente móvil** (PWA o app) y cómo usarlos.

## Base URL

- **Local (dev)**: `http://localhost:8788` (puede cambiar según `PORT`)
- **Prefijo API**: `GET/POST/PATCH {BASE_URL}/api/...`

Además existe un endpoint de estado:

- `GET {BASE_URL}/health`

## Autenticación

La mayoría de endpoints requieren un **token JWT de Supabase** en el header:

- `Authorization: Bearer <access_token>`

El backend valida el token con Supabase (`supabase.auth.getUser(token)`). Si falta o es inválido, responde error.

## Formato de errores

Cuando algo falla, la API usa un formato estable tipo **Problem Details** (via `writeProblem(...)`).

En general, valida:

- UUIDs en query/body (`parent_id`, `minor_id`)
- Permisos: el `parent_id` debe coincidir con el usuario autenticado, y el menor (`minor_id`) debe pertenecer al padre autenticado.

## Headers recomendados (cliente móvil)

- **JSON**:
  - `Content-Type: application/json`
  - `Accept: application/json`
- **Auth (si aplica)**:
  - `Authorization: Bearer <access_token>`

## Endpoints

### Healthcheck

#### `GET /health`

- **Auth**: no
- **Uso**: verificar que la API está arriba y si Supabase está configurado.

**Ejemplo**

```bash
curl "http://localhost:8788/health"
```

---

### Dashboard (menores + alertas recientes)

#### `GET /api/dashboard?parent_id={PARENT_UUID}`

- **Auth**: sí (`Authorization: Bearer ...`)
- **Query**
  - `parent_id` (UUID, requerido): debe ser el mismo que `auth.user.id`
- **Respuesta (200)**
  - `{ ok: true, minors: [...] }`
  - Cada menor incluye:
    - `minor_id`, `name`, `age_mode`, `shared_alert_levels`
    - `stats`: conteo de alertas nivel 2 y 3
    - `alertas_recientes`: lista de alertas escaladas al padre

**Ejemplo (curl)**

```bash
curl "http://localhost:8788/api/dashboard?parent_id=UUID_DEL_PADRE" ^
  -H "Authorization: Bearer ACCESS_TOKEN"
```

**Ejemplo (`fetch`)**

```js
const res = await fetch(`${BASE_URL}/api/dashboard?parent_id=${parentId}`, {
  headers: { Authorization: `Bearer ${accessToken}` },
});
const data = await res.json();
```

---

### Tiempo de pantalla (hoy + semana)

#### `GET /api/screen-time?minor_id={MINOR_UUID}`

- **Auth**: sí (y el menor debe pertenecer al padre autenticado)
- **Query**
  - `minor_id` (UUID, requerido)
- **Respuesta (200)**
  - `{ ok: true, today: { total_minutes, by_category }, weekly }`
  - `by_category` contiene `name`, `hours`, `key` (por ejemplo: `games`, `social`, `videos`, `education`, `communication`, `other`)

**Ejemplo**

```bash
curl "http://localhost:8788/api/screen-time?minor_id=UUID_DEL_MENOR" ^
  -H "Authorization: Bearer ACCESS_TOKEN"
```

---

### Apps recientes (eventos)

#### `GET /api/apps/recent?minor_id={MINOR_UUID}`

- **Auth**: sí (y el menor debe pertenecer al padre autenticado)
- **Query**
  - `minor_id` (UUID, requerido)
- **Respuesta (200)**
  - `{ ok: true, apps: [...] }`
  - Cada item incluye `name`, `event_type`, `category`, `risk_level`, `created_at`

**Ejemplo**

```bash
curl "http://localhost:8788/api/apps/recent?minor_id=UUID_DEL_MENOR" ^
  -H "Authorization: Bearer ACCESS_TOKEN"
```

---

### Dispositivos vinculados

#### `GET /api/devices?minor_id={MINOR_UUID}`

- **Auth**: sí (y el menor debe pertenecer al padre autenticado)
- **Query**
  - `minor_id` (UUID, requerido)
- **Respuesta (200)**
  - `{ ok: true, devices: [...] }`

**Ejemplo**

```bash
curl "http://localhost:8788/api/devices?minor_id=UUID_DEL_MENOR" ^
  -H "Authorization: Bearer ACCESS_TOKEN"
```

---

### Estadísticas de “IA” (conteos agregados)

#### `GET /api/ai/stats?parent_id={PARENT_UUID}`

- **Auth**: sí (el `parent_id` debe ser el usuario autenticado)
- **Query**
  - `parent_id` (UUID, requerido)
- **Respuesta (200)**
  - `{ ok: true, stats: { messages_analyzed, threats_detected, privacy_breaches, last_audit, data_retention_days, processing_local } }`

**Ejemplo**

```bash
curl "http://localhost:8788/api/ai/stats?parent_id=UUID_DEL_PADRE" ^
  -H "Authorization: Bearer ACCESS_TOKEN"
```

---

### Crear alerta manual (ayuda)

#### `POST /api/alerts/manual`

- **Auth**: sí
- **Body (JSON)**:
  - `minor_id` (UUID, requerido)
  - `app_source` (string, opcional; default `"Manual"`)
  - `risk_level` (number 1|2|3, opcional; default `2`)
- **Respuesta (200)**
  - `{ ok: true, alert_id, message }`

**Ejemplo**

```bash
curl "http://localhost:8788/api/alerts/manual" ^
  -H "Authorization: Bearer ACCESS_TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"minor_id\":\"UUID_DEL_MENOR\",\"app_source\":\"WhatsApp\",\"risk_level\":3}"
```

---

### Actualizar acuerdos (niveles compartidos) del menor

#### `PATCH /api/minors/agreement`

- **Auth**: sí
- **Body (JSON)**:
  - `minor_id` (UUID, requerido)
  - `shared_alert_levels` (array de int, opcional; si viene vacío se normaliza a `[1,2,3]`)
- **Respuesta (200)**
  - `{ ok: true, message }`

**Ejemplo**

```bash
curl -X PATCH "http://localhost:8788/api/minors/agreement" ^
  -H "Authorization: Bearer ACCESS_TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"minor_id\":\"UUID_DEL_MENOR\",\"shared_alert_levels\":[2,3]}"
```

---

## Pairing (emparejamiento de dispositivo)

### Generar código OTP

#### `POST /api/pairing/generate-code`

- **Auth**: no (pensado para el dispositivo/flujo de emparejamiento)
- **Body (JSON)**:
  - `device_model` (string, opcional)
  - `fcm_push_token` (string, opcional)
- **Respuesta (200)**
  - `{ ok: true, session_id, otp, expires_at }`

**Ejemplo**

```bash
curl "http://localhost:8788/api/pairing/generate-code" ^
  -H "Content-Type: application/json" ^
  -d "{\"device_model\":\"Pixel 8\",\"fcm_push_token\":\"TOKEN\"}"
```

### Confirmar código OTP (crea un menor)

#### `POST /api/pairing/confirm-code`

- **Auth**: sí (padre autenticado)
- **Body (JSON)**:
  - `parent_id` (UUID, requerido; debe coincidir con el usuario autenticado)
  - `otp` (string, requerido): 6 caracteres (`A-Z` y `2-9`, sin `I`, `O`, `0`, `1`)
- **Respuesta (200)**
  - `{ ok: true, minor_id, message }`

**Ejemplo**

```bash
curl "http://localhost:8788/api/pairing/confirm-code" ^
  -H "Authorization: Bearer ACCESS_TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"parent_id\":\"UUID_DEL_PADRE\",\"otp\":\"ABC234\"}"
```

---

### Analizar “notificación” (guarda alerta)

#### `POST /api/notifications/analyze`

- **Auth**: sí (y el menor debe pertenecer al padre autenticado)
- **Body (JSON)**:
  - `minor_id` (UUID, requerido)
  - `text_preview` (string, requerido; mínimo 3 chars)
  - `app_source` (string, opcional; default `"Sistema"`)
  - `risk_level` (number 1|2|3, opcional; si no viene, usa `mock_risk_level` o default `2`)
  - `mock_risk_level` (number 1|2|3, opcional)
  - `confidence_score` (number, opcional; default `0.8`)
  - `sensitive_data_flag` (boolean, opcional)
  - `shared_alert_levels` (array de int, opcional; default `[1,2,3]`)
- **Respuesta (200)**
  - `{ ok: true, analysis: {...}, system_action: {...}, alert_id, procesado_en_ms }`

**Ejemplo**

```bash
curl "http://localhost:8788/api/notifications/analyze" ^
  -H "Authorization: Bearer ACCESS_TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"minor_id\":\"UUID_DEL_MENOR\",\"text_preview\":\"Me puedes pasar tu dirección?\",\"app_source\":\"WhatsApp\",\"mock_risk_level\":3,\"sensitive_data_flag\":true}"
```

---

## Gamificación

### Racha de días seguros

#### `GET /api/gamification/streak?parent_id={PARENT_UUID}`

- **Auth**: sí (el `parent_id` debe ser el usuario autenticado)
- **Respuesta (200)**
  - `{ ok: true, parent_id, safe_days_streak }`

**Ejemplo**

```bash
curl "http://localhost:8788/api/gamification/streak?parent_id=UUID_DEL_PADRE" ^
  -H "Authorization: Bearer ACCESS_TOKEN"
```

### Catálogo de misiones + progreso

#### `GET /api/gamification/missions?parent_id={PARENT_UUID}`

- **Auth**: sí (el `parent_id` debe ser el usuario autenticado)
- **Respuesta (200)**
  - `{ ok: true, parent_id, missions, missions_completed_count }`
  - Cada misión incluye `id`, `title`, `description`, `estimated_minutes`, `category`, `is_completed`

**Ejemplo**

```bash
curl "http://localhost:8788/api/gamification/missions?parent_id=UUID_DEL_PADRE" ^
  -H "Authorization: Bearer ACCESS_TOKEN"
```

### Completar una misión

#### `POST /api/gamification/missions/complete`

- **Auth**: sí (padre autenticado)
- **Body (JSON)**:
  - `parent_id` (UUID, requerido; debe coincidir con el usuario autenticado)
  - `mission_id` (string, requerido; debe existir en el catálogo)
- **Respuesta (200)**
  - `{ ok: true, mission_id, missions_completed_count, already_completed }`

**Ejemplo**

```bash
curl "http://localhost:8788/api/gamification/missions/complete" ^
  -H "Authorization: Bearer ACCESS_TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"parent_id\":\"UUID_DEL_PADRE\",\"mission_id\":\"dif-grooming-guia-2024\"}"
```

---

## Asistente (chat demo)

#### `POST /api/assistant/chat`

- **Auth**: sí
- **Body (JSON)**:
  - `message` (string, opcional)
- **Respuesta (200)**
  - `{ ok: true, reply }`

**Ejemplo**

```bash
curl "http://localhost:8788/api/assistant/chat" ^
  -H "Authorization: Bearer ACCESS_TOKEN" ^
  -H "Content-Type: application/json" ^
  -d "{\"message\":\"¿Qué puedo hacer si mi hijo recibe mensajes raros?\"}"
```

