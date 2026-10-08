"use client"

import { useState } from "react"

import { INPUT_CLASS, PRIMARY_BUTTON } from "@/components/journey/styles"
import { LIMITS } from "@/lib/journey/operations"

export function JoinForm({ onJoin }: { onJoin: (name: string) => Promise<boolean> }): React.JSX.Element {
  const [name, setName] = useState("")
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    if (!name.trim()) return
    setBusy(true)
    await onJoin(name.trim())
    setBusy(false)
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card mt-6 flex flex-col gap-3 p-5 sm:flex-row sm:items-end">
      <label className="flex flex-1 flex-col text-sm font-semibold text-title">
        Quý khách được mời cùng lên kế hoạch. Nhập tên để cả nhóm biết ai đang góp ý:
        <input required maxLength={LIMITS.nameLength} value={name} onChange={(event) => setName(event.target.value)} placeholder="Ví dụ: Minh" className={INPUT_CLASS} />
      </label>
      <button type="submit" disabled={busy} className={PRIMARY_BUTTON}>
        {busy ? "Đang vào…" : "Vào kế hoạch"}
      </button>
    </form>
  )
}
