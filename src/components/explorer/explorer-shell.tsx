import { ExplorerFooter } from "@/components/explorer/explorer-footer"
import { ExplorerHeader } from "@/components/explorer/explorer-header"
import { TripiFab } from "@/components/explorer/tripi-fab"

export function ExplorerShell({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <div className="explorer grain relative min-h-dvh">
      <div aria-hidden className="scroll-progress fixed inset-x-0 top-0 z-50 h-[3px] origin-left bg-linear-to-r from-amber-300 via-coral to-fuchsia-500" />
      <ExplorerHeader />
      {/* Kéo nội dung lên dưới thanh điều hướng nổi để ảnh hero tràn mép trên. */}
      <main className="-mt-[4.25rem]">{children}</main>
      <ExplorerFooter />
      <TripiFab />
    </div>
  )
}
