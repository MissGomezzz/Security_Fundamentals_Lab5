# Pull Requests del laboratorio 5

Todos los PR parten de la rama `security/lab5-fdsi` hacia `main` y se fusionaron con merge commit.
Base URL: <https://github.com/MissGomezzz/Security_Fundamentals_Lab5/pulls?q=is%3Apr+state%3Aclosed>

| PR | Tipo | Fusionado | Merge commit | Contenido |
|---|---|---|---|---|
| [#4](https://github.com/MissGomezzz/Security_Fundamentals_Lab5/pull/4) | **Integración** | 28 oct 2026 17:53 | `7574354` | Workflow Semgrep + Gitleaks y plantillas de documentación de seguridad |
| [#5](https://github.com/MissGomezzz/Security_Fundamentals_Lab5/pull/5) | Integración (ajuste) | 2 nov 2026 18:48 | `dbe664f` | Acciones fijadas por SHA |
| [#6](https://github.com/MissGomezzz/Security_Fundamentals_Lab5/pull/6) | **Remediación** | 8 nov 2026 11:38 | `b6b655b` | Dependabot, CodeQL, API key, rate limit de la API, dependencias |
| [#7](https://github.com/MissGomezzz/Security_Fundamentals_Lab5/pull/7) | Remediación (complemento) | 8 nov 2026 11:54 | `9968a09` | "fix the last one vulnerability detected by CodeQL": rate limit del frontend |


## PR de remediación — #6 (y complemento #7)

**Objetivo:** corregir los hallazgos F-01, F-02, F-03 y F-06 detectados por CodeQL, Dependabot, la revisión manual y las pruebas, y añadir las pruebas de regresión y los controles automáticos que los vigilan.

**Commits del PR #6**

| Commit | Cambio | Hallazgo |
|---|---|---|
| `09d876b` | Evidencia SAST: `semgrep_before.json`, `semgrep_after.json`, `resumen.py` | Semgrep (F-04, F-05) |
| `90168bd` | Añade configuración de Dependabot (archivo `dependatbot.yml`) | F-08 |
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


## Remediación de F-04, F-06 y F-09: subida directa a `main` (sin PR)

Los cambios de `SECURITY.md` 2.8 se subieron el 8 nov 2026 directamente a `main`, sin Pull Request:

| Commit | Hora | Cambio |
|---|---|---|
| `f775052` | 18:15 | Acciones fijadas por SHA, `helmet` y cabeceras en el frontend, 6 pruebas nuevas, `.semgrepignore`, job `pruebas` con todos los workspaces, documentación |
| `a2b68b1` | 18:16 | `dast-local.yml`: objetivo y espera de arranque de vuelta a `:3000` (frontend) |

**Archivos del cambio:** `.github/workflows/seguridad-estatica.yml`, `.github/workflows/dast-local.yml`, `.semgrepignore`, `app/web-frontend/server.js`, `app/web-frontend/package.json`, `app/web-frontend/test/security-headers.test.js` y `package-lock.json` (nueva dependencia `helmet` 8.3.0). La evidencia (`semgrep_final.json`, `semgrep_intermedio_8nov.json`, `zap-report-before/`, `zap-report-after/`) se agregó después.

**Resultados:** ZAP posterior 0 Medium y 0 Low (antes 2 y 6); Semgrep final 4 hallazgos (2 F-05 aceptados y 2 `cooldown`; antes 9, con 5 de acciones mutables); 11 pruebas en verde; `npm audit` 0. Detalle en `SECURITY.md` 2.4, 2.1 y 2.8.