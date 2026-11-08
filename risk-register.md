# Registro de riesgos — Laboratorio 3

| ID | Amenaza STRIDE | Descripción | Estado | Evidencia | Acción / Justificación |
|----|-----------------|-------------|--------|-----------|--------------------------|
| H1 | Information Disclosure | HTTP permite observar contenido y rutas en tránsito (PCAP) | Pendiente para Lab 4 | evidence/blue/lab3-http.pcap | Requiere HTTPS/TLS (Lab 4) |
| H2 | Information Disclosure | Headers/respuestas revelan tecnología o recursos | Mitigado | evidence/retest/headers_after.txt | server_tokens off + headers de seguridad |
| H3 | Repudiation | Sin correlación temporal, no se atribuyen solicitudes | Parcial | evidence/blue/access_log_baseline.txt | El registro contiene timestamps y solicitudes; falta una correlación formal con una fuente temporal externa |
| H4 | Tampering | Sin TLS, un intermediario podría alterar tráfico | Pendiente para Lab 4 | — | Requiere HTTPS/TLS (Lab 4) |
| H5 | Information Disclosure | Ruta oculta `.git/config` accesible | Mitigado en el retest | evidence/retest/hidden_path.txt | La ruta respondió HTTP 403 con la configuración endurecida |



## Gaps de seguridad de la arquitectura actual

La evaluación inicial identificó riesgos asociados a la configuración del sitio estático. La arquitectura actual incorpora Nginx, `web-frontend`, `alerts-api` y PostgreSQL, por lo que se deben evaluar también la exposición de puertos, el acceso entre servicios, la configuración de CORS y el manejo de errores.

| Gap | Riesgo | Mejora | Arquitectura fortalecida |
|---|---|---|---|
| H6 — Exposición de puertos internos | Los puertos 3000 (frontend), 3001 (API) o 5432 (PostgreSQL) pueden ser accesibles desde redes externas, facilitando ataques directos a servicios internos. | Permitir tráfico público únicamente hacia Nginx en 80/443; limitar SSH al CIDR administrativo y bloquear el acceso externo directo a los servicios internos mediante firewall. | Mitigado desde el punto de observación del retest: 3000, 3001 y 5432 aparecen filtrados y UFW los deniega. |
| H7 — Acceso directo a PostgreSQL | La exposición del puerto 5432 aumenta el riesgo de intentos de acceso no autorizado, fuerza bruta y explotación de vulnerabilidades de la base de datos. | Configurar PostgreSQL para escuchar solo en localhost o en una interfaz privada cuando la topología lo requiera; restringir el puerto mediante firewall y reglas de autenticación. | Mitigado: PostgreSQL escucha en `127.0.0.1`/`::1` y el puerto está denegado por UFW. |
| H8 — CORS demasiado permisivo | Una política CORS abierta puede permitir que sitios de terceros realicen solicitudes desde navegadores hacia la API, según las credenciales y los controles de la aplicación. | Configurar una lista explícita de orígenes permitidos y validar los métodos y encabezados necesarios. No usar `*` si se requieren credenciales. | Pendiente en el despliegue observado: `curl_api_external.txt` aún muestra `Access-Control-Allow-Origin: *`, aunque la validación local del código sí rechazó un origen no autorizado. |
| H9 — Mensajes de error demasiado detallados | Las respuestas que revelan excepciones, rutas internas o detalles de infraestructura pueden facilitar el reconocimiento y la explotación de fallos. | Devolver mensajes genéricos al cliente y registrar los detalles técnicos únicamente en logs internos, sin secretos ni datos sensibles. | La API separa los mensajes públicos de los diagnósticos internos. |
| H10 — Ausencia de limitación de solicitudes | Un cliente puede enviar solicitudes repetidas a Nginx o a la API, consumir recursos y degradar la disponibilidad. | Implementar `limit_req_zone` y `limit_req` en Nginx, ajustar los límites a las necesidades de la aplicación y probar que no bloqueen tráfico legítimo. | Mitigado en el retest: la ráfaga produjo 28 respuestas 200 y 12 respuestas 503, evidencia de que el límite se aplica. |
| H11 — Cifrado de transporte insuficiente | Si el tráfico sensible se transmite sin HTTPS o se permiten protocolos TLS obsoletos, puede aumentar el riesgo de interceptación. | Habilitar HTTPS, preferir TLS 1.3, admitir TLS 1.2 como mínimo y deshabilitar TLS 1.0/1.1. | Nginx termina TLS en el punto de entrada público y reenvía las solicitudes a los servicios internos según la configuración de confianza. |
| H12 — Evidencia de retest incompleta | Sin resultados comparables antes y después, no es posible demostrar que las restricciones de red y los controles de la API funcionan. | Guardar resultados reales de Nmap, estado de UFW y pruebas `curl`, con fecha, objetivo y contexto de ejecución. | Parcialmente mitigado: existe evidencia real de Nmap, UFW, PostgreSQL, cabeceras, ruta oculta, rate limiting y API; CORS desplegado y HTTPS continúan pendientes. |

