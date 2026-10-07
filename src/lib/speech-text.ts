import { company } from "@/config/company"
import { spellOutMoney } from "@/lib/vietnamese-number"

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function cleanMarkdownForSpeech(text: string): string {
  return text
    // Remove markdown links [label](url) -> label
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Remove markdown headers
    .replace(/^#+\s+/gm, "")
    // Remove bold/italic markers
    .replace(/(\*\*|\*|__|_)(.*?)\1/g, "$2")
    // Remove bullet points / list markers
    .replace(/^[\s*•-]+/gm, "")
    // Remove code blocks and inline code
    .replace(/`{1,3}[^`]*`{1,3}/g, "")
    // Normalize newlines to pauses
    .replace(/\n+/g, ". ")
    // Remove redundant punctuation and spaces
    .replace(/\s+/g, " ")
    .replace(/\.{2,}/g, ".")
    .trim()
}

// Số tổng đài có thể bị viết liền hoặc cách bằng dấu cách, chấm, gạch ngang.
const HOTLINE_PATTERN = new RegExp(company.hotline.replace(/\D/g, "").split("").join("[\\s.-]*"), "g")
const WEBSITE_PATTERN = new RegExp(escapeRegExp(company.website), "gi")

/** Chữ hiển thị giữ dạng số "1800 646 888", còn giọng đọc cần cách đọc từng cụm số. */
function speakContacts(text: string): string {
  return text.replace(HOTLINE_PATTERN, company.hotlineSpoken).replace(WEBSITE_PATTERN, company.websiteSpoken)
}

/** Chuẩn hoá câu trả lời thành văn bản đọc được: bỏ markdown, đọc số điện thoại, web và tiền thành chữ. */
export function toSpeechText(raw: string): string {
  return spellOutMoney(speakContacts(cleanMarkdownForSpeech(raw)))
}
