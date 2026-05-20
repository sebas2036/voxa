const fs = require('fs')
const path = require('path')

const LIMITS = {
  'screens': 400,
  'components': 200,
  'hooks': 100,
  'store': 200,
}

const WARN = '\x1b[33m⚠\x1b[0m'
const OK = '\x1b[32m✓\x1b[0m'
const FAIL = '\x1b[31m✗\x1b[0m'

let hasError = false

Object.entries(LIMITS).forEach(([dir, limit]) => {
  const dirPath = path.join(__dirname, '../src', dir)
  if (!fs.existsSync(dirPath)) return
  fs.readdirSync(dirPath).forEach(file => {
    const filePath = path.join(dirPath, file)
    const lines = fs.readFileSync(filePath, 'utf8').split('\n').length
    const pct = Math.round(lines / limit * 100)
    if (lines > limit) {
      console.log(`${FAIL} ${dir}/${file}: ${lines} líneas (límite ${limit}) — ${pct}% ⚠ REFACTORIZAR`)
      hasError = true
    } else if (lines > limit * 0.85) {
      console.log(`${WARN} ${dir}/${file}: ${lines} líneas (límite ${limit}) — ${pct}% cerca del límite`)
    } else {
      console.log(`${OK} ${dir}/${file}: ${lines} líneas`)
    }
  })
})

if (hasError) {
  console.log('\n\x1b[31m Algunos archivos superan el límite.\x1b[0m')
  process.exit(1)
} else {
  console.log('\n\x1b[32m Todos los archivos dentro del límite.\x1b[0m')
}
