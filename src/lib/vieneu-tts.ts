const VIENEU_SPEECH_URL = "https://api.vieneu.io/api/v1/audio/speech"
const TIMEOUT_MS = 20000

/** Trả về MP3. Giọng có tên cố định nên mọi lần gọi ra cùng một người đọc. */
export async function synthesizeVieneuTts(text: string, voice: string): Promise<Buffer> {
  const apiKey = process.env.VIENEU_API_KEY
  if (!apiKey) throw new Error("Thiếu VIENEU_API_KEY")

  const response = await fetch(VIENEU_SPEECH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ input: text, voice }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!response.ok) throw new Error(`VieNeu TTS HTTP ${response.status}: ${(await response.text()).slice(0, 200)}`)
  return Buffer.from(await response.arrayBuffer())
}
