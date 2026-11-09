# Informe final — Laboratorio 5: seguridad en el ciclo de desarrollo

**Proyecto:** `muvautomation-secure-challenge`
**Integrantes:** María Belén Quintero Aldana, Ángela Sofía Gómez Valencia
**Repositorio:** <https://github.com/MissGomezzz/Security_Fundamentals_Lab5>
**Periodo:** 28 de octubre al 8 de noviembre de 2026
**Estado final evaluado:** `main` @ `a2b68b1` (8 nov 2026, 18:16). Las remediaciones de los PR #6 y #7 quedaron fusionadas en `9968a09`; después se renombró el archivo de Dependabot, se migró a Express 5 sin PR, se fusionaron los 5 PR de Dependabot y se subió, también sin PR, la remediación de F-04, F-06 y F-09 (`f775052` y `a2b68b1`)

## 1. Resumen
Se agregó al proyecto un pipeline de seguridad integrado a GitHub (Semgrep, CodeQL, Gitleaks, Dependabot, OWASP ZAP baseline y pruebas de regresión) y se usó para detectar, corregir y reescanear vulnerabilidades en una aplicación con datos ficticios. Se registraron 9 hallazgos: 6 corregidos y verificados (F-01, F-02, F-03, F-08 y las partes corregidas de F-04 y F-06) y 3 abiertos (F-05 aceptado, F-07 sin validar, F-09 cabeceras del frontend). F-04 y F-06 conservaban una parte abierta, que un reescaneo de Semgrep el 8 nov confirmó para F-04. Esa parte, y F-09, se corrigieron después en el código (`helmet`, acciones fijadas por SHA; `SECURITY.md` §2.8), con 11 pruebas en verde, un ZAP posterior sin Medium ni Low (de 2 Medium y 6 Low) y un Semgrep final sin la regla de acciones mutables, **ya en `main`, aunque subida sin Pull Request y sin captura de sus runs de CI**. El indicador más claro de mejora es que las alertas pasaron de **5 abiertas a 0 en Dependabot** y de **7 a 0 en CodeQL**, y que el pipeline del PR quedó con **7 de 7 checks en verde**.

## 2. Resultados por entregable

