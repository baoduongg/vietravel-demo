import { StarIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface SuggestedQuestionsProps {
  questions: string[]
  disabled: boolean
  onSelect: (question: string) => void
  className?: string
}

export function SuggestedQuestions({
  questions,
  disabled,
  onSelect,
  className,
}: SuggestedQuestionsProps): React.JSX.Element {
  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <p className="text-sm font-semibold text-ink">Hỏi nhanh:</p>
      <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:px-0 lg:[mask-image:linear-gradient(to_right,black_88%,transparent)]">
        {questions.map((question) => (
          <li key={question} className="shrink-0">
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSelect(question)}
              className="inline-flex items-center gap-1.5 rounded-full whitespace-nowrap bg-cloud px-3.5 py-2 text-left text-[0.82rem] font-semibold text-ocean transition-transform duration-300 ease-soft outline-none hover:bg-[#cbe6ff] focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97] disabled:opacity-50"
            >
              <StarIcon aria-hidden strokeWidth={1.75} className="size-3.5 shrink-0" />
              {question}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
