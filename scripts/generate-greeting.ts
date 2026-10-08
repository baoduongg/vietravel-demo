// Tạo sẵn giọng đọc lời chào (nội dung cố định) → public/audio/greeting.mp3.
// Chạy lại khi đổi company.persona.greeting hoặc company.voice.name:
//   npx tsx --env-file=.env.local scripts/generate-greeting.ts
import { mkdir, writeFile } from "node:fs/promises"

import { company } from "../src/config/company"
import { toSpeechText } from "../src/lib/speech-text"
import { synthesizeVieneuTts } from "../src/lib/vieneu-tts"

const OUT_DIR = "public/audio"

async function main(): Promise<void> {
  const audio = await synthesizeVieneuTts(toSpeechText(company.persona.greeting), company.voice.name)
  await mkdir(OUT_DIR, { recursive: true })
  await writeFile(`${OUT_DIR}/greeting.mp3`, audio)
  console.log(`Đã tạo ${OUT_DIR}/greeting.mp3 (${audio.byteLength} bytes, giọng ${company.voice.name})`)
}

void main()
