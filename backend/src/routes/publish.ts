import { FastifyInstance } from 'fastify'
import { getProvider } from '../oauth/registry'

export async function publishRoutes(server: FastifyInstance) {
  server.post('/publish/:provider', async (request, reply) => {
    const { provider: providerId } = request.params as { provider: string }
    const { accessToken, content, extra } = request.body as {
      accessToken: string
      content: string
      extra?: Record<string, any>
    }
    const provider = getProvider(providerId)
    if (!provider) return reply.status(404).send({ error: 'unknown provider' })
    if (!accessToken || !content) {
      return reply.status(400).send({ error: 'accessToken y content son requeridos' })
    }
    try {
      const result = await provider.publish({ accessToken, content, extra })
      if (!result.success) return reply.status(400).send(result)
      return result
    } catch (e: any) {
      return reply.status(500).send({ success: false, error: e.message })
    }
  })
}
