# Informe técnico de hallazgos

**Proyecto:** `muvautomation-secure-challenge` — MVP académico de automatización de incidentes (datos ficticios), Secure Product Challenge.
**Integrantes:** María Belén Quintero Aldana, Ángela Sofía Gómez Valencia.
**Repositorio / commit:** <https://github.com/MissGomezzz/Security_Fundamentals_Lab5> — línea base `09d876b4ca5e5c8db6af2053852e88e2487763f4` (rama `security/lab5-fdsi`); remediaciones fusionadas en `main` @ `9968a09` (merge PR #7); estado final evaluado `main` @ `4f31229` (incluye la migración a Express 5, `7e76984`, hecha sin PR; ver F-02).
**Entorno autorizado:** API y frontend locales (`127.0.0.1`), PostgreSQL local con datos ficticios y runners efímeros de GitHub Actions. Sin producción ni terceros.
**Fecha:** pruebas del 6 al 8 de noviembre de 2026 (autorización: viernes 6 de noviembre de 2026).

## Resumen ejecutivo
Se integró un pipeline de seguridad (Semgrep, CodeQL, Gitleaks, Dependabot, ZAP baseline y pruebas de regresión) y se recorrió el ciclo completo: detectar, validar, corregir y reescanear. Se registraron **9 hallazgos**: **6 corregidos y verificados** (F-01, F-02, F-03, F-04 en los workflows de Semgrep/Gitleaks, F-06 en la API y F-08) y 3 abiertos (F-05 aceptado, F-07 sin validar y F-09 por cabeceras del frontend). F-04 y F-06 conservan una parte abierta.

Los tres riesgos principales fueron:
1. **Dependencias vulnerables (F-02, crítico).** `proxy-addr` (IP spoofing, Critical), `body-parser` (DoS, High) y `qs` (3 DoS/bypass, Moderate) llegaban de forma transitiva con Express. Importa porque `proxy-addr` decide qué IP se considera la del cliente, base de cualquier control por IP. **Corregido** actualizando el lockfile; Dependabot pasó de 5 alertas abiertas a 0.
2. **Escritura y auditoría sin autenticación (F-03, alto).** Cualquiera con acceso a la API podía crear alertas, cambiar su estado o leer el historial de auditoría. **Corregido** con clave de API comparada en tiempo constante; validado con un pentest controlado (401, 401, 200).
3. **Ausencia de límite de peticiones (F-01, alto).** CodeQL marcó 7 rutas que consultan la base de datos sin rate limiting (riesgo de agotamiento de recursos). **Corregido** en API y frontend; CodeQL pasó a 0 alertas abiertas.

Lo que el DAST aportó: el informe inicial de OWASP ZAP (6 nov 2026, ya archivado en `evidence/ZAP/`) no halló riesgos High; reportó 2 Medium y 6 Low, todos de cabeceras HTTP del frontend (F-09 y la parte del frontend de F-06). Limitaciones: no alcanzó `/api` y no hay reescaneo posterior.

## Metodología
Identificación del alcance → SAST (Semgrep, CodeQL) → detección de secretos (Gitleaks) → SCA (Dependabot, `npm audit`) → DAST pasivo (ZAP baseline, local al runner) → validación manual no destructiva (3 solicitudes `curl` al API local) → corrección en la rama `security/lab5-fdsi` mediante Pull Request → reescaneo y comparación antes/después.

### Resumen de hallazgos

