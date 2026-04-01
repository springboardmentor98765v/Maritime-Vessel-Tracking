const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            walk(file, callback);
        } else if (file.endsWith('.jsx')) {
            callback(file);
        }
    });
}

let count = 0;
walk('src', (filepath) => {
    let content = fs.readFileSync(filepath, 'utf8');
    let original = content;
    
    // Remove typical backdropFilter: 'blur(12px)' or similar strings
    // E.g. backdropFilter: 'blur(16px)'
    // match: backdropFilter:\s*['"`][^'"`]*['"`]\s*,?
    content = content.replace(/backdropFilter:\s*['"`][^'"`]*['"`]\s*,?/g, '');
    
    if (content !== original) {
        fs.writeFileSync(filepath, content, 'utf8');
        count++;
        console.log('Fixed', filepath);
    }
});

console.log('Total files fixed:', count);
