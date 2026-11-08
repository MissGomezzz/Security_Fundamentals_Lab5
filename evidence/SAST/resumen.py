"""Resumen de un JSON de Semgrep.

Uso:  python evidence/SAST/resumen.py [archivo.json]
Sin argumento lee semgrep_after.json (misma carpeta que este script).
Archivos: semgrep_before.json, semgrep_after_pr5.json, semgrep_after.json.
"""
import collections
import json
import pathlib
import sys

ruta = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else pathlib.Path(__file__).with_name("semgrep_after.json")
d = json.load(open(ruta, encoding="utf8"))
r = d["results"]
print("Archivo:", ruta.name, "| Semgrep", d.get("version"), "| archivos analizados:", len(d["paths"]["scanned"]))
print("Total hallazgos:", len(r))
print("Por severidad:", dict(collections.Counter(x["extra"]["severity"] for x in r)))
print("Por regla:", dict(collections.Counter(x["check_id"].split(".")[-1] for x in r)))
print()
for x in sorted(r, key=lambda x: (x["extra"]["severity"], x["path"], x["start"]["line"])):
    print(x["extra"]["severity"], "|", x["path"], ":", x["start"]["line"], "|", x["check_id"].split(".")[-1])
print("\nErrores del escaneo:", len(d.get("errors", [])))
