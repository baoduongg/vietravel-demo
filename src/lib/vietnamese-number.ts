const DIGITS = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"]
const SCALES = ["", "nghìn", "triệu", "tỷ"]

function readTriple(value: number, isLeading: boolean): string {
  const hundreds = Math.floor(value / 100)
  const tens = Math.floor((value % 100) / 10)
  const units = value % 10
  const words: string[] = []

  if (!isLeading || hundreds > 0) words.push(DIGITS[hundreds], "trăm")

  if (tens === 0) {
    if (units > 0 && words.length > 0) words.push("lẻ")
  } else if (tens === 1) {
    words.push("mười")
  } else {
    words.push(DIGITS[tens], "mươi")
  }

  if (units === 0) return words.join(" ")
  if (units === 1 && tens >= 2) words.push("mốt")
  else if (units === 5 && tens >= 1) words.push("lăm")
  else words.push(DIGITS[units])
  return words.join(" ")
}

export function numberToVietnamese(value: number): string {
  if (!Number.isSafeInteger(value) || value < 0) return String(value)
  if (value === 0) return DIGITS[0]

  const groups: number[] = []
  for (let rest = value; rest > 0; rest = Math.floor(rest / 1000)) groups.push(rest % 1000)
  if (groups.length > SCALES.length) return String(value)

  const words: string[] = []
  for (let index = groups.length - 1; index >= 0; index -= 1) {
    if (groups[index] === 0) continue
    words.push(readTriple(groups[index], index === groups.length - 1))
    if (SCALES[index]) words.push(SCALES[index])
  }
  return words.join(" ")
}

const CURRENCY_SUFFIX = /(\d)\s*(?:vnđ|vnd|đ)(?!\p{L})/giu
const GROUPED_NUMBER = /\d{1,3}(?:\.\d{3})+(?![\d.]\d)/g
const AMOUNT_BEFORE_DONG = /\d+(?=\s*đồng)/g

export function spellOutMoney(text: string): string {
  const toWords = (match: string): string => numberToVietnamese(Number(match.replace(/\./g, "")))
  return text
    .replace(CURRENCY_SUFFIX, "$1 đồng")
    .replace(GROUPED_NUMBER, toWords)
    .replace(AMOUNT_BEFORE_DONG, toWords)
}
