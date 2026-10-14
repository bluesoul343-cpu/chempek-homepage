import fs from 'node:fs'
import path from 'node:path'
const root = path.resolve(import.meta.dirname, '..')
const dist = path.join(root, 'dist')
let html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
html = html.replace(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g, (_, src) => {
  let js = fs.readFileSync(path.join(dist, src.replace(/^\//, '')), 'utf8')
  for (const name of fs.readdirSync(path.join(root, 'public/images'))) {
    const data = fs.readFileSync(path.join(root, 'public/images', name)).toString('base64')
    js = js.replaceAll(`./images/${name}`, `data:image/webp;base64,${data}`)
  }
  return `<script type="module">${js.replaceAll('</script', '<\\/script')}</script>`
})
html = html.replace(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g, (_, src) => `<style>${fs.readFileSync(path.join(dist, src.replace(/^\//, '')), 'utf8')}</style>`)
fs.writeFileSync(path.join(dist, 'chempek.html'), html)
console.log('Standalone website: dist/chempek.html')
