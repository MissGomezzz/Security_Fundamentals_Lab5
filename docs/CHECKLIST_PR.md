# Checklist de seguridad del Pull Request

Aplicado al PR de remediación #6 (y al complemento #7). Detalle en [`PULL_REQUESTS.md`](PULL_REQUESTS.md).

- [x] El cambio tiene una descripción funcional y un alcance definido. *Remediación de F-01, F-02, F-03 y F-06; ver descripción sugerida en `PULL_REQUESTS.md`.*
- [x] Revisé que no se subieran credenciales, tokens ni archivos .env. *`.env` en `.gitignore` y nunca versionado; `API_KEY` en `secrets`; Gitleaks en verde.*
- [x] El SAST fue ejecutado; interpreté hallazgos verdaderos y falsos positivos. *Semgrep 9 → 4 y CodeQL 7 → 0; F-05 es riesgo aceptado, y las 2 coincidencias en `evidence/retest/nginx_before.conf` son una copia de evidencia, no configuración activa.*
- [x] Revisé dependencias y actualizaciones relevantes. *Dependabot 5 → 0 y `npm audit` 0 vulnerabilidades (`541cc20`). Dependabot activo: abrió 6 PR de actualización (#9 a #14), pendientes de triage (F-08 verificado).*
- [x] Revisé autenticación y autorización si el cambio afecta APIs. *`requireApiKey` en POST/PATCH/aggregates/audit; lecturas de alertas públicas por diseño.*
- [x] Se ejecutaron pruebas funcionales y de regresión. *`npm test`: 5/5 en verde (incluye la del 429, `38cf99b`).*
- [x] Si hay DAST, fue sobre mi staging autorizado. *ZAP baseline pasivo contra la app local del runner (`127.0.0.1:3000`), nunca contra terceros ni la VM. Informe inicial archivado en `evidence/ZAP/`.*
- [x] Vinculé hallazgos, decisiones de mitigación y evidencias. *`SECURITY.md`, `REPORTE_HALLAZGOS.md` y `evidence/lab5/README.md`.*

## Pendientes antes de dar el laboratorio por cerrado
- [ ] Hacer commit y PR de la migración a Express 5 (hecha y validada en local, ver `evidence/express5/`) y comprobar que *zap-local* pasa en CI.
- [ ] Hacer triage de los otros 5 PR de Dependabot (#9 a #13).
- [ ] Corregir F-06 en el frontend y F-09 (cabeceras), y reejecutar ZAP para tener el informe "después".
- [ ] Corregir lo que queda de F-04 (acciones `@v4`) y revisar F-07 (`trust proxy`).
- [ ] (Opcional) Captura del PR #6 ya fusionado.
