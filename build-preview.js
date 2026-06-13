// Builds self-contained copies of each page (CSS + JS inlined) into _preview/.
// No external local files -> opens fully even by double-click, no server.
const fs = require('fs');
const path = require('path');

const css = fs.readFileSync('styles.css', 'utf8');
const esc = s => s.replace(/<\/script>/gi, '<\\/script>'); // can't break out of the inline tag
const config = esc(fs.readFileSync('config.js', 'utf8'));
const app = esc(fs.readFileSync('app.js', 'utf8'));

const pages = ['index', 'work', 'creators', 'contact', 'privacy', 'terms'];
const outDir = '_preview';
fs.mkdirSync(outDir, { recursive: true });

let allOk = true;
for (const p of pages) {
  let html = fs.readFileSync(p + '.html', 'utf8');
  let okCss = false, okCfg = false, okApp = false;

  html = html.replace(/<link rel="stylesheet" href="styles\.css"\s*\/?>/, () => { okCss = true; return '<style>\n' + css + '\n</style>'; });
  html = html.replace(/<script src="config\.js"><\/script>/, () => { okCfg = true; return '<script>\n' + config + '\n</script>'; });
  html = html.replace(/<script src="app\.js"><\/script>/, () => { okApp = true; return '<script>\n' + app + '\n</script>'; });

  // safety: there should be no remaining external local refs
  const leftover = /href="styles\.css"|src="config\.js"|src="app\.js"/.test(html);

  fs.writeFileSync(path.join(outDir, p + '.html'), html);
  const ok = okCss && okCfg && okApp && !leftover;
  if (!ok) allOk = false;
  console.log(`${p}.html  css:${okCss} config:${okCfg} app:${okApp} leftover:${leftover}  (${Math.round(html.length/1024)}KB)`);
}
console.log(allOk ? 'ALL OK' : 'PROBLEM — check flags above');
