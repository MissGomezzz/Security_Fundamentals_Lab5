# Checklist de seguridad del Pull Request

Aplicado al PR de remediación #6 (y al complemento #7). La migración a Express 5 (`7e76984`) se hizo sin PR y por tanto sin esta checklist; ver `SECURITY.md` 2.7. Detalle en [`PULL_REQUESTS.md`](PULL_REQUESTS.md).

- [x] El cambio tiene una descripción funcional y un alcance definido. *Remediación de F-01, F-02, F-03 y F-06; ver descripción sugerida en `PULL_REQUESTS.md`.*
- [x] Revisé que no se subieran credenciales, tokens ni archivos .env. *`.env` en `.gitignore` y nunca versionado; `API_KEY` en `secrets`; Gitleaks en verde.*
- [x] El SAST fue ejecutado; interpreté hallazgos verdaderos y falsos positivos. *Semgrep 9 → 4 (tras el PR #5) y, tras la remediación del 8 nov, 4 de nuevo pero distintos: 2 de Nginx (F-05, riesgo aceptado) y 2 de `cooldown`; las acciones mutables y los 37 falsos positivos de `evidence/` desaparecieron. CodeQL 7 → 0.*
- [x] Revisé dependencias y actualizaciones relevantes. *Dependabot 5 → 0 y `npm audit` 0 vulnerabilidades (`541cc20`). Dependabot activo: abrió 5 PR de actualización (#9 a #13), fusionados el 8 nov (F-08 verificado).*
- [x] Revisé autenticación y autorización si el cambio afecta APIs. *`requireApiKey` en POST/PATCH/aggregates/audit; lecturas de alertas públicas por diseño.*
- [x] Se ejecutaron pruebas funcionales y de regresión. *`npm test`: 5/5 en verde en la API (incluye la del 429, `38cf99b`). Con las pruebas del frontend, 11/11 el 8 nov (commit `f775052`).*
- [x] Si hay DAST, fue sobre mi staging autorizado. *ZAP baseline pasivo contra la app local del runner (`127.0.0.1:3000`, frontend), nunca contra terceros ni la VM. Informes inicial y posterior archivados en `evidence/ZAP/zap-report-before/` y `zap-report-after/`.*
- [x] Vinculé hallazgos, decisiones de mitigación y evidencias. *`SECURITY.md`, `REPORTE_HALLAZGOS.md` y `evidence/lab5/`.*
