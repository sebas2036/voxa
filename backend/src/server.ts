import { config } from 'dotenv'
import path from 'path'
config({ path: path.resolve(__dirname, '../../.env') })

import express from 'express'
import cors from 'cors'
import { authRouter } from './routes/auth'
import { publishRouter } from './routes/publish'
import { generateRouter } from './routes/generate'

const app = express()
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.type('text/html').send(`<html><head><title>GlosX</title></head><body style="font-family:sans-serif;max-width:600px;margin:50px auto;padding:20px"><h1>GlosX</h1><p>Transform your ideas into social media content for 10 platforms using AI.</p><p>Available on iOS and Android.</p><a href="/privacy">Privacy Policy</a> | <a href="/terms">Terms</a></body></html>`)
})
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'glosx-api' }))
app.get('/privacy', (req, res) => res.type('text/html').send('<html><body><h1>GlosX Privacy Policy</h1><p>GlosX does not store passwords or financial data. Tokens stored only on your device. Contact: GlosX@outlook.com</p></body></html>'))
app.get('/terms', (req, res) => res.type('text/html').send('<html><body><h1>GlosX Terms</h1><p>By using GlosX you agree to our terms. Content is AI-generated - review before publishing.</p></body></html>'))

app.use(authRouter)
app.use(publishRouter)
app.use(generateRouter)

const port = Number(process.env.PORT) || 3000
app.listen(port, '0.0.0.0', () => console.log(`glosx API corriendo en http://localhost:${port}`))