---

## Riesgos del Laboratorio 5 (SAST, SCA, DAST y pentest)

Detalle en [`docs/REPORTE_HALLAZGOS.md`](docs/REPORTE_HALLAZGOS.md) y evidencia en [`docs/SECURITY.md`](docs/SECURITY.md).

| ID | Amenaza STRIDE | Descripción | Estado | Evidencia | Acción / Justificación |
|----|-----------------|-------------|--------|-----------|--------------------------|
| H13 (F-01) | Denial of Service | Rutas con acceso a base de datos sin rate limiting (CodeQL, 7 alertas High) | Mitigado | `evidence/lab5/hallazgos_CodeQL.png`, `hallazgos_fixed_CodeQL.png` | `express-rate-limit` 60 req/min en API y frontend (PR #6, #7). CodeQL: 0 abiertas |
| H14 (F-02) | Denial of Service / Spoofing | `proxy-addr` (Critical), `body-parser` (High) y `qs` (Moderate x3) vulnerables | Mitigado | `evidence/lab5/alertas_iniciales_dependatbot.png`, `alertas_fixed_dependatbot.png` | Lockfile actualizado (`541cc20`). Dependabot: 0 abiertas. `npm audit` 0 (`npm_audit_after.png`). El 8 nov se migró a Express 5 (`7e76984`, sin PR): `npm audit` sigue en 0, falta captura |
| H15 (F-03) | Spoofing / Tampering / Elevation of Privilege | Endpoints de escritura y auditoría sin autenticación (limitación de Lab 3) | Mitigado | `evidence/lab5/resultados_pentests_controlados.png`, `security_test.png` | API key con `timingSafeEqual` (`70dd82a`). Pentest: 401, 401, 200. Residual: clave única sin rotación; lecturas públicas por diseño |
| H16 (F-04) | Tampering (cadena de suministro) | Acciones de GitHub con tag mutable | Parcial | `evidence/SAST/semgrep_before.json`, `semgrep_after_pr5.json`, `semgrep_after.json` | Fijadas por SHA en Semgrep y Gitleaks (`d043d24`). El reescaneo del 8 nov confirmó 5 sin SHA en el job `pruebas` y en `dast-local.yml`; se fijaron ese día en el árbol de trabajo (sin commit). Pendiente reescaneo |
| H17 (F-05) | Spoofing | `$host` sin validar en `proxy_set_header Host` (Semgrep `request-host-used`) | Aceptado | `evidence/SAST/semgrep_after.json` | Bajo impacto: la app no construye URLs desde `Host`. Mitigación: `server_name` explícito |
| H18 (F-07) | Denial of Service | Rate limiting posiblemente compartido por la IP del proxy (sin `trust proxy`) | Abierto (sin validar) | — | Hipótesis por revisión de código; validar y configurar `trust proxy` |
| H19 (F-08) | — (proceso) | Configuración de Dependabot con nombre `dependatbot.yml`: sin actualizaciones de versión | Mitigado | `evidence/lab5/dependabot_prs_abiertos.png` | Archivo renombrado a `.github/dependabot.yml` (`555a33e`). Dependabot abrió 5 PR (#9 a #13), fusionados el 8 nov. Pendiente menor: `cooldown` |
| H20 (F-06) | Information Disclosure | Cabecera `X-Powered-By: Express` | Mitigado en el código (pendiente de commit y ZAP) | `evidence/lab5/security_test.png`, `evidence/ZAP/zap-report.json` | Desactivada en la API (`70dd82a`, con prueba). En el frontend, `app.disable` y `helmet` el 8 nov (6 pruebas en local); falta ZAP posterior |
| H21 (F-09) | Tampering / Information Disclosure | El frontend no envía CSP, anti-clickjacking, `nosniff` ni Permissions-Policy (ZAP: 2 Medium, 6 Low) | Mitigado en el código (pendiente de commit y ZAP) | `evidence/ZAP/zap-report.html`, `zap-report.json` | `helmet` en el frontend con CSP propia (8 nov, 6 pruebas en local). Falta commit, PR y reescaneo con ZAP. HSTS pendiente hasta tener HTTPS |
| H22 | — | El informe ZAP archivado es el inicial y no alcanzó `/api` | Abierto | `evidence/ZAP/zap.yaml` | Reejecutar tras corregir y ampliar el alcance con las rutas de la API. `dast-local.yml` apunta a `:3001` (API) desde `e075efb`: para las cabeceras del frontend hay que escanear `:3000` |

H8 (CORS desplegado) y H1/H4 (HTTPS) del laboratorio anterior siguen como estaban.

---