| # | Entregable | Estado | Dónde está |
|---|---|---|---|
| 1 | Evidencia de Semgrep | Completo: 4 JSON (antes, tras PR #5, intermedio 8 nov y final). Falta captura del job (opcional) | [`evidence/SAST/`](../evidence/SAST/), [`SECURITY.md` §2.1](SECURITY.md#21-semgrep-sast) |
| 2 | Evidencia de CodeQL | Completo | [`hallazgos_CodeQL.png`](../evidence/lab5/hallazgos_CodeQL.png), [`hallazgos_fixed_CodeQL.png`](../evidence/lab5/hallazgos_fixed_CodeQL.png), [`SECURITY.md` §2.2](SECURITY.md#22-codeql) |
| 3 | Evidencia de Gitleaks o Secret Scanning | Completo con Gitleaks (*No leaks detected*). Secret Scanning nativo no documentado | [`gitleaks_log.png`](../evidence/lab5/gitleaks_log.png), [`SECURITY.md` §2.3](SECURITY.md#23-gitleaks--secret-scanning) |
| 4 | Evidencia de Dependabot | Completo: alertas antes/después, `npm audit` antes/después y los 5 PR del bot | [`alertas_iniciales_dependatbot.png`](../evidence/lab5/alertas_iniciales_dependatbot.png), [`alertas_fixed_dependatbot.png`](../evidence/lab5/alertas_fixed_dependatbot.png), [`npm_audit_y_outdated.png`](../evidence/lab5/npm_audit_y_outdated.png), [`npm_audit_after.png`](../evidence/lab5/npm_audit_after.png), [`dependabot_prs_abiertos.png`](../evidence/lab5/dependabot_prs_abiertos.png) |
| 5 | Reporte de OWASP ZAP | Completo: informe inicial (6 nov) y posterior (8 nov), con HTML, JSON y plan de cada uno. El posterior, por su plan idéntico y su hora, es del workflow tras el push (a confirmar con la captura del run) | [`evidence/ZAP/zap-report-before/`](../evidence/ZAP/zap-report-before/), [`evidence/ZAP/zap-report-after/`](../evidence/ZAP/zap-report-after/), [`SECURITY.md` §2.4](SECURITY.md#24-owasp-zap-baseline) |
| 6 | Registro del pentest controlado | Completo, con captura "antes" (`pentest_before.png`) y "después" | [`REPORTE_HALLAZGOS.md`](REPORTE_HALLAZGOS.md#registro-del-pentest-controlado), [`bodyJson_pentest.png`](../evidence/lab5/bodyJson_pentest.png), [`resultados_pentests_controlados.png`](../evidence/lab5/resultados_pentests_controlados.png) |
| 7 | Reporte de vulnerabilidades | Completo (F-01 a F-09) | [`REPORTE_HALLAZGOS.md`](REPORTE_HALLAZGOS.md) |
| 8 | Evidencia antes/después de las correcciones | Completo (ZAP y Semgrep "después" archivados; falta la captura de sus runs de CI) | [`SECURITY.md` §4](SECURITY.md#4-validación-antes-y-después), §4 de este informe |
| 9 | Pull Request de integración | Documentado (#4, #5) con commits y merges. **Sin capturas por decisión del equipo** | [`PULL_REQUESTS.md`](PULL_REQUESTS.md) |
| 10 | Pull Request de remediación | Documentado (#6, #7). Captura post-merge del #7 y pre-merge del #6 | [`PULL_REQUESTS.md`](PULL_REQUESTS.md), [`all_workflows_pass_before_merge.png`](../evidence/lab5/all_workflows_pass_before_merge.png), [`pr7_ya_fucionado.png`](../evidence/lab5/pr7_ya_fucionado.png) |
| 11 | Informe final con conclusiones | Este documento | n/a |

La lista exacta de capturas y archivos que faltan está en [`evidence/lab5/README.md`](../evidence/lab5/README.md).

## 3. Línea de tiempo

| Fecha | Evento |
|---|---|
| 28 oct | PR #4: workflow Semgrep + Gitleaks y documentación (`9fe3d60`). Ajuste de SHA (`d043d24`) |
| 2 nov | PR #5 fusionado. Se versiona la evidencia SAST, Semgrep 9 → 4 (`09d876b`, commit base de la línea base) |
| 6 nov | Informe inicial de ZAP (17:32 UTC). Dependabot, API key y pruebas (`90168bd`, `70dd82a`). PR #6 abierto. CodeQL marca 3 alertas High (`40b58fa`). Pentest controlado, 20:12 hora local |
| 8 nov, mañana | Dependencias actualizadas (`541cc20`), rate limit de la API (`38cf99b`). PR #6 fusionado 11:38. Rate limit del frontend (`7fe9051`). PR #7 fusionado 11:54. Dependabot y CodeQL en 0 abiertas |
| 8 nov, tarde | Evidencia adicional (12:35 y 12:36). Dependabot renombrado a `dependabot.yml` (`555a33e`, 13:49) y abre 5 PR (#9 a #13). Migración a Express 5 en `main` sin PR y reescaneo de Semgrep (`7e76984`, 14:10). Ajuste de documentación (`4f31229`, 14:19). Merge de los PR #9 a #13 (17:46 a 17:51). `dast-local.yml` pasa a apuntar a la API (`e075efb`, 18:02) |
| 8 nov, tarde (18:15 y 18:16) | Remediación de F-04, F-06 y F-09, `.semgrepignore` y pruebas del frontend, subidas directamente a `main` (`f775052`, `a2b68b1`); el DAST vuelve a `:3000` |
| 8 nov, noche | Pentest "antes" (22:55 GMT). ZAP posterior (23:21 GMT): 0 Medium, 0 Low. Semgrep final: 4 hallazgos |

## 4. Antes y después

| Indicador | Antes | Después |
|---|---|---|
| Semgrep | 9 WARNING | 4 WARNING tras el PR #5. Intermedio 8 nov: 48 (11 accionables). **Final: 4** (2 de F-05 aceptados y 2 de `cooldown`) |
| CodeQL | 3 High en el PR; 7 en `main` | 0 abiertas, 7 cerradas |
| Dependabot | 5 abiertas (1 Critical, 1 High, 3 Moderate) | 0 abiertas, 5 cerradas |
| Escritura sin credenciales | `200 OK` sin clave y con clave errónea (`pentest_before.png`) | 401 sin clave o con clave errónea |
| Rate limiting | Ninguno | 60 solicitudes por minuto, 429 al exceder |
| Pruebas automáticas de seguridad | 0 | 5 (5/5 en verde en captura y de nuevo el 8 nov sobre `4f31229`, Express 5) |
| `npm audit` | 3 vulnerabilidades | 0 (con Express 4.22.3 y con Express 5.3.0) |
| OWASP ZAP | 0 H / 2 M / 6 L / 2 I (informe inicial) | 0 H / 0 M / 0 L / 2 I (informe posterior, 8 nov) |
| Checks del PR | CodeQL en rojo | 7/7 en verde (PR #6); checks en verde en el PR #7 |

## 5. Conclusiones
1. **El ciclo funcionó de punta a punta.** Cada hallazgo corregido tiene un commit, un PR y un reescaneo que lo confirma, salvo las excepciones señaladas (la captura de CI de Express 5 y las capturas de los runs de CI de la remediación del 8 nov, que ya tiene pruebas, ZAP y Semgrep archivados; además se subió sin PR).
2. **Lo más grave vino de fuera del código propio.** El único Critical fue una dependencia transitiva (`proxy-addr`), que el equipo no escogió ni revisó. Las alertas de Dependabot y el `package-lock.json` son un control de primera línea, no un accesorio.
3. **Las herramientas no sustituyen la revisión.** Ninguna señaló la falta de autenticación en los endpoints de escritura; se halló leyendo el código y probándolo. Los falsos negativos de este laboratorio son de lógica de acceso, no de sintaxis.
4. **Un corrector puede crear un riesgo nuevo.** El rate limiting que cerró F-01 puede aplicarse sobre la IP del proxy (F-07, sin validar), de modo que un solo cliente consuma el cupo de todos. Debe medirse antes de darlo por bueno.
5. **El verde del pipeline engaña.** `|| true` en Semgrep y `-I` en ZAP significan que los checks pasan aunque haya hallazgos. Hoy el CI documenta, pero no bloquea.
6. **Los controles de proceso fallan en silencio.** Un archivo de Dependabot mal nombrado (F-08) dejó desactivadas las actualizaciones de versión sin ningún aviso; al corregirlo, el bot abrió 5 PR en minutos (`dependabot_prs_abiertos.png`). Las acciones sin fijar por SHA reaparecieron en el job `pruebas` (F-04) después de haberlas corregido, y al fusionar los PR de Dependabot los pasos sin SHA pasaron de `@v4` a `@v7`, igualmente mutables: Dependabot actualiza la versión, pero no fija por SHA lo que ya estaba sin fijar.
7. **Una corrección parcial parece completa.** `X-Powered-By` se desactivó en la API pero no en el frontend (F-06), y ZAP lo ve justamente en el frontend. Cada corrección debe comprobarse en todos los servicios que comparten el patrón. Se cerró el 8 nov con `helmet` y una prueba que cubre cuatro rutas del frontend.
8. **La evidencia también se pisa.** El JSON `semgrep_after.json` se sobrescribió con un escaneo posterior y pasó de 4 a 48 hallazgos, de modo que la cifra "9 → 4" dejó de estar respaldada. Se restauró `semgrep_after.json` a la medición original y el escaneo posterior se conserva como `semgrep_intermedio_8nov.json` (recuperado de git); el escaneo final es `semgrep_final.json`. Cada medición debe guardarse con un nombre propio y no sustituirse.
9. **Un cambio grande sin PR queda sin revisar.** La migración a Express 5 entró a `main` dentro de un commit titulado como documentación, sin PR ni checks previos, y la remediación de F-04, F-06 y F-09 también se subió directo a `main`. Se verificaron después (`npm audit` 0, 11 pruebas, ZAP y Semgrep), pero un PR habría dejado esas verificaciones registradas y revisables antes del merge.
10. **El DAST solo ve lo que alcanza.** ZAP recorrió 5 URL del frontend y ninguna de `/api`; sus 10 alertas son de cabeceras. Una app con API necesita darle a ZAP las rutas de la API para que el DAST aporte algo más que cabeceras.

## 6. Riesgos residuales y decisiones

| ID | Riesgo | Decisión |
|---|---|---|
| F-05 | `$host` sin validar en Nginx | Aceptado para el laboratorio; corregir con `server_name` explícito |
| F-07 | Rate limit posiblemente compartido por IP del proxy | Abierto: validar y configurar `trust proxy` |
| F-08 | Dependabot sin actualizaciones de versión | **Corregido y verificado** (`555a33e`). Los 5 PR del bot (#9 a #13) se fusionaron el 8 nov. Pendiente menor: `cooldown` en `dependabot.yml` |
| F-09 | Frontend sin CSP, anti-clickjacking, `nosniff` | Corregido con `helmet` y verificado con el ZAP posterior (0 Medium, 0 Low). Ya en `main` (`f775052`, sin PR). Pendiente: captura del run de CI |
| F-06 (frontend) | `X-Powered-By` en el frontend | Corregido y verificado con el ZAP posterior (alerta 10037 resuelta). Ya en `main` (`f775052`, sin PR). Pendiente: captura del run de CI |
| F-04 (resto) | Acciones sin SHA en `pruebas` y `dast-local.yml` | Fijadas por SHA y verificado con Semgrep final (0 hallazgos de la regla). Ya en `main` (`f775052`, sin PR). Pendiente: captura del run de CI |
| Heredado de Lab 3 | HTTP sin TLS (H1, H4), CORS en el despliegue de la VM (H8) | Ver [`risk-register.md`](../risk-register.md) |
| API key única | Sin rotación ni identidad por usuario | Aceptado en el laboratorio; usar OAuth/JWT o claves por cliente en producción |
| ZAP | Informe posterior: 0 H / 0 M / 0 L / 2 I. Sin cobertura de `/api` en ambos informes. `dast-local.yml` volvió a `:3000` (había apuntado a la API desde `e075efb`) | Abierto: capturar el run y, para evaluar la API, una segunda ejecución sobre `:3001` |
| Express 5 | Migración en `main` sin PR ni captura de CI | Verificada localmente (`npm audit` 0, 5/5 pruebas). Pendiente: captura y, si se exige, PR retroactivo |
| Semgrep | 2 alertas `cooldown` nuevas; 37 falsos positivos en `evidence/ZAP/zap-report-before/zap-report.html` | `semgrep_final.json`: 4 hallazgos (2 F-05 aceptados y 2 `cooldown`); `.semgrepignore` hecho. Abierto: `cooldown` en Dependabot |
| PR de Dependabot #9 a #13 | Fusionados el 8 nov | Cerrado. Falta la captura de los PR fusionados |
| Remediación del 8 nov (F-04, F-06, F-09) | Ya en `main` (`f775052`, `a2b68b1`), sin PR | Abierto: capturas de los runs de Actions y, si se exige, un PR retroactivo |

## 7. Recomendaciones
1. Hacer bloqueantes Semgrep (por severidad), CodeQL y Gitleaks una vez hecho el triage; retirar `|| true`.
2. Añadir `cooldown` a `dependabot.yml`, agrupar sus PR de actualización y mantener el triage (los cinco primeros ya se fusionaron), y habilitar secret scanning con *push protection* si el plan lo permite.
3. Fijar todas las acciones por SHA y dejar que Dependabot las mantenga.
4. Validar el rate limiting detrás de Nginx (F-07) y añadir una prueba que verifique que dos clientes distintos no comparten cupo.
5. Añadir pruebas positivas (clave válida → 200) y de validación de entrada a `security.test.js`.
6. Archivar siempre los informes (ZAP, Semgrep) en `evidence/` con un nombre distinto por medición, porque los artefactos de Actions caducan, y alimentar a ZAP con las rutas de la API. Incluir un `.semgrepignore` para `evidence/`.
7. Hacer los cambios de dependencias mayores (como Express 5) mediante PR, con los checks en verde antes de fusionar.
8. Dejar registrada la remediación del 8 nov (`helmet`, SHA, pruebas del frontend), ya en `main`: capturar los runs de Actions y, si se exige un PR, abrir uno retroactivo.
9. Antes de salir del laboratorio: HTTPS (Lab 4), rotación de la clave de API y retirada de la modificación de datos desde endpoints públicos.

## 8. Referencias internas
- [`SECURITY.md`](SECURITY.md) — evidencia por herramienta y pentest
- [`REPORTE_HALLAZGOS.md`](REPORTE_HALLAZGOS.md) — detalle de F-01 a F-09
- [`PULL_REQUESTS.md`](PULL_REQUESTS.md) — PR de integración y de remediación
- [`CHECKLIST_PR.md`](CHECKLIST_PR.md) — checklist del PR
- [`../risk-register.md`](../risk-register.md) — registro de riesgos (H1–H18)
- [`../evidence/lab5/README.md`](../evidence/lab5/README.md) — índice de evidencias y pendientes
