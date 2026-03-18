import { Type } from '@sinclair/typebox'
import { readFile, stat } from 'node:fs/promises'
import { extname } from 'node:path'

const ALLOWED_EXTENSIONS = new Set(['.ogg', '.mp3', '.m4a', '.wav', '.webm', '.mp4', '.mpeg', '.flac'])
const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB

export const transcribeAudioTool = {
  name: 'finance_transcribe_audio',
  description:
    'Transcreve uma mensagem de audio (voice note) para texto usando IA de reconhecimento de voz. Use quando receber uma mensagem de audio do usuario.',
  parameters: Type.Object({
    mediaPath: Type.String({ description: 'Caminho local do arquivo de audio (ex: /home/node/.openclaw/media/inbound/uuid.ogg)' }),
    mediaType: Type.Optional(Type.String({ description: 'Tipo MIME do audio (ex: audio/ogg)' })),
  }),
  async execute(_id: string, params: Record<string, unknown>) {
    const mediaPath = params.mediaPath as string
    const ext = extname(mediaPath).toLowerCase()

    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return {
        content: [{ type: 'text' as const, text: 'Formato de arquivo não suportado. Formatos aceitos: .ogg, .mp3, .m4a, .wav, .webm, .mp4, .mpeg, .flac' }],
      }
    }

    const groqApiKey = process.env.GROQ_API_KEY
    if (!groqApiKey) {
      return {
        content: [{ type: 'text' as const, text: 'Chave de API Groq não configurada' }],
      }
    }

    let fileBuffer: Buffer
    try {
      const fileStat = await stat(mediaPath)
      if (fileStat.size > MAX_FILE_SIZE) {
        return {
          content: [{ type: 'text' as const, text: 'Áudio muito longo para transcrição (máximo 25MB)' }],
        }
      }
      fileBuffer = await readFile(mediaPath)
    } catch {
      return {
        content: [{ type: 'text' as const, text: `Arquivo de áudio não encontrado: ${mediaPath}` }],
      }
    }

    try {
      const mimeType = (params.mediaType as string) || `audio/${ext.slice(1)}`
      const fileName = `audio${ext}`

      const formData = new FormData()
      formData.append('file', new Blob([fileBuffer], { type: mimeType }), fileName)
      formData.append('model', 'whisper-large-v3-turbo')
      formData.append('language', 'pt')

      const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const errorBody = await response.text()
        return {
          content: [{ type: 'text' as const, text: `Erro na transcrição (HTTP ${response.status}): ${errorBody}` }],
        }
      }

      const result = (await response.json()) as { text: string }
      return {
        content: [{ type: 'text' as const, text: result.text }],
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido'
      return {
        content: [{ type: 'text' as const, text: `Erro ao transcrever áudio: ${message}` }],
      }
    }
  },
}
