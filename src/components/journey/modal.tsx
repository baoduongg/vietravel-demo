"use client"

import { Dialog } from "radix-ui"
import { XIcon } from "lucide-react"

import { ICON_BUTTON } from "@/components/journey/styles"
import { cn } from "@/lib/utils"

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  wide?: boolean
  children: React.ReactNode
}

/**
 * Hộp thoại dùng chung. Portal bọc trong .explorer để nhận biến màu của trang,
 * và để không bị khối Reveal (có transform) làm lệch position: fixed.
 */
export function Modal({ open, onOpenChange, title, description, wide, children }: ModalProps): React.JSX.Element {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <div className="explorer contents">
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content
            className={cn(
              "fixed inset-x-3 bottom-3 z-50 max-h-[85dvh] overflow-y-auto rounded-[1.75rem] bg-void p-6 text-body shadow-2xl ring-1 ring-tint/10 sm:inset-x-auto sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:w-[calc(100%-2rem)] sm:-translate-x-1/2 sm:-translate-y-1/2",
              wide ? "sm:max-w-3xl" : "sm:max-w-md",
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <Dialog.Title className="font-voyage text-2xl font-semibold tracking-tight text-title">{title}</Dialog.Title>
              <Dialog.Close aria-label="Đóng" className={ICON_BUTTON}>
                <XIcon aria-hidden strokeWidth={1.5} className="size-4" />
              </Dialog.Close>
            </div>
            <Dialog.Description className={description ? "mt-1 text-sm text-muted-foreground" : "sr-only"}>{description ?? title}</Dialog.Description>
            <div className="mt-5">{children}</div>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
