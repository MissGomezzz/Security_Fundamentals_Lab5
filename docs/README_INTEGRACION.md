# Integración al repositorio

Estado de cada paso de la plantilla del laboratorio y lo que se hizo en este proyecto.

| # | Paso de la plantilla | Estado | Qué se hizo |
|---|---|---|---|
| 1 | Copiar workflow y `docs/` | Hecho | `.github/workflows/seguridad-estatica.yml` y `docs/` (PR #4) |
| 2 | Habilitar CodeQL (Default setup), Dependabot alerts y secret scanning | Parcial | CodeQL (`javascript-typescript` y `actions`) y Dependabot alerts activos, con resultados. Secret scanning nativo: **no documentado** (se usa Gitleaks) |
| 3 | Rama de seguridad, PR y revisión de Actions; descargar `resultado-semgrep` | Hecho | Rama `security/lab5-fdsi`; PR #4 a #7. JSON de Semgrep versionados en `evidence/SAST/` |
| 4 | Revisar la pestaña Security | Hecho | Capturas en `evidence/lab5/` |
| 5 | DAST contra staging HTTPS autorizado | **Adaptado** | No hay staging: `dast-local.yml` levanta la app **dentro del runner** y ejecuta ZAP baseline contra `127.0.0.1:3000`. No se necesita `STAGING_URL` |
| 6 | Descargar `informe-zap` y registrarlo | Hecho | Informe inicial en `evidence/ZAP/` y tabla de alertas con triage en [`SECURITY.md`](SECURITY.md) §2.4 |
| 7 | Al menos un PR de remediación y reescaneo | Hecho | PR #6 y #7. Antes/después en [`SECURITY.md`](SECURITY.md) §4 |
| 8 | Enlace al informe en el `README.md` | Hecho | Sección *Laboratorio 5* del README |

## Cómo se reproduce
1. Hacer fork o clon y dejar que GitHub active CodeQL (*Settings → Advanced Security → Code scanning → Default setup*) y Dependabot alerts.
2. Definir el secreto de repositorio `API_KEY` (*Settings → Secrets and variables → Actions*). El workflow DAST y las pruebas lo usan; **no** va en el repositorio.
3. Abrir un PR desde `security/lab5-fdsi`; deben ejecutarse Semgrep, Gitleaks, pruebas de regresión, CodeQL y ZAP.
4. Descargar `resultado-semgrep` e `informe-zap` desde *Actions → run → Artifacts* y guardarlos en `evidence/`.
5. Localmente: `npm ci`, copiar `.env.example` a `.env` con valores propios, `npm test -w alerts-api`.

## Cosas a tener presentes
- `|| true` en Semgrep y `-I` en ZAP evitan que el laboratorio se bloquee: el estado verde **no** significa aplicación segura. Pasar a control estricto cuando haya triage.
- Si se usa Gitleaks en una organización, puede requerirse `GITLEAKS_LICENSE`.
- No subir informes con datos sensibles a repositorios públicos.
- El archivo de Dependabot debe llamarse `.github/dependabot.yml`. En este repositorio se llamaba `dependatbot.yml` (F-08); se renombró (`555a33e`) y Dependabot ya abrió 6 PR de actualización (#9 a #14), ver `evidence/lab5/dependabot_prs.png`.
- No se añade un segundo workflow de CodeQL mientras se use Default setup.
