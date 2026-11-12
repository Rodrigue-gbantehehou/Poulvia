const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')
const path = require('path')

const dev = process.env.NODE_ENV !== 'production'
const port = process.env.PORT || 3000
const app = next({ dev })
const handle = app.getRequestHandler()
const betaApkRoute = '/downloads/poulvia-beta.apk'
const betaApkPath = path.join(__dirname, 'public', 'downloads', 'poulvia-beta.apk')

async function serveBetaApk(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD', 'Cache-Control': 'no-store' })
    res.end()
    return
  }

  try {
    const file = await fs.promises.stat(betaApkPath)
    res.writeHead(200, {
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Disposition': 'attachment; filename="poulvia-beta.apk"',
      'Content-Length': file.size,
      'Cache-Control': 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
    })

    if (req.method === 'HEAD') {
      res.end()
      return
    }

    const stream = fs.createReadStream(betaApkPath)
    stream.on('error', () => {
      if (!res.headersSent) res.writeHead(500, { 'Cache-Control': 'no-store' })
      res.end()
    })
    stream.pipe(res)
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.writeHead(404, { 'Cache-Control': 'no-store', 'Content-Type': 'text/plain; charset=utf-8' })
      res.end('Le fichier bêta est introuvable.')
      return
    }
    res.writeHead(500, { 'Cache-Control': 'no-store' })
    res.end()
  }
}

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    if (parsedUrl.pathname === betaApkRoute) {
      void serveBetaApk(req, res)
      return
    }
    handle(req, res, parsedUrl)
  }).listen(port, (err) => {
    if (err) throw err
    console.log(`> Poulvia Landing prête sur le port ${port}`)
  })
})
