const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const targetDirs = ['scripts', 'src', '.']; // '.' for root files like SYSTEM_DESIGN.md

// Updated regex to catch Variation Selectors and more emojis
const emojiRegex = /[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}\u{1F1E6}-\u{1F1FF}\uFE0F]\s*/gu;

function removeEmojis(dir, isRoot = false) {
    fs.readdir(dir, (err, files) => {
        if (err) return;
        files.forEach((file) => {
            const filePath = path.join(dir, file);
            
            // Skip node_modules, .git, etc.
            if (file === 'node_modules' || file === '.git' || file === '.next' || file === 'remove-emojis.js') return;

            if (fs.lstatSync(filePath).isDirectory()) {
                if (!isRoot) {
                    removeEmojis(filePath);
                }
            } else if (filePath.endsWith('.js') || filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.md')) {
                let content = fs.readFileSync(filePath, 'utf8');
                if (emojiRegex.test(content)) {
                    content = content.replace(emojiRegex, '');
                    fs.writeFileSync(filePath, content, 'utf8');
                    console.log(`Cleaned emojis from: ${filePath}`);
                }
            }
        });
    });
}

targetDirs.forEach(dir => {
    removeEmojis(path.join(rootDir, dir), dir === '.');
});
