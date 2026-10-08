"use client"

import { useState } from "react"

import { INPUT_CLASS, PRIMARY_BUTTON } from "@/components/journey/styles"
import { LIMITS } from "@/lib/journey/operations"
import type { JourneyInfoValues } from "@/types/journey"

interface JourneyInfoFormProps {
  initial: JourneyInfoValues
  /** true khi tạo kế hoạch: hỏi tên người tạo. */
  askName: boolean
  submitLabel: string
  onSubmit: (values: JourneyInfoValues) => Promise<void>
}

const DEFAULT_CHILD_AGE = 5

function Field({ label, children }: { label: string; children: React.ReactNode }): React.JSX.Element {
  return (
    <label className="flex flex-col text-sm font-semibold text-title">
      {label}
      {children}
    </label>
  )
}

function NumberSelect({ value, min, max, onChange, label, suffix = "" }: { value: number; min: number; max: number; onChange: (value: number) => void; label?: string; suffix?: string }): React.JSX.Element {
  return (
    <select aria-label={label} value={value} onChange={(event) => onChange(Number(event.target.value))} className={INPUT_CLASS}>
      {Array.from({ length: max - min + 1 }, (_, index) => min + index).map((option) => (
        <option key={option} value={option}>
          {option}
          {suffix}
        </option>
      ))}
    </select>
  )
}

export function JourneyInfoForm({ initial, askName, submitLabel, onSubmit }: JourneyInfoFormProps): React.JSX.Element {
  const [title, setTitle] = useState(initial.title)
  const [startDate, setStartDate] = useState(initial.startDate ?? "")
  const [nights, setNights] = useState(initial.nights)
  const [adults, setAdults] = useState(initial.travelers.adults)
  const [childAges, setChildAges] = useState(initial.travelers.childAges)
  const [memberName, setMemberName] = useState(initial.memberName)
  const [busy, setBusy] = useState(false)

  function setChildCount(count: number): void {
    setChildAges((ages) => (count > ages.length ? [...ages, ...Array<number>(count - ages.length).fill(DEFAULT_CHILD_AGE)] : ages.slice(0, count)))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setBusy(true)
    try {
      await onSubmit({ title: title.trim(), startDate: startDate || null, nights, travelers: { adults, childAges }, memberName: memberName.trim() })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Tên chuyến">
        <input required maxLength={LIMITS.titleLength} value={title} onChange={(event) => setTitle(event.target.value)} className={INPUT_CLASS} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Ngày đi (không bắt buộc)">
          <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className={INPUT_CLASS} />
        </Field>
        <Field label="Số đêm">
          <NumberSelect value={nights} min={0} max={LIMITS.maxNights} onChange={setNights} />
        </Field>
        <Field label="Người lớn">
          <NumberSelect value={adults} min={1} max={LIMITS.maxAdults} onChange={setAdults} />
        </Field>
        <Field label="Trẻ em (dưới 18)">
          <NumberSelect value={childAges.length} min={0} max={LIMITS.maxChildren} onChange={setChildCount} />
        </Field>
      </div>
      {childAges.length > 0 && (
        <fieldset>
          <legend className="text-sm font-semibold text-title">Tuổi từng bé (để tính giá trẻ em)</legend>
          <div className="grid grid-cols-3 gap-2">
            {childAges.map((age, index) => (
              <NumberSelect
                key={index}
                label={`Tuổi bé thứ ${index + 1}`}
                value={age}
                min={0}
                max={LIMITS.maxChildAge}
                suffix=" tuổi"
                onChange={(value) => setChildAges((ages) => ages.map((current, position) => (position === index ? value : current)))}
              />
            ))}
          </div>
        </fieldset>
      )}
      {askName && (
        <Field label="Tên của Quý khách (để cả nhóm biết ai góp ý)">
          <input required maxLength={LIMITS.nameLength} value={memberName} onChange={(event) => setMemberName(event.target.value)} placeholder="Ví dụ: Lan" className={INPUT_CLASS} />
        </Field>
      )}
      <button type="submit" disabled={busy} className={PRIMARY_BUTTON}>
        {busy ? "Đang lưu…" : submitLabel}
      </button>
    </form>
  )
}
