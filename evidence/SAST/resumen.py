import json, collections
d = json.load(open("semgrep_after.json"))
r = d["results"]
print("Total hallazgos:", len(r))
print("Por severidad:", dict(collections.Counter(x["extra"]["severity"] for x in r)))
print()
for x in sorted(r, key=lambda x: x["extra"]["severity"]):
    print(x["extra"]["severity"], "|", x["path"], ":", x["start"]["line"], "|", x["check_id"].split(".")[-1])
print("\nErrores del escaneo:", len(d.get("errors", [])))