| ID | Título | Fuente | Severidad | Estado |
|---|---|---|---|---|
| F-01 | Rutas con acceso a base de datos sin rate limiting | CodeQL | Alta | Corregido |
| F-02 | Dependencias transitivas vulnerables | Dependabot / `npm audit` | Crítica | Corregido |
| F-03 | Endpoints de escritura y auditoría sin autenticación | Revisión + pentest | Alta | Corregido |
| F-04 | Acciones de GitHub con tag mutable | Semgrep | Media | Corregido parcial |
| F-05 | `$host` no validado en `proxy_set_header Host` | Semgrep | Baja | Abierto (aceptado) |
| F-06 | Cabecera `X-Powered-By` | Revisión, prueba y ZAP | Baja | Corregido en la API; abierto en el frontend |
| F-07 | Rate limiting posiblemente compartido por IP del proxy | Revisión de código | Media | Abierto (sin validar) |
| F-08 | Configuración de Dependabot con nombre de archivo erróneo | Revisión de proceso | Baja | Corregido y verificado |
| F-09 | Frontend sin CSP, anti-clickjacking, `nosniff` ni cabeceras Cross-Origin | OWASP ZAP | Media | Abierto |

---

## Hallazgo F-01 — Falta de rate limiting
- **Título:** Rutas de la API y del frontend con acceso a base de datos sin límite de peticiones.
- **Categoría OWASP/CWE:** A04:2021 Insecure Design / CWE-770 (asignación de recursos sin límites). Regla CodeQL `js/missing-rate-limiting`.
- **Severidad y justificación:** Alta (CodeQL la clasifica *High*). Un cliente puede lanzar peticiones repetidas que consumen conexiones del pool de PostgreSQL (`max: 10`) y degradan el servicio. Las rutas de lectura son públicas por diseño, lo que aumenta la exposición.
- **Evidencia minimizada:** 3 alertas en el PR #6 (`index.js` líneas 139, 157, 180) y 7 en `main` (6 en `alerts-api/src/index.js` y 1 en `web-frontend/server.js:29`). Mensaje: *"This route handler performs a database access, but is not rate-limited"*.
  ![CodeQL inicial](../evidence/lab5/hallazgos_CodeQL.png)
- **Impacto:** Disponibilidad (principal). Confidencialidad/integridad indirectas al facilitar fuerza bruta sobre la API key.
- **Pasos de validación segura en entorno propio:** `npm test -w alerts-api` ejecuta 61 peticiones concurrentes a `/api/audit` y espera que la última devuelva `429`. Ejecutar solo contra la instancia local.
- **Corrección:** `38cf99b` (rate limit de la API: 60 solicitudes por minuto, cabeceras `RateLimit` estándar draft-8, mensaje `rate_limit_exceeded`; nueva dependencia `express-rate-limit`) y `7fe9051` (el mismo límite en `web-frontend/server.js`). PR #6 y PR #7.
- **Resultado del reescaneo:** CodeQL en `main`: **0 abiertas, 7 cerradas como "fixed"**.
  ![CodeQL corregido](../evidence/lab5/hallazgos_fixed_CodeQL.png)
- **Reescaneo de las pruebas:** `npm test` con las **5** pruebas en verde el 8 nov 2026 (61 solicitudes a `/api/audit`: las primeras responden 401 y las últimas 429).
  ![5 pruebas en verde](../evidence/lab5/security_test_5_pruebas.png)

## Hallazgo F-02 — Dependencias transitivas vulnerables
- **Título:** `proxy-addr`, `body-parser` y `qs` con vulnerabilidades conocidas (5 advisories).
- **Categoría OWASP/CWE:** A06:2021 Vulnerable and Outdated Components.
- **Severidad y justificación:** Crítica por el advisory de `proxy-addr` (Critical). Los demás: `body-parser` High (DoS), `qs` Moderate (×3, DoS y bypass del límite de arrays). Son dependencias de Express que procesan entrada no confiable en cada petición.
- **Evidencia minimizada:**

  | # | Paquete | Severidad | Corregida en |
  |---|---|---|---|
  | 3 | proxy-addr | Critical | 2.0.8 (desde 2.0.7) |
  | 4 | body-parser | High | 1.20.9 (desde 1.20.8) |
  | 1, 2, 5 | qs | Moderate | 6.16.2 (desde 6.15.3) |

  ![Dependabot inicial](../evidence/lab5/alertas_iniciales_dependatbot.png)
  ![npm audit](../evidence/lab5/npm_audit_y_outdated.png)
