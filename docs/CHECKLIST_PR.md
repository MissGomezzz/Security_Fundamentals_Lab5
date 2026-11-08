# Checklist de seguridad del Pull Request

Aplicado al PR de remediación #6 (y al complemento #7). La migración a Express 5 (`7e76984`) se hizo sin PR y por tanto sin esta checklist; ver `SECURITY.md` §2.7. Detalle en [`PULL_REQUESTS.md`](PULL_REQUESTS.md).

- [x] El cambio tiene una descripción funcional y un alcance definido. *Remediación de F-01, F-02, F-03 y F-06; ver descripción sugerida en `PULL_REQUESTS.md`.*
- [x] Revisé que no se subieran credenciales, tokens ni archivos .env. *`.env` en `.gitignore` y nunca versionado; `API_KEY` en `secrets`; Gitleaks en verde.*
- [x] El SAST fue ejecutado; interpreté hallazgos verdaderos y falsos positivos. *Semgrep 9 → 4 (tras el PR #5; el reescaneo del 8 nov deja 11 accionables) y CodeQL 7 → 0; F-05 es riesgo aceptado, y las 2 coincidencias en `evidence/retest/nginx_before.conf` son una copia de evidencia, no configuración activa.*
- [x] Revisé dependencias y actualizaciones relevantes. *Dependabot 5 → 0 y `npm audit` 0 vulnerabilidades (`541cc20`). Dependabot activo: abrió 5 PR de actualización (#9 a #13), fusionados el 8 nov (F-08 verificado).*
- [x] Revisé autenticación y autorización si el cambio afecta APIs. *`requireApiKey` en POST/PATCH/aggregates/audit; lecturas de alertas públicas por diseño.*
- [x] Se ejecutaron pruebas funcionales y de regresión. *`npm test`: 5/5 en verde en la API (incluye la del 429, `38cf99b`). Con las pruebas del frontend, 11/11 en local el 8 nov (sin commit).*
- [x] Si hay DAST, fue sobre mi staging autorizado. *ZAP baseline pasivo contra la app local del runner (`127.0.0.1:3000` en el informe archivado; `:3001` desde `e075efb`), nunca contra terceros ni la VM. Informe inicial archivado en `evidence/ZAP/`.*
- [x] Vinculé hallazgos, decisiones de mitigación y evidencias. *`SECURITY.md`, `REPORTE_HALLAZGOS.md` y `evidence/lab5/README.md`.*

## Pendientes antes de dar el laboratorio por cerrado
- [x] Triage de los 5 PR de Dependabot (#9 a #13): fusionados el 8 nov.
- [x] Corregir F-06 en el frontend, F-09 (cabeceras) y lo que quedaba de F-04 (acciones sin SHA): **hecho en el árbol de trabajo, sin commit** (`SECURITY.md` §2.8).
- [ ] Hacer commit y abrir el PR de esa remediación, con checks en verde y captura.
- [ ] Reejecutar ZAP sobre el frontend (`:3000`; hoy el workflow apunta a `:3001`) para el informe "después" y Semgrep para `semgrep_final.json`.
- [ ] Revisar F-07 (`trust proxy`).
- [x] `.semgrepignore` para `evidence/` (hecho, sin commit).
- [ ] Añadir `cooldown` en `dependabot.yml` (2 hallazgos del reescaneo del 8 nov).
- [ ] Captura de `npm audit`/`npm test`/CI sobre `main` con Express 5 (cambio hecho sin PR, `7e76984`).
- [ ] (Opcional) Capturas de los PR #4, #5 y #6 fusionados.
