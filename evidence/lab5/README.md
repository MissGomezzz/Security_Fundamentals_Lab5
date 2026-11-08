# Evidencias del Laboratorio 5

Índice de las evidencias de seguridad y de lo que falta por agregar. El análisis está en [`docs/SECURITY.md`](../../docs/SECURITY.md).

## Capturas existentes

| Archivo | Qué muestra | Entregable | Usado en |
|---|---|---|---|
| `alertas_iniciales_dependatbot.png` | 5 alertas abiertas de Dependabot (1 Critical, 1 High, 3 Moderate) | Dependabot, antes | `SECURITY.md` §2.6 |
| `alertas_fixed_dependatbot.png` | 0 abiertas, 5 cerradas "Fixed" | Dependabot, después | `SECURITY.md` §2.6 |
| `npm_audit_y_outdated.png` | `npm audit`: 3 vulnerabilidades (1 moderate, 1 high, 1 critical). `npm outdated` sin salida | SCA, antes | `SECURITY.md` §2.6 |
| `dependabot_prs_abiertos.png` | 5 PR abiertos por Dependabot (#9 a #13): 4 de GitHub Actions y 1 de npm (`dotenv`), todos con 5/5 checks | Dependabot (F-08 verificado) | `SECURITY.md` §2.6, `PULL_REQUESTS.md` |
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
- [`../SAST/`](../SAST/): `semgrep_before.json` (9), `semgrep_after_pr5.json` (4, tras el PR #5), `semgrep_after.json` (48 en bruto, reescaneo del 8 nov, 11 accionables) y `resumen.py` (acepta el archivo como argumento).
- [`../ZAP/`](../ZAP/): `zap-report.html`, `zap-report.json` y `zap.yaml` (artefacto `informe-zap`, ejecución del 6 nov 2026 17:32 UTC).

## Entregables y su evidencia

| # | Entregable | Evidencia | Estado |
|---|---|---|---|
| 1 | Semgrep | `../SAST/*.json`, `resumen.py` | Completo. Falta captura del job (opcional) |
| 2 | CodeQL | `hallazgos_CodeQL.png`, `hallazgos_fixed_CodeQL.png` | Completo |
| 3 | Gitleaks / Secret Scanning | `gitleaks_log.png` | Completo (Gitleaks) |
| 4 | Dependabot | `alertas_*`, `npm_audit_*`, `dependabot_prs_abiertos.png` | Completo |
| 5 | Reporte OWASP ZAP | `../ZAP/zap-report.*`, `zap.yaml` | Informe inicial completo; falta el "después" |
| 6 | Pentest controlado | `bodyJson_pentest.png`, `resultados_pentests_controlados.png` | Completo; falta el "antes" |
| 7 | Reporte de vulnerabilidades | `docs/REPORTE_HALLAZGOS.md` | Completo |
| 8 | Antes/después | `docs/SECURITY.md` §4 | Completo salvo ZAP y pentest |
| 9 | PR de integración | `docs/PULL_REQUESTS.md` (#4, #5) | Sin capturas por decisión del equipo |
| 10 | PR de remediación | `all_workflows_pass_before_merge.png`, `pr7_ya_fucionado.png` | Completo; falta captura del #6 fusionado (opcional) |
| 11 | Informe final | `docs/INFORME_FINAL.md` | Completo |

## Lo que falta

| Prioridad | Qué | Nota |
|---|---|---|
| **Decidido por el equipo** | Capturas de los PR #4 y #5 (`pr4_integracion_merged.png`, `pr5_ajuste_sha_merged.png`) | No se agregarán. Documentado en `PULL_REQUESTS.md` con commits y merges. Los campos están listos (comentados) por si el evaluador las exige |
| Media | Capturas de `npm audit`, `npm test` y del run de CI sobre `main` @ `4f31229` con Express 5 (`express5_audit_tests.png`, `express5_ci_run.png`) | La migración se hizo sin PR; hoy solo hay verificación local (8 nov, 0 vulnerabilidades, 5/5). La captura `npm_audit_after.png` es de Express 4 |
| Baja | Captura del PR #6 ya fusionado (`pr6_remediacion_merged.png`) | Solo existe la captura previa al merge. El PR #7 sí tiene captura post-merge |
| Baja | Pentest "antes": la misma solicitud P-02 sobre el commit `09d876b` (`pentest_before.png`) | Hoy se deduce del diff de `70dd82a` |
| Baja | Captura del job Semgrep y del artefacto `resultado-semgrep` (`semgrep_job_actions.png`) | Los JSON ya están en `evidence/SAST/` |
| Baja | Resumen del informe ZAP (`zap_resumen.png`) | El informe completo ya está archivado |
| Después de corregir F-06 / F-09 | Informe ZAP posterior (`evidence/ZAP/after/`) | Hoy solo existe el informe inicial |

Los archivos `.sarif` que el equipo tiene en otra carpeta **no son necesarios** para ningún entregable: Semgrep y CodeQL ya están respaldados por los JSON y las capturas. Se pueden agregar en `evidence/SAST/` como complemento si se desea, sin referenciarlos.

## Dudas por resolver al revisar las capturas
- En las capturas posteriores a la corrección, la insignia de *Security and quality* muestra **1** (antes 12 = 7 alertas de CodeQL + 5 de Dependabot). Ver qué es ese elemento restante en la pestaña Security (Overview) y documentarlo; no es ni Dependabot ni code scanning, que están en 0.
- Hacer triage de los 5 PR abiertos por Dependabot (#9 a #13); parten del estado anterior a Express 5 y pueden requerir rebase.
- Las capturas `dependabot_pr14_zap_fallido.png` y `dependabot_prs.png` se eliminaron en `4f31229`; por el nombre de la primera, parecía mostrar un check de ZAP fallido en un PR de Dependabot (#14), que ya no está documentado. No se revisó su contenido; si ese fallo fue real, conviene registrarlo.

## Reglas para agregar evidencia
- Tachar o recortar cualquier token, clave de API o dato personal antes de guardar la captura (la clave del pentest ya está tachada).
- Incluir fecha y hora visibles cuando sea posible.
- No subir informes que contengan datos sensibles a un repositorio público.