- **Impacto:** Disponibilidad (DoS por parseo), integridad de los controles basados en IP (spoofing).
- **Pasos de validación segura:** `npm audit` desde la raíz del repositorio; no requiere explotar nada. `npm audit fix` fue la vía sugerida por la herramienta.
- **Corrección:** `541cc20` — actualiza `package-lock.json` (también `express` 4.22.2 → 4.22.3). PR #6.
- **Resultado del reescaneo:** Dependabot: **0 abiertas, 5 cerradas "Fixed"**.
  ![Dependabot corregido](../evidence/lab5/alertas_fixed_dependatbot.png)
  ![npm audit después](../evidence/lab5/npm_audit_after.png)
- **Verificación local:** `npm audit` → *found 0 vulnerabilities*. La captura inicial de `npm outdated` quedó sin salida, por lo que no se usa como evidencia de "dependencias al día".
- **Seguimiento: migración a Express 5 (`7e76984`, 8 nov, sin PR).** El lockfile de `main` @ `4f31229` resuelve `express` 5.3.0, `body-parser` 2.4.0, `qs` 6.17.1 y `proxy-addr` 2.0.8, todos fuera de los rangos vulnerables de F-02. El 8 nov, `npm audit` dio 0 vulnerabilidades y `npm test` 5/5 sobre ese estado. Falta la captura y un run de CI sobre ese commit (ver `SECURITY.md` §2.7). La migración obligó a cambiar el comodín `app.get('*')` del frontend por `app.get('/{*splat}')`.

## Hallazgo F-03 — Endpoints sin autenticación
- **Título:** `POST /api/alerts`, `PATCH /api/alerts/:id/status`, `POST /api/alerts/aggregates` y `GET /api/audit` accesibles sin credenciales.
- **Categoría OWASP/CWE:** A01:2021 Broken Access Control / CWE-306 (falta de autenticación en función crítica).
- **Severidad y justificación:** Alta. Permitía alterar el estado de incidentes (integridad), e inyectar alertas falsas o leer el historial de auditoría (confidencialidad), y la falta de identidad afecta la trazabilidad. Era una limitación declarada del Lab 3 con aplazamiento al Lab 4.
- **Evidencia minimizada:** diff de `70dd82a` (se añade `requireApiKey` a las cuatro rutas). Resultado del pentest: P-02 y P-03 → 401; P-04 con clave válida → 200. La clave real aparece tachada.
  ![Resultados del pentest](../evidence/lab5/resultados_pentests_controlados.png)
