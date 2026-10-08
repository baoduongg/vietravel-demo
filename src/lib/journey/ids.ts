/** "Vinpearl Safari" → "vinpearl-safari"; bỏ dấu tiếng Việt để id ổn định. */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function activityServiceId(name: string): string {
  return `activity-${slugify(name)}`
}

export function tourServiceId(code: string): string {
  return `tour-${code}`
}
