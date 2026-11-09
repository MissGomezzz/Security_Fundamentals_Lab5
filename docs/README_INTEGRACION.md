# Integración al repositorio

Estado de cada paso de la plantilla del laboratorio y lo que se hizo en este proyecto.

| # | Paso de la plantilla | Estado | Qué se hizo |
|---|---|---|---|
| 1 | Copiar workflow y `docs/` | Hecho | `.github/workflows/seguridad-estatica.yml` y `docs/` (PR #4) |
| 2 | Habilitar CodeQL (Default setup), Dependabot alerts y secret scanning | Hecho | CodeQL (`javascript-typescript` y `actions`) y Dependabot alerts activos, con resultados. Secret scanning nativo (se usa Gitleaks) |
| 3 | Rama de seguridad, PR y revisión de Actions; descargar `resultado-semgrep` | Hecho | Rama `security/lab5-fdsi`; PR #4 a #7. JSON de Semgrep versionados en `evidence/SAST/` (antes, tras el PR #5 y reescaneo del 8 nov) |
| 4 | Revisar la pestaña Security | Hecho | Capturas en `evidence/lab5/` |
| 5 | DAST contra staging HTTPS autorizado | Adaptado | No hay staging: `dast-local.yml` levanta la app **dentro del runner** y ejecuta ZAP baseline contra la app local (`127.0.0.1:3000`, el frontend). No se necesita `STAGING_URL` |
| 6 | Descargar `informe-zap` y registrarlo | Hecho | Informe inicial en `evidence/ZAP/` y tabla de alertas con triage en [`SECURITY.md`](SECURITY.md) 2.4 |
| 7 | Al menos un PR de remediación y reescaneo | Hecho | PR #6 y #7. Antes/después en [`SECURITY.md`](SECURITY.md) 4 |
| 8 | Enlace al informe en el `README.md` | Hecho | Sección *Laboratorio 5* del README |

