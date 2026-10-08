/** text-base trên ô nhập để Safari iOS không tự phóng to khi chạm. */
export const INPUT_CLASS =
  "mt-2 h-11 w-full rounded-xl bg-tint/[0.06] px-4 text-base font-normal text-title ring-1 ring-tint/10 outline-none focus-visible:ring-2 focus-visible:ring-ring"

export const PRIMARY_BUTTON =
  "btn-primary inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"

/** Dùng token theme thay cho btn-glass (chữ trắng cố định) để đọc được ở cả giao diện sáng; trên ảnh tối thì bọc .on-dark. */
export const GHOST_BUTTON =
  "inline-flex h-10 items-center justify-center gap-2 rounded-full bg-tint/5 px-4 text-sm font-semibold whitespace-nowrap text-title ring-1 ring-tint/15 backdrop-blur-md transition-colors outline-none hover:bg-tint/10 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"

export const ICON_BUTTON =
  "grid size-9 place-items-center rounded-full text-body outline-none hover:bg-tint/[0.08] focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"

export const MENU_CLASS = "z-50 min-w-52 rounded-2xl bg-void p-1.5 shadow-2xl ring-1 ring-tint/10"

export const MENU_ITEM_CLASS =
  "flex h-9 cursor-pointer items-center rounded-xl px-3 text-sm text-body outline-none select-none data-[highlighted]:bg-tint/[0.08] data-[highlighted]:text-title"
