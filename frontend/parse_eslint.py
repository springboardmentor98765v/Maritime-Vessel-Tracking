import json

with open('eslint.json', 'r', encoding='utf-16') as f:
    data = json.load(f)

with open('eslint_parsed.txt', 'w', encoding='utf-8') as out:
    for file in data:
        if file['errorCount'] > 0:
            out.write(file['filePath'] + '\n')
            for m in file['messages']:
                out.write(f"Line {m['line']}: {m['message']}\n")
