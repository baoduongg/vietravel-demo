import { ExplorerFooter } from "@/components/explorer/explorer-footer"
import { ExplorerHeader } from "@/components/explorer/explorer-header"
import { TripiFab } from "@/components/explorer/tripi-fab"

export function ExplorerShell({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <>
      <ExplorerHeader />
      <main>{children}</main>
      <ExplorerFooter />
      <TripiFab />
    </>
  )
}
