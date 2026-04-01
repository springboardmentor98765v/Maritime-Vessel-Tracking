import os, glob

corrupted_map = {
    'â€¦': '…',
    'Â·': '·',
    'â†’': '→',
    'âœ•': '✕',
    'â€¢': '•',
    'â€“': '–',
    'â€”': '—',
    'â€˜': '‘',
    'â€™': '’',
    'â€œ': '“',
    'â€\u009d': '”',
    'Ã—': '×'
}

count = 0
for filepath in glob.glob('c:/Users/LENOVO/Desktop/teamm3/frontend/src/**/*.jsx', recursive=True):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for bad, good in corrupted_map.items():
        new_content = new_content.replace(bad, good)
        
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        count += 1
        print(f"Fixed encoding in {os.path.basename(filepath)}")

print(f"Total fixed: {count}")
