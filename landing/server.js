const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')
const path = require('path')
const { timingSafeEqual } = require('crypto')

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

  const expectedCode = process.env.POULVIA_BETA_DOWNLOAD_CODE
  if (!expectedCode) {
    res.writeHead(503, { 'Cache-Control': 'no-store', 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Le téléchargement de la bêta n’est pas configuré.')
    return
  }

  const authorization = req.headers.authorization || ''
  let credentials = ''
  if (authorization.startsWith('Basic ')) {
    try {
      credentials = Buffer.from(authorization.slice(6), 'base64').toString('utf8')
    } catch {
      credentials = ''
    }
  }

  const separator = credentials.indexOf(':')
  const username = separator >= 0 ? credentials.slice(0, separator) : ''
  const suppliedCode = Buffer.from(separator >= 0 ? credentials.slice(separator + 1) : '', 'utf8')
  const expectedCodeBuffer = Buffer.from(expectedCode, 'utf8')
  const validCode = suppliedCode.length === expectedCodeBuffer.length && timingSafeEqual(suppliedCode, expectedCodeBuffer)

  if (username !== 'testeur' || !validCode) {
    res.writeHead(401, {
      'WWW-Authenticate': 'Basic realm="Poulvia — Bêta Android", charset="UTF-8"',
      'Cache-Control': 'no-store',
      'Content-Type': 'text/plain; charset=utf-8',
    })
    res.end('Entrez l’identifiant testeur et le code communiqué par Poulvia.')
    return
  }

  try {
    const file = await fs.promises.stat(betaApkPath)
    res.writeHead(200, {
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Disposition': 'attachment; filename="poulvia-beta.apk"',
      'Content-Length': file.size,
      'Cache-Control': 'private, no-store',
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
