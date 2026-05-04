const fs = require('node:fs');
const path = require('node:path');

const distDir = path.join(__dirname, '..', 'dist-cjs');

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      walk(entryPath);
      continue;
    }

    if (entry.name.endsWith('.js')) {
      const cjsPath = entryPath.replace(/\.js$/, '.cjs');
      const content = fs
        .readFileSync(entryPath, 'utf8')
        .replace(/\.js(['"])/g, '.cjs$1');

      fs.writeFileSync(cjsPath, content);
      fs.unlinkSync(entryPath);
    }

    if (entry.name.endsWith('.js.map')) {
      const cjsMapPath = entryPath.replace(/\.js\.map$/, '.cjs.map');
      fs.renameSync(entryPath, cjsMapPath);
    }
  }
}

walk(distDir);
