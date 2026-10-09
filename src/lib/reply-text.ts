import { MAX_RECOMMENDED_TOURS, TOUR_TAG } from "@/config/company"

const MAX_SENTENCES = 3
/** Ranh giới câu, trừ dấu chấm sau chữ viết tắt như "TP." trong "TP. Hồ Chí Minh". */
const SENTENCE_BREAK = /(?<=[.!?…])(?<!(?:^|\s)(?:TP|Tp|Q|P|TX|TT)\.)\s+/

/** Tách câu trả lời của model thành phần để nói và các mã tour sau TOUR_TAG. */
export function splitTourTag(raw: string): { speech: string; codes: string[] } {
  // Model đôi khi viết sai hoa thường (ví dụ "TOURs:"), nên tìm không phân biệt hoa thường.
  const index = raw.toUpperCase().lastIndexOf(TOUR_TAG)
  if (index === -1) return { speech: raw, codes: [] }
  const codes = raw
    .slice(index + TOUR_TAG.length)
    .split(/[\s,]+/)
    .map((code) => code.trim().toUpperCase())
    .filter((code) => /^[A-Z0-9]+$/.test(code))
  return { speech: raw.slice(0, index), codes: [...new Set(codes)].slice(0, MAX_RECOMMENDED_TOURS) }
}

/** Bỏ markdown, emoji, gạch đầu dòng; giữ tối đa MAX_SENTENCES câu để TTS đọc. */
export function toSpokenText(raw: string): string {
  const plain = raw
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_#`>~|[\]{}<>]/g, "")
    .replace(/^\s*[-+•]\s+/gm, "")
    .replace(/^\s*\d+[.)]\s+/gm, "")
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/\s+/g, " ")
    .trim()
  return plain
    .split(SENTENCE_BREAK)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .slice(0, MAX_SENTENCES)
    .join(" ")
}
