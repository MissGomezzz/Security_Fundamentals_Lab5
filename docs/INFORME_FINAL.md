# Informe final — Laboratorio 5: seguridad en el ciclo de desarrollo

**Proyecto:** `muvautomation-secure-challenge`
**Integrantes:** María Belén Quintero Aldana, Ángela Sofía Gómez Valencia
**Repositorio:** <https://github.com/MissGomezzz/Security_Fundamentals_Lab5>
**Periodo:** 28 de octubre al 8 de noviembre de 2026
**Estado final evaluado:** `main` @ `9968a09` (merge del PR #7)

## 1. Resumen
Se agregó al proyecto un pipeline de seguridad integrado a GitHub (Semgrep, CodeQL, Gitleaks, Dependabot, OWASP ZAP baseline y pruebas de regresión) y se usó para detectar, corregir y reescanear vulnerabilidades en una aplicación con datos ficticios. Se registraron 9 hallazgos: 6 corregidos y verificados (incluye F-08) y 3 abiertos (F-05 aceptado, F-07 sin validar, F-09 cabeceras del frontend). F-04 y F-06 conservan una parte abierta. El indicador más claro de mejora es que las alertas pasaron de **5 abiertas a 0 en Dependabot** y de **7 a 0 en CodeQL**, y que el pipeline del PR quedó con **7 de 7 checks en verde**.

## 2. Resultados por entregable

| Entregable | Estado | Dónde está |
|---|---|---|
| Evidencia de Semgrep | Completo (JSON antes/después). Falta captura del job (opcional) | [`evidence/SAST/`](../evidence/SAST/), `SECURITY.md` §2.1 |
| Evidencia de CodeQL | Completo | `evidence/lab5/hallazgos_CodeQL.png`, `hallazgos_fixed_CodeQL.png` |
| Evidencia de Gitleaks / Secret Scanning | Completo (Gitleaks: *No leaks detected*) | `evidence/lab5/gitleaks_log.png`, `SECURITY.md` §2.3 |
| Evidencia de Dependabot | Completo: alertas antes/después, `npm audit` posterior y los 6 PR de actualización que abrió el bot | `alertas_iniciales_dependatbot.png`, `alertas_fixed_dependatbot.png`, `npm_audit_y_outdated.png`, `npm_audit_after.png`, `dependabot_prs.png` |
| Reporte de OWASP ZAP | Completo (informe inicial archivado); sin reescaneo | [`evidence/ZAP/`](../evidence/ZAP/), `SECURITY.md` §2.4 |
| Registro del pentest controlado | Completo, sin la captura "antes" | `REPORTE_HALLAZGOS.md`, `bodyJson_pentest.png`, `resultados_pentests_controlados.png` |
| Reporte de vulnerabilidades | Completo | [`REPORTE_HALLAZGOS.md`](REPORTE_HALLAZGOS.md) |
| Evidencia antes/después | Completo | `SECURITY.md` §4 |
| Pull Request de integración | Documentado (#4, #5) con commits y merges; **sin capturas por decisión del equipo** | [`PULL_REQUESTS.md`](PULL_REQUESTS.md) |
| Pull Request de remediación | Documentado (#6, #7); captura post-merge del #7; el #6 solo tiene captura previa al merge | [`PULL_REQUESTS.md`](PULL_REQUESTS.md) |
| Informe final con conclusiones | Este documento | n/a |

La lista exacta de capturas y archivos que faltan está en [`evidence/lab5/README.md`](../evidence/lab5/README.md).

## 3. Línea de tiempo

| Fecha | Evento |
|---|---|
| 28 oct | PR #4: workflow Semgrep + Gitleaks y documentación (`9fe3d60`). Ajuste de SHA (`d043d24`) |
| 2 nov | PR #5 fusionado. Se versiona la evidencia SAST, Semgrep 9 → 4 (`09d876b`, commit base de la línea base) |
| 6 nov | Informe inicial de ZAP (17:32 UTC). Dependabot, API key y pruebas (`90168bd`, `70dd82a`). PR #6 abierto. CodeQL marca 3 alertas High (`40b58fa`). Pentest controlado, 20:12 hora local |
| 8 nov | Dependencias actualizadas (`541cc20`), rate limit de la API (`38cf99b`). PR #6 fusionado 11:38. Rate limit del frontend (`7fe9051`). PR #7 fusionado 11:54. Dependabot y CodeQL en 0 abiertas |

## 4. Antes y después

| Indicador | Antes | Después |
|---|---|---|
| Semgrep | 9 WARNING | 4 WARNING |
| CodeQL | 3 High en el PR; 7 en `main` | 0 abiertas, 7 cerradas |
| Dependabot | 5 abiertas (1 Critical, 1 High, 3 Moderate) | 0 abiertas, 5 cerradas |
| Escritura sin credenciales | Sin control | 401 sin clave o con clave errónea |
| Rate limiting | Ninguno | 60 solicitudes por minuto, 429 al exceder |
| Pruebas automáticas de seguridad | 0 | 5 (5/5 en verde en captura) |
| `npm audit` | 3 vulnerabilidades | 0 |
| OWASP ZAP | 0 H / 2 M / 6 L / 2 I (informe inicial) | Sin reescaneo |
| Checks del PR | CodeQL en rojo | 7/7 en verde (PR #6); checks en verde en el PR #7 |

## 5. Conclusiones
1. **El ciclo funcionó de punta a punta.** Cada hallazgo corregido tiene un commit, un PR y un reescaneo que lo confirma, salvo las excepciones señaladas (`npm audit` posterior y la captura "antes" del pentest).
2. **Lo más grave vino de fuera del código propio.** El único Critical fue una dependencia transitiva (`proxy-addr`), que el equipo no escogió ni revisó. Las alertas de Dependabot y el `package-lock.json` son un control de primera línea, no un accesorio.
3. **Las herramientas no sustituyen la revisión.** Ninguna señaló la falta de autenticación en los endpoints de escritura; se halló leyendo el código y probándolo. Los falsos negativos de este laboratorio son de lógica de acceso, no de sintaxis.
4. **Un corrector puede crear un riesgo nuevo.** El rate limiting que cerró F-01 puede aplicarse sobre la IP del proxy (F-07, sin validar), de modo que un solo cliente consuma el cupo de todos. Debe medirse antes de darlo por bueno.
5. **El verde del pipeline engaña.** `|| true` en Semgrep y `-I` en ZAP significan que los checks pasan aunque haya hallazgos. Hoy el CI documenta, pero no bloquea.
6. **Los controles de proceso fallan en silencio.** Un archivo de Dependabot mal nombrado (F-08) dejó desactivadas las actualizaciones de versión sin ningún aviso; al corregirlo, el bot abrió 6 PR en minutos (`dependabot_prs.png`). Las acciones sin fijar por SHA reaparecieron en el job `pruebas` (F-04) después de haberlas corregido.
7. **Una corrección parcial parece completa.** `X-Powered-By` se desactivó en la API pero no en el frontend (F-06), y ZAP lo ve justamente en el frontend. Cada corrección debe comprobarse en todos los servicios que comparten el patrón.
8. **El DAST solo ve lo que alcanza.** ZAP recorrió 5 URL del frontend y ninguna de `/api`; sus 10 alertas son de cabeceras. Una app con API necesita darle a ZAP las rutas de la API para que el DAST aporte algo más que cabeceras.
9. **Dependabot encontró un problema de compatibilidad antes que producción.** El PR de `express` 4 → 5 rompió el arranque del frontend y lo detectó el propio workflow DAST. Se comprobó con una prueba de humo comparativa (31 comprobaciones sobre Express 4 y 5) que, con un cambio de una línea, la aplicación funciona igual. Conclusión de proceso: los saltos de versión mayor se prueban con la app corriendo, no solo con las pruebas unitarias.

## 6. Riesgos residuales y decisiones

| ID | Riesgo | Decisión |
|---|---|---|
| F-05 | `$host` sin validar en Nginx | Aceptado para el laboratorio; corregir con `server_name` explícito |
| F-07 | Rate limit posiblemente compartido por IP del proxy | Abierto: validar y configurar `trust proxy` |
| F-08 | Dependabot sin actualizaciones de versión | **Corregido y verificado** (`555a33e`). Nuevo trabajo: triage de los 6 PR abiertos por el bot (#9 a #14), `express` 4 → 5 (#14) falló el DAST porque Express 5 no admite el comodín `app.get('*')`; se migró y validó en local (`evidence/express5/`), **falta commit y PR**; quedan #9 a #13 |
| F-09 | Frontend sin CSP, anti-clickjacking, `nosniff` | Abierto: `helmet` o `add_header` en Nginx, y reescaneo con ZAP |
| F-06 (parcial) | `X-Powered-By` en el frontend | Abierto: `app.disable('x-powered-by')` o `proxy_hide_header` |
| F-04 (parcial) | Acciones `@v4` en `pruebas` y `dast-local.yml` | Abierto: fijar por SHA |
| Heredado de Lab 3 | HTTP sin TLS (H1, H4), CORS en el despliegue de la VM (H8) | Ver [`risk-register.md`](../risk-register.md) |
| API key única | Sin rotación ni identidad por usuario | Aceptado en el laboratorio; usar OAuth/JWT o claves por cliente en producción |
| ZAP | Informe inicial archivado; sin reescaneo y sin cobertura de `/api` | Abierto: volver a ejecutar tras F-06 y F-09 |

## 7. Recomendaciones
1. Hacer bloqueantes Semgrep (por severidad), CodeQL y Gitleaks una vez hecho el triage; retirar `|| true`.
2. Hacer commit del archivo de Dependabot ya renombrado y agrupar sus PR de actualización; habilitar secret scanning con *push protection* si el plan lo permite.
3. Fijar todas las acciones por SHA y dejar que Dependabot las mantenga.
4. Validar el rate limiting detrás de Nginx (F-07) y añadir una prueba que verifique que dos clientes distintos no comparten cupo.
5. Añadir pruebas positivas (clave válida → 200) y de validación de entrada a `security.test.js`.
6. Archivar siempre los informes (ZAP, Semgrep) en `evidence/`, porque los artefactos de Actions caducan, y alimentar a ZAP con las rutas de la API.
7. Añadir `helmet` (o cabeceras equivalentes en Nginx) al frontend y volver a ejecutar ZAP para obtener el informe "después".
7. Antes de salir del laboratorio: HTTPS (Lab 4), rotación de la clave de API y retirada de la modificación de datos desde endpoints públicos.

## 8. Referencias internas
- [`SECURITY.md`](SECURITY.md) — evidencia por herramienta y pentest
- [`REPORTE_HALLAZGOS.md`](REPORTE_HALLAZGOS.md) — detalle de F-01 a F-09
- [`PULL_REQUESTS.md`](PULL_REQUESTS.md) — PR de integración y de remediación
- [`CHECKLIST_PR.md`](CHECKLIST_PR.md) — checklist del PR
- [`../risk-register.md`](../risk-register.md) — registro de riesgos (H1–H18)
- [`../evidence/lab5/README.md`](../evidence/lab5/README.md) — índice de evidencias y pendientes
