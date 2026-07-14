import yaml, glob
import json

out = {}
for f in sorted(glob.glob('evals/cases/EV-*.yaml')):
    with open(f, 'r', encoding='utf-8') as file:
        data = yaml.safe_load(file)
        out[data['id']] = {
            'setup': data['setup'],
            'expect_pass': data['expect_pass'],
            'expect_fail': data.get('expect_fail', [])
        }
with open('cases_dump.json', 'w') as file:
    json.dump(out, file, indent=2)
