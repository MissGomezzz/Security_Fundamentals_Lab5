# Evidencias del Laboratorio 5

Índice de las evidencias de seguridad y de lo que falta por agregar. El análisis está en [`docs/SECURITY.md`](../../docs/SECURITY.md).

## Capturas existentes

| Archivo | Qué muestra | Entregable | Usado en |
|---|---|---|---|
| `alertas_iniciales_dependatbot.png` | 5 alertas abiertas de Dependabot (1 Critical, 1 High, 3 Moderate) | Dependabot, antes | `SECURITY.md` §2.6 |
| `alertas_fixed_dependatbot.png` | 0 abiertas, 5 cerradas "Fixed" | Dependabot, después | `SECURITY.md` §2.6 |
| `npm_audit_y_outdated.png` | `npm audit`: 3 vulnerabilidades (1 moderate, 1 high, 1 critical). `npm outdated` sin salida | SCA, antes | `SECURITY.md` §2.6 |
| `dependabot_prs.png` | 6 PR abiertos por Dependabot (#9 a #14): 4 de GitHub Actions y 2 de npm (`dotenv`, `express` 4 → 5, este con 4/5 checks) | Dependabot (F-08 verificado) | `SECURITY.md` §2.6, `PULL_REQUESTS.md` |
| `dependabot_pr14_zap_fallido.png` | Check fallido del PR #14: `zap-local`, paso *Esperar a la app*, `curl` no conecta a `127.0.0.1:3000` | Dependabot / DAST | `SECURITY.md` §2.6, `PULL_REQUESTS.md` |
| `npm_audit_after.png` | `npm install` y `npm audit`: 0 vulnerabilidades; `npm test`: 5/5 | SCA, después | `SECURITY.md` §2.6 |
| `hallazgos_CodeQL.png` | 3 alertas High (missing rate limiting) en el PR #6, commit `40b58fa` | CodeQL, antes | `SECURITY.md` §2.2 |
| `hallazgos_fixed_CodeQL.png` | `main`: 0 abiertas, 7 cerradas "fixed" | CodeQL, después | `SECURITY.md` §2.2 |
| `gitleaks_log.png` | Run #18 (`0bb491d`): Gitleaks "No leaks detected" | Gitleaks | `SECURITY.md` §2.3 |
| `all_workflows_pass_before_merge.png` | PR #6 abierto con 7/7 checks | PR de remediación | `SECURITY.md` §2.5, `PULL_REQUESTS.md` |
| `pr7_ya_fucionado.png` | PR #7 "fix the last one vulnerability detected by CodeQL", Merged, 8 checks | PR de remediación | `PULL_REQUESTS.md` |
| `bodyJson_pentest.png` | `body.json` con `{"status":"closed"}` | Pentest | `REPORTE_HALLAZGOS.md` |
| `resultados_pentests_controlados.png` | `/health` 200; PATCH sin clave 401; clave incorrecta 401; clave válida 200 (clave tachada) | Pentest | `SECURITY.md` §5 |
| `security_test.png` | `npm test -w alerts-api`: 4/4 pruebas pasan (7 nov) | Antes/después | `SECURITY.md` §2 |
| `security_test_5_pruebas.png` | `npm test`: 5/5, con la prueba de rate limiting (401 y luego 429) | Antes/después | `SECURITY.md` §2 |
| `rama_sha_security_md_alcance.png` | Rama `security/lab5-fdsi`, commit `09d876b…` y plantilla sin completar | Alcance | `SECURITY.md` §1 |

Otras evidencias de Lab 5 en el repositorio:
- [`../SAST/`](../SAST/): `semgrep_before.json`, `semgrep_after.json`, `resumen.py`.
- [`../ZAP/`](../ZAP/): `zap-report.html`, `zap-report.json` y `zap.yaml` (artefacto `informe-zap`, ejecución del 6 nov 2026 17:32 UTC).

## Lo que falta

| Prioridad | Qué | Nota |
|---|---|---|
| **Decidido por el equipo** | Capturas de los PR #4 y #5 | No se agregarán. Documentado en `PULL_REQUESTS.md` con commits y merges |
| Baja | Captura del PR #6 ya fusionado (`pr6_remediacion_merged.png`) | Solo existe la captura previa al merge. El PR #7 sí tiene captura post-merge |
| Baja | Pentest "antes": la misma solicitud P-02 sobre el commit `09d876b` (`pentest_before.png`) | Hoy se deduce del diff de `70dd82a` |
| Baja | Captura del job Semgrep y del artefacto `resultado-semgrep` (`semgrep_job_actions.png`) | Los JSON ya están en `evidence/SAST/` |
| Baja | Resumen del informe ZAP (`zap_resumen.png`) | El informe completo ya está archivado |
| Después de corregir F-06 / F-09 | Informe ZAP posterior (`evidence/ZAP/after/`) | Hoy solo existe el informe inicial |

Los archivos `.sarif` que el equipo tiene en otra carpeta **no son necesarios** para ningún entregable: Semgrep y CodeQL ya están respaldados por los JSON y las capturas. Se pueden agregar en `evidence/SAST/` como complemento si se desea, sin referenciarlos.

## Dudas por resolver al revisar las capturas
- En las capturas posteriores a la corrección, la insignia de *Security and quality* muestra **1** (antes 12 = 7 alertas de CodeQL + 5 de Dependabot). Ver qué es ese elemento restante en la pestaña Security (Overview) y documentarlo; no es ni Dependabot ni code scanning, que están en 0.
- Hacer commit y PR de la migración a Express 5 (el PR #14 falló porque Express 5 no admite `app.get('*')`; ya corregido y validado en local, evidencia en [`../express5/`](../express5/README.md)) y hacer triage de los otros 5 PR de Dependabot.

## Reglas para agregar evidencia
- Tachar o recortar cualquier token, clave de API o dato personal antes de guardar la captura (la clave del pentest ya está tachada).
- Incluir fecha y hora visibles cuando sea posible.
- No subir informes que contengan datos sensibles a un repositorio público.