- **Impacto:** Integridad (alto), confidencialidad (medio, auditoría), disponibilidad (bajo, mediante carga de alertas).
- **Pasos de validación segura en entorno propio:** ver [registro del pentest](#registro-del-pentest-controlado).
- **Corrección:** `70dd82a` — middleware `requireApiKey` que lee `API_KEY` del entorno, devuelve `503 api_key_not_configured` si no está definida (falla cerrada), y compara con `crypto.timingSafeEqual` tras verificar la longitud; respuesta genérica `401 {"error":"unauthorized"}`. PR #6.
- **Resultado del reescaneo:** pruebas de regresión 4/4 en verde.
  ![Pruebas de regresión](../evidence/lab5/security_test.png)
- **Límites:** (a) una única clave compartida, sin rotación ni identidad por usuario; (b) `GET /api/alerts` y `GET /api/alerts/:id` siguen públicos por diseño; (c) falta la captura "antes" (ver §5 de `SECURITY.md`); (d) no hay prueba positiva automatizada (clave válida → 200).

## Hallazgo F-04 — Acciones de GitHub con tag mutable
- **Título:** Acciones de terceros referenciadas por tag o rama (`@v4`).
- **Categoría OWASP/CWE:** A08:2021 Software and Data Integrity Failures / CWE-829. Regla Semgrep `github-actions-mutable-action-tag`.
- **Severidad y justificación:** Media (Semgrep: WARNING). Un tag puede reasignarse y ejecutar código distinto dentro del pipeline que maneja `GITHUB_TOKEN` y `secrets.API_KEY`.
- **Evidencia minimizada:** 5 hallazgos en `seguridad-estatica.yml` (líneas 14, 15, 24, 33, 37) en [`semgrep_before.json`](../evidence/SAST/semgrep_before.json).
- **Impacto:** Integridad de la cadena de suministro del CI.
- **Pasos de validación segura:** `python evidence/SAST/resumen.py` (ajustando el archivo a leer) o `semgrep scan --config p/owasp-top-ten`. Solo lectura estática.
- **Corrección:** `d043d24` fija a SHA los pasos de Semgrep y Gitleaks (checkout, setup-python, upload-artifact, gitleaks-action), con el tag como comentario. PR #5.
- **Resultado del reescaneo (tras el PR #5):** 0 hallazgos de esta regla en [`semgrep_after_pr5.json`](../evidence/SAST/semgrep_after_pr5.json) (9 → 4 en total).
- **Reescaneo posterior (8 nov 2026, [`semgrep_after.json`](../evidence/SAST/semgrep_after.json)):** la regla vuelve a aparecer **5 veces**, tal como se anticipó: `seguridad-estatica.yml` líneas 45 y 46 (job `pruebas`) y `dast-local.yml` líneas 32, 33 y 56. Confirma que la corrección es parcial.
- **Corrección parcial — pendiente:** el commit posterior `70dd82a` añadió el job `pruebas` con `actions/checkout@v4` y `actions/setup-node@v4` (líneas 45–46), y `dast-local.yml` conserva `@v4` en tres pasos (líneas 32, 33, 56). Son referencias mutables que no estaban en el escaneo posterior al PR #5 y que el reescaneo del 8 nov confirmó. Recomendación: fijarlas a SHA y reejecutar Semgrep.

## Hallazgo F-05 — `$host` en la configuración de Nginx
- **Título:** Uso de `$host` en `proxy_set_header Host $host`.
- **Categoría OWASP/CWE:** A05:2021 Security Misconfiguration. Regla Semgrep `request-host-used`.
- **Severidad y justificación:** Baja. El valor puede ser controlado por el cliente (cabecera `Host`); el impacto depende de si la aplicación usa el host para construir URLs, cosa que este MVP no hace.
- **Evidencia minimizada:** 4 hallazgos: `nginx/muvautomation.conf:14`, `nginx/muvautomation-hardened.conf:48`, y `evidence/retest/nginx_before.conf:7,13`. Estos dos últimos son una **copia de evidencia** del estado anterior, no configuración activa (triage: no accionable).
- **Impacto:** Bajo (posible envenenamiento de cabecera Host si en el futuro se generan enlaces absolutos).
- **Pasos de validación segura:** revisar el código para confirmar que ningún componente construye URLs a partir de `Host`.
- **Corrección:** ninguna aplicada. **Decisión: riesgo aceptado para el laboratorio.** Mitigación recomendada: `server_name` explícito, `default_server` que rechace hosts desconocidos, o `proxy_set_header Host 127.0.0.1;`.
- **Resultado del reescaneo:** persiste sin cambios (4 → 4).

## Hallazgo F-06 — Cabecera `X-Powered-By`
- **Título:** Express anunciaba su tecnología en cada respuesta.
- **Categoría OWASP/CWE:** A05:2021 Security Misconfiguration / CWE-497 (exposición de información del sistema). Alerta ZAP 10037. Corresponde también al riesgo H2 del registro de Lab 3.
- **Severidad y justificación:** Baja. Facilita el reconocimiento de la tecnología y sus vulnerabilidades, no es explotable por sí sola.
- **Evidencia minimizada:** ZAP reportó `X-Powered-By: Express` en 5 recursos del frontend (`/`, `/app.js`, `/styles.css`, `/robots.txt`, `/sitemap.xml`), informe del 6 nov 2026. En la API, la prueba `no expone X-Powered-By` pasa (GET a una ruta inexistente y verificación de que la cabecera es `null`) y las respuestas del pentest no la incluyen.
- **Impacto:** Confidencialidad (baja).
- **Pasos de validación segura:** `curl -i http://127.0.0.1:3001/ruta-inexistente` y `curl -i http://127.0.0.1:3000/`, buscando `X-Powered-By`.
- **Corrección:** `70dd82a` — `app.disable('x-powered-by')` y prueba de regresión, **solo en `alerts-api`**. PR #6.
- **Resultado del reescaneo:** API corregida (prueba 1/5 en verde, [`security_test.png`](../evidence/lab5/security_test.png)). **El frontend sigue abierto:** `app/web-frontend/server.js` no deshabilita la cabecera (sin `app.disable('x-powered-by')` ni `helmet`) y el Nginx endurecido no usa `proxy_hide_header`, así que también se filtra a través del proxy. No hay reescaneo ZAP que lo confirme en ejecución. Corrección propuesta: `app.disable('x-powered-by')` en el frontend o `proxy_hide_header X-Powered-By;` en Nginx.

## Hallazgo F-07 — Rate limiting posiblemente compartido por IP del proxy
> **Estado: hipótesis de revisión de código. No fue reproducida ni medida.**
- **Título:** Los limitadores identifican al cliente por `req.ip`, pero la aplicación no configura `trust proxy`, y el frontend reenvía las llamadas a la API desde `127.0.0.1`.
- **Categoría OWASP/CWE:** A04:2021 / CWE-770 (efecto colateral del control de F-01).
- **Severidad y justificación:** Media (si se confirma). Detrás de Nginx → `web-frontend` → `alerts-api`, la IP vista puede ser siempre la del proxy anterior, de modo que **todos los usuarios compartirían el mismo cupo de 60 peticiones por minuto**: un cliente podría agotarlo y provocar denegación de servicio a los demás. Además, `express-rate-limit` v8 puede emitir un error de validación si recibe `X-Forwarded-For` sin `trust proxy`.
- **Evidencia minimizada:** `app/alerts-api/src/index.js` (`rateLimit` sin opciones de proxy), `app/web-frontend/server.js` (`proxyApiRequest` crea la petición hacia `127.0.0.1` y copia las cabeceras), `nginx/muvautomation-hardened.conf` (añade `X-Forwarded-For`). `grep "trust proxy" app` no devuelve resultados.
- **Impacto:** Disponibilidad.
- **Pasos de validación segura en entorno propio:** levantar la pila local, enviar 61 peticiones desde dos IPs o con distintos `X-Forwarded-For` a través del frontend y observar si ambas comparten el contador (`RateLimit-Remaining`).
- **Corrección:** pendiente. Opciones: `app.set('trust proxy', 1)` en frontend y API (con el número de saltos real) y reenviar la IP del cliente desde el proxy del frontend.
- **Resultado del reescaneo:** no aplica.

## Hallazgo F-08 — Configuración de Dependabot con nombre erróneo
- **Título:** El archivo se llamaba `.github/dependatbot.yml` y GitHub solo lee `.github/dependabot.yml`.
- **Categoría OWASP/CWE:** A06:2021 (control de proceso, no una vulnerabilidad de código).
- **Severidad y justificación:** Baja. Las alertas de seguridad de Dependabot funcionan sin ese archivo (por eso se generaron las 5 alertas), pero **las actualizaciones de versión semanales (`npm` y `github-actions`) no se ejecutaban**, y con ellas tampoco la actualización automática de las acciones fijadas por SHA de F-04.
- **Evidencia minimizada:** captura del alcance con la pestaña `dependantbot.yml` ([`rama_sha_security_md_alcance.png`](../evidence/lab5/rama_sha_security_md_alcance.png)). En el historial de git los commits de dependencias son manuales (`541cc20`).
- **Impacto:** Mantenimiento; deja dependencias sin actualizar entre alertas.
- **Efecto colateral:** con el nombre correcto, Semgrep analiza el archivo y marca 2 veces `dependabot-missing-cooldown` (líneas 3 y 7 de `dependabot.yml`). Bajo valor; se corrige añadiendo `cooldown` a cada ecosistema.
- **Pasos de validación segura:** *Insights → Dependency graph → Dependabot* debe mostrar el estado de los ecosistemas configurados.
- **Corrección:** el archivo se renombró a `.github/dependabot.yml` (commit `555a33e`, contenido sin cambios).
- **Resultado del reescaneo:** verificado. Pocos minutos después del renombrado, Dependabot abrió **5 Pull Requests de actualización (#9 a #13)**: 4 de `github_actions` (`checkout` 4 → 7, `upload-artifact` 4 → 7, `setup-python` 5.6.0 → 7.1.0, `setup-node` 4 → 7) y 1 de `npm` (`dotenv` 16.6.1 → 18.0.9). Los 5 pasan 5/5 checks. Siguen abiertos y sin fusionar; son saltos de versión mayor y requieren triage.
  ![PR abiertos por Dependabot](../evidence/lab5/dependabot_prs_abiertos.png)

## Hallazgo F-09 — Frontend sin cabeceras de seguridad
- **Título:** El servidor del frontend no envía CSP, anti-clickjacking, `X-Content-Type-Options` ni otras cabeceras de seguridad.
- **Categoría OWASP/CWE:** A05:2021 Security Misconfiguration / CWE-693 (protección insuficiente) y CWE-1021 (restricción inadecuada de frames). Alertas ZAP 10038, 10020, 10021, 10063 y 90004.
- **Severidad y justificación:** Media (ZAP: 2 Medium, CSP y anti-clickjacking, más 4 Low). Sin CSP, un XSS futuro no tendría contención; sin anti-clickjacking, el dashboard puede incrustarse en un frame ajeno. Hoy no hay XSS demostrado y la app no maneja sesiones, lo que modera el impacto.
- **Evidencia minimizada:** [`zap-report.json`](../evidence/ZAP/zap-report.json) (6 nov 2026): CSP (3 instancias), Anti-clickjacking (3), `nosniff` (5), Permissions-Policy (4), COEP/COOP/CORP (3 cada una).
- **Impacto:** Integridad del cliente (clickjacking) y confidencialidad (efectos de un posible XSS).
- **Pasos de validación segura:** `curl -i http://127.0.0.1:3000/` y revisar las cabeceras; o repetir el workflow DAST pasivo.
- **Corrección:** pendiente. Opciones: (a) `helmet()` en `web-frontend/server.js` con una CSP acorde a `app.js` y `styles.css` propios; (b) `add_header` en Nginx para CSP y Permissions-Policy (el endurecido ya cubre `nosniff`, `X-Frame-Options` y `Referrer-Policy`). Las tres cabeceras Cross-Origin son opcionales para esta app.
- **Resultado del reescaneo:** no aplica; el informe ZAP archivado es el inicial.

> ⚠️ **PENDIENTE (depende de la corrección): informe ZAP "después"** en `evidence/ZAP/after/` (ver `SECURITY.md` §2.4).

---

## Registro del pentest controlado

- **Autorización:** María Belén Quintero, viernes 6 de noviembre de 2026. Solo el API local propio, con datos ficticios.
- **Objetivo:** verificar que las rutas de modificación exigen una clave de API válida (control añadido en `70dd82a`).
- **Herramientas:** `curl.exe` en PowerShell y un archivo `body.json` con `{"status":"closed"}`.
- **Clave de API:** definida en `.env` (no versionado); en la captura se muestra tachada. No se reproduce aquí.

| ID | Solicitud | Esperado | Observado | Hora (GMT, cabecera `Date`) | Resultado |
|---|---|---|---|---|---|
| P-01 | `GET http://127.0.0.1:3001/health` | 200 con BD operativa | `200` `{"status":"ok","service":"alerts-api","database":"ok"}` | — | Pasa |
| P-02 | `PATCH /api/alerts/alert-004/status` sin `x-api-key` | 401 | `401 Unauthorized` `{"error":"unauthorized"}` (24 bytes) | Sáb 07 Nov 2026 01:12:57 | Pasa |
| P-03 | Igual con `x-api-key: incorrecta` | 401 | `401 Unauthorized`, mismo cuerpo | 01:13:14 | Pasa |
| P-04 | Igual con la clave real | 200 y cambio de estado | `200 OK`, `alert-004` → `"status":"closed"`, `updated_timestamp` `2026-11-07T01:13:31.373Z` | 01:13:31 | Pasa |

**Observaciones**
- El 401 sin clave y con clave incorrecta es idéntico en código, cuerpo y longitud: no hay un oráculo que distinga "falta" de "incorrecta".
- La respuesta no incluye `X-Powered-By`; solo aparece `Vary: Origin` por CORS.
- P-04 modificó un dato ficticio y generó una fila en `audit_log`; la prueba no es estrictamente "no destructiva" en el sentido de solo lectura, pero es reversible (`PATCH` con `"new"`).
- Las 3 pruebas del API coinciden con las pruebas de regresión de `security.test.js` (ejecutadas el 2026-11-07 00:34:22 UTC: 4/4 en verde).
- Vinculación con los logs: `app/alerts-api/logs/app.log` registra las solicitudes de las pruebas automatizadas (`PATCH … 401`, `GET /api/audit … 401`).

**Conclusión del pentest:** hipótesis **validada**. Recomendación: prueba de regresión positiva (clave válida → 200), rotación de la clave, y registro de intentos fallidos con alerta (ver F-07 sobre la identificación por IP).

**Evidencia:**
![body.json](../evidence/lab5/bodyJson_pentest.png)
![Solicitudes y respuestas](../evidence/lab5/resultados_pentests_controlados.png)

> ⚠️ **PENDIENTE: captura de la prueba equivalente al P-02 sobre el commit anterior (`09d876b`)** para demostrar el "antes" (se espera `200` sin clave). Ruta: `evidence/lab5/pentest_before.png`.
>
> <!-- ![Pentest antes: PATCH sin clave aceptado](../evidence/lab5/pentest_before.png) -->

---

## Reflexión final
**Qué identificaron las herramientas.** CodeQL encontró el único problema de lógica de aplicación (rutas sin rate limiting); Dependabot detectó el riesgo más grave (`proxy-addr` crítico) en dependencias que el equipo nunca declaró directamente; Semgrep encontró riesgos de cadena de suministro del CI y configuración de Nginx; Gitleaks no encontró secretos, lo cual coincide con la higiene del repositorio (`.env` ignorado, plantilla con marcadores).

**Qué omitieron.** Ninguna herramienta detectó que las rutas de escritura no tenían autenticación: esa clase de fallo (control de acceso) requiere entender la intención de la aplicación y se halló por revisión y prueba manual. Tampoco detectaron la errata del archivo de Dependabot (F-08) ni el posible cupo compartido por IP (F-07), que surgen de leer la arquitectura completa. ZAP en modo pasivo solo vio el frontend (5 URL, ninguna de `/api`), por lo que no pudo evaluar la API, la autenticación ni el abuso de lógica; solo aportó hallazgos de cabeceras.

**Cómo integrar seguridad en el ciclo de desarrollo.** (1) Mantener los checks en cada PR y volverlos bloqueantes tras el triage (hoy `|| true`). (2) Mantener Dependabot activo (F-08, ya verificado con 5 PR del bot) y fijar acciones por SHA con actualización automática, haciendo triage de los PR que abre, sobre todo los de versión mayor. (3) Convertir cada hallazgo corregido en una prueba de regresión, como ya se hizo con 401 y 429. (4) Hacer revisión de control de acceso en cada endpoint nuevo, porque las herramientas automáticas no la cubren. (5) Guardar siempre el artefacto de cada escaneo en `evidence/`, no solo en Actions, que caduca (el informe ZAP se archivó en `evidence/ZAP/`). (6) Darle a ZAP la lista de rutas de la API (por ejemplo con una definición OpenAPI) para que el DAST llegue a `/api`.
