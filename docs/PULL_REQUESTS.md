# Pull Requests del laboratorio 5

Todos los PR parten de la rama `security/lab5-fdsi` hacia `main` y se fusionaron con merge commit.
Base URL: <https://github.com/MissGomezzz/Security_Fundamentals_Lab5/pull/N>

| PR | Tipo | Fusionado | Merge commit | Contenido |
|---|---|---|---|---|
| [#4](https://github.com/MissGomezzz/Security_Fundamentals_Lab5/pull/4) | **Integración** | 28 oct 2026 17:53 | `7574354` | Workflow Semgrep + Gitleaks y plantillas de documentación de seguridad |
| [#5](https://github.com/MissGomezzz/Security_Fundamentals_Lab5/pull/5) | Integración (ajuste) | 2 nov 2026 18:48 | `dbe664f` | Acciones fijadas por SHA |
| [#6](https://github.com/MissGomezzz/Security_Fundamentals_Lab5/pull/6) | **Remediación** | 8 nov 2026 11:38 | `b6b655b` | Dependabot, CodeQL, API key, rate limit de la API, dependencias |
| [#7](https://github.com/MissGomezzz/Security_Fundamentals_Lab5/pull/7) | Remediación (complemento) | 8 nov 2026 11:54 | `9968a09` | "fix the last one vulnerability detected by CodeQL": rate limit del frontend |

> Las descripciones y conversaciones de los PR no se pueden leer desde el repositorio local. Lo que sigue se reconstruyó del historial de git (commits, fechas, merges) y de las capturas. Los títulos del #6 ("Security/lab5 fdsi") y del #7 ("fix the last one vulnerability detected by CodeQL") salen de capturas; los de #4 y #5 no se han visto.

## PR de integración — #4 (y ajuste #5)

**Objetivo:** incorporar al repositorio los controles de seguridad automatizados de la plantilla del laboratorio (`docs/README_INTEGRACION.md`) y la documentación base.

**Commits**
- `9fe3d60` — `chore(security): add Semgrep + Gitleaks workflow and security docs` (28 oct).
- `d043d24` — `fixing workflow with SHA!` (28 oct): fija las acciones por SHA tras el primer escaneo de Semgrep (PR #5).

**Cambios principales:** `.github/workflows/seguridad-estatica.yml` (jobs `sast` y `secretos`), `docs/CHECKLIST_PR.md`, `docs/README_INTEGRACION.md`, `docs/REPORTE_HALLAZGOS.md`, `docs/SECURITY.md`.

**Resultado:** Semgrep y Gitleaks quedan ejecutándose en cada push a `main` y en cada PR. Primer escaneo: 9 hallazgos WARNING; tras el ajuste de SHA (PR #5): 4. Los JSON de ese escaneo se versionaron después, en el PR #6.

**Evidencia:** el equipo decidió **no incluir capturas de las páginas de los PR #4 y #5**. Su contenido queda respaldado por el historial de git (commits `9fe3d60` y `d043d24`, merges `7574354` y `dbe664f`) y por los resultados de Semgrep en `evidence/SAST/` (`semgrep_before.json` y `semgrep_after_pr5.json`).

> ⚠️ **PENDIENTE (solo si el evaluador exige imagen del PR de integración): capturas de los PR #4 y #5** (título, estado *Merged*, pestañas *Commits*, *Checks* y *Files changed*). Es la única parte de este entregable sin imagen. Rutas: `evidence/lab5/pr4_integracion_merged.png` y `evidence/lab5/pr5_ajuste_sha_merged.png`.
>
> <!-- ![PR #4 fusionado](../evidence/lab5/pr4_integracion_merged.png) -->
> <!-- ![PR #5 fusionado](../evidence/lab5/pr5_ajuste_sha_merged.png) -->

## PR de remediación — #6 (y complemento #7)

**Objetivo:** corregir los hallazgos F-01, F-02, F-03 y F-06 detectados por CodeQL, Dependabot, la revisión manual y las pruebas, y añadir las pruebas de regresión y los controles automáticos que los vigilan.

**Commits del PR #6**

| Commit | Cambio | Hallazgo |
|---|---|---|
| `09d876b` | Evidencia SAST: `semgrep_before.json`, `semgrep_after.json`, `resumen.py` | Semgrep (F-04, F-05) |
| `90168bd` | Añade configuración de Dependabot (archivo `dependatbot.yml`) | F-08 (errata) |
| `567f192` | Refactor de estructura para legibilidad | — |
| `70dd82a` | API key en rutas de escritura y auditoría, `x-powered-by` desactivado, 4 pruebas de seguridad, job `pruebas` y `API_KEY` en el DAST | F-03, F-06 |
| `40b58fa` | Refactor de nombre de archivo y middleware (commit sobre el que CodeQL reportó 3 alertas) | F-01 detectado |
| `e540898`, `7b038a3` | Evidencia de CodeQL | — |
| `541cc20` | Actualiza `package-lock.json` | F-02 |
| `38cf99b` | Rate limiting de la API, prueba del 429 y actualización de `risk-register.md` | F-01 |

**PR #7 — "fix the last one vulnerability detected by CodeQL":** fusionado por `mbquial`, 2 commits, 4 archivos modificados (+10 líneas). Commits: `7fe9051` (rate limiting en `web-frontend/server.js`, cierra la alerta CodeQL #1 de `server.js:29`) y el merge `208f268` de la rama. La pestaña *Checks* muestra 8 comprobaciones en verde: CodeQL (`actions`, `javascript-typescript`, `python`), Semgrep, Gitleaks, pruebas de regresión, ZAP (`zap-local`) y *Code scanning results*.

![PR #7 fusionado](../evidence/lab5/pr7_ya_fucionado.png)

**Verificación antes de fusionar (PR #6):** 7/7 checks en verde.

![7 checks en verde](../evidence/lab5/all_workflows_pass_before_merge.png)

**Resultado tras la fusión**
- CodeQL en `main`: 0 abiertas, 7 cerradas como fixed ([captura](../evidence/lab5/hallazgos_fixed_CodeQL.png)).
- Dependabot: 0 abiertas, 5 cerradas como Fixed ([captura](../evidence/lab5/alertas_fixed_dependatbot.png)).
- Pruebas de regresión: 5/5 en verde el 8 nov ([captura](../evidence/lab5/security_test_5_pruebas.png)); `npm audit`: 0 vulnerabilidades ([captura](../evidence/lab5/npm_audit_after.png)).

**Descripción sugerida para el PR #6** (por si hay que completarla en GitHub):

> Remediación de hallazgos de seguridad del Lab 5. Añade autenticación por API key a los endpoints de escritura y auditoría (F-03), desactiva `X-Powered-By` (F-06), aplica rate limiting con `express-rate-limit` (F-01, alertas CodeQL de missing rate limiting), actualiza `proxy-addr`, `body-parser`, `qs` y `express` en el lockfile (F-02, 5 alertas de Dependabot) y agrega pruebas de regresión. Evidencia en `docs/SECURITY.md`. Riesgos residuales: F-05, F-07, F-08.

**Checklist de seguridad del PR:** [`CHECKLIST_PR.md`](CHECKLIST_PR.md).

> ⚠️ **PENDIENTE (opcional) — captura del PR #6 ya fusionado.** El PR #6 se capturó solo **antes** del merge (abierto, 7/7 checks). Agregar su estado "Merged" con commits y archivos cambiados como `evidence/lab5/pr6_remediacion_merged.png`. El PR #7 ya tiene captura post-merge.
>
> <!-- ![PR #6 fusionado](../evidence/lab5/pr6_remediacion_merged.png) -->

## Cambio posterior sin Pull Request: migración a Express 5

Después del PR #7 se hicieron en `main`, **sin PR**, estos cambios (todos del 8 nov 2026):

| Commit | Hora | Cambio |
|---|---|---|
| `555a33e` | 13:49 | Renombra `dependatbot.yml` a `dependabot.yml` (F-08) |
| `7e76984` | 14:10 | Express `^4.21.2` → `^5.3.0` en `alerts-api` y `web-frontend`; `package-lock.json` regenerado; comodín `app.get('/{*splat}')` en el frontend; `semgrep_after.json` sobrescrito con un reescaneo; documentación y capturas |
| `4f31229` | 14:19 | Ajustes de documentación; se retira la referencia a `evidence/express5/` y las capturas `dependabot_pr14_zap_fallido.png` y `dependabot_prs.png` |

El cambio de Express no pasó por revisión de PR. Se verificó localmente (`npm audit` 0 vulnerabilidades, `npm test` 5/5, ver `SECURITY.md` §2.7) pero no hay captura de CI para `4f31229`. Si se necesita un PR formal de esta remediación, se puede abrir uno retroactivo con la comparación `9968a09...4f31229`.

> ⚠️ **PENDIENTE: PR (retroactivo) o captura de CI de la migración a Express 5.** Ruta: `evidence/lab5/express5_ci_run.png`. Ver `SECURITY.md` §2.7.

## Pull Requests automáticos de Dependabot (#9 a #13)

Tras renombrar `dependatbot.yml` a `dependabot.yml` (F-08, commit `555a33e`), Dependabot empezó a abrir PR de actualización de versión. Son PR de **mantenimiento**, no de remediación de los hallazgos del laboratorio, y a la fecha de la captura estaban **abiertos y sin fusionar**. Son además la evidencia de que F-08 quedó resuelto. **Se fusionaron el 8 nov 2026 entre las 17:46 y las 17:51** (ver más abajo).

| PR | Título | Etiquetas | Checks |
|---|---|---|---|
| [#9](https://github.com/MissGomezzz/Security_Fundamentals_Lab5/pull/9) | `chore(deps): bump actions/checkout from 4 to 7` | dependencies, github_actions | 5/5 |
| [#10](https://github.com/MissGomezzz/Security_Fundamentals_Lab5/pull/10) | `chore(deps): bump actions/upload-artifact from 4 to 7` | dependencies, github_actions | 5/5 |
| [#11](https://github.com/MissGomezzz/Security_Fundamentals_Lab5/pull/11) | `chore(deps): bump actions/setup-python from 5.6.0 to 7.1.0` | dependencies, github_actions | 5/5 |
| [#12](https://github.com/MissGomezzz/Security_Fundamentals_Lab5/pull/12) | `chore(deps): bump actions/setup-node from 4 to 7` | dependencies, github_actions | 5/5 |
| [#13](https://github.com/MissGomezzz/Security_Fundamentals_Lab5/pull/13) | `chore(deps): bump dotenv from 16.6.1 to 18.0.9` | dependencies, javascript | 5/5 |

![PR abiertos por Dependabot](../evidence/lab5/dependabot_prs_abiertos.png)

**Triage y merge (8 nov 2026).** Se revisaron y fusionaron los cinco con merge commit, con los 5 checks en verde de cada uno:

| PR | Merge | Commit del merge |
|---|---|---|
| #9 `actions/checkout` 4 → 7 | 17:46 | `cad2d70` |
| #10 `actions/upload-artifact` 4 → 7 | 17:47 | `fb69c0f` |
| #13 `dotenv` 16.6.1 → 18.0.9 | 17:48 | `b2ebfd0` |
| #12 `actions/setup-node` 4 → 7 | 17:50 | `64b6148` |
| #11 `actions/setup-python` 5.6.0 → 7.1.0 | 17:51 | `95af340` |

Después del merge, `npm audit` marca 0 vulnerabilidades y las pruebas pasan. Dependabot respetó los SHA ya fijados, pero los pasos que estaban sin SHA quedaron en `@v7` (mutable); la remediación de abajo los fija.

> ⚠️ **PENDIENTE: captura de los 5 PR fusionados** (`is:pr is:merged author:app/dependabot`). Ruta: `evidence/lab5/dependabot_prs_fusionados.png`.
>
> <!-- ![PR de Dependabot fusionados](../evidence/lab5/dependabot_prs_fusionados.png) -->

## PR de remediación pendiente de abrir: F-04, F-06 y F-09

Los cambios de `SECURITY.md` §2.8 están en el árbol de trabajo, sobre `main` @ `747bf61`, sin commit. Para convertirlos en el tercer PR de remediación y que queden revisados y con CI:

1. Crear la rama (por ejemplo `security/lab5-headers-sha`), hacer commit y abrir el PR hacia `main`.
2. Esperar los checks (Semgrep, Gitleaks, pruebas de regresión con 11 pruebas, CodeQL y ZAP) y capturarlos.
3. Descargar el informe ZAP y el JSON de Semgrep del run y guardarlos con nombre propio (`evidence/ZAP/after/`, `evidence/SAST/semgrep_final.json`).

**Archivos del cambio:** `.github/workflows/seguridad-estatica.yml`, `.github/workflows/dast-local.yml`, `.semgrepignore`, `app/web-frontend/server.js`, `app/web-frontend/package.json`, `app/web-frontend/test/security-headers.test.js` y `package-lock.json` (nueva dependencia `helmet` 8.3.0).

**Descripción sugerida:**

> Cierra la parte abierta de F-04, F-06 y F-09. Fija por SHA las acciones restantes de los dos workflows (Dependabot las había dejado en `@v7`), añade `helmet` al frontend con una CSP sin `unsafe-inline`, anti-clickjacking, COEP/COOP/CORP y Permissions-Policy, desactiva `X-Powered-By` en el frontend (hallazgos de ZAP del 6 nov), añade 6 pruebas de regresión para esas cabeceras y hace que el job `pruebas` ejecute las de todos los workspaces. Añade `.semgrepignore` para excluir `evidence/` (37 falsos positivos). HSTS queda fuera hasta tener HTTPS (Lab 4). Evidencia en `docs/SECURITY.md` §2.8. Verificado en local: 11/11 pruebas, `npm audit` 0.

> ⚠️ **PENDIENTE: capturas de este PR** (página con checks y estado *Merged*). Rutas: `evidence/lab5/pr_headers_sha_checks.png` y `evidence/lab5/pr_headers_sha_merged.png`.
>
> <!-- ![Checks del PR de cabeceras y SHA](../evidence/lab5/pr_headers_sha_checks.png) -->
> <!-- ![PR de cabeceras y SHA fusionado](../evidence/lab5/pr_headers_sha_merged.png) -->

**Antes de abrirlo:** `dast-local.yml` apunta a `http://127.0.0.1:3001` (API) desde `e075efb`. Si se quiere que el ZAP de este PR demuestre las cabeceras del frontend, cambiar el objetivo a `:3000` (o añadir una segunda ejecución).

## Pendientes derivados que deberían ir en un PR nuevo
1. ~~Triage de los 5 PR de Dependabot (#9 a #13)~~: hecho el 8 nov, ver la sección anterior.
2. ~~Fijar por SHA las acciones restantes (F-04)~~, ~~cabeceras del frontend (F-09)~~ y ~~`X-Powered-By` del frontend (F-06)~~: **hechos en el árbol de trabajo, falta el commit y el PR** (ver la sección siguiente).
3. Configurar `trust proxy` y validar el rate limiting detrás de Nginx (F-07).
4. Volver a ejecutar ZAP sobre el frontend (`:3000`) para tener el informe "después", y Semgrep para el JSON final.
5. Añadir `cooldown` a `dependabot.yml`.
