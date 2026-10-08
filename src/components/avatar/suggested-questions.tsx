import { StarIcon } from "lucide-react"
import { motion } from "motion/react"

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
    <div className={cn("flex min-w-0", className)}>
      <motion.ul
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
        className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]"
      >
        {questions.map((question) => (
          <motion.li
            key={question}
            variants={{ hidden: { opacity: 0, x: 18 }, show: { opacity: 1, x: 0 } }}
            transition={{ type: "spring", stiffness: 240, damping: 24 }}
            className="shrink-0"
          >
            <button
              type="button"
              disabled={disabled}
              onClick={() => onSelect(question)}
              className="inline-flex items-center gap-1.5 rounded-full bg-white ring-1 ring-ocean/10 px-3.5 py-1.5 text-left whitespace-nowrap text-[0.78rem] font-semibold text-ocean transition-colors duration-300 outline-none hover:bg-[#cbe6ff] focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            >
              <StarIcon aria-hidden strokeWidth={1.5} className="size-3.5 shrink-0" />
              {question}
            </button>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  )
}
