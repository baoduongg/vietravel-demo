import { BayScene } from "@/components/avatar/scenes/bay-scene"
import { BeachScene } from "@/components/avatar/scenes/beach-scene"
import { HeritageScene } from "@/components/avatar/scenes/heritage-scene"
import { MountainScene } from "@/components/avatar/scenes/mountain-scene"
import { WorldScene } from "@/components/avatar/scenes/world-scene"
import type { SceneTheme } from "@/lib/scene"
import { cn } from "@/lib/utils"

interface SceneLayer {
  Scene: () => React.JSX.Element
  /** Bầu trời của cảnh; mỗi lớp tự mang bầu trời để cross-fade được cả màu nền. */
  sky: string
}

const LAYERS: Record<SceneTheme, SceneLayer> = {
  bay: { Scene: BayScene, sky: "from-[#bfe3ff] via-[#e3f2ff] to-white" },
  mountain: { Scene: MountainScene, sky: "from-[#c9c3ee] via-[#e6dff5] to-[#fdf0e2]" },
  beach: { Scene: BeachScene, sky: "from-[#ff9f7a] via-[#ffcf9a] to-[#fff0d4]" },
  heritage: { Scene: HeritageScene, sky: "from-[#f2c777] via-[#f9e0ad] to-[#fff6e4]" },
  world: { Scene: WorldScene, sky: "from-[#9fb0ff] via-[#d2dafe] to-[#f5f7ff]" },
}

const SCENE_ORDER = Object.keys(LAYERS) as SceneTheme[]

interface StageSceneryProps {
  scene: SceneTheme
  className?: string
}

/** Xếp chồng mọi cảnh và chỉ hiện cảnh đang chọn, nên đổi điểm đến là một cú mờ dần mượt. */
export function StageScenery({ scene, className }: StageSceneryProps): React.JSX.Element {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      {SCENE_ORDER.map((theme) => {
        const { Scene, sky } = LAYERS[theme]
        return (
          <div
            key={theme}
            className={cn(
              "absolute inset-0 bg-linear-to-b transition-opacity duration-[1400ms] ease-soft motion-reduce:transition-none",
              sky,
              theme === scene ? "opacity-100" : "opacity-0",
            )}
          >
            <Scene />
          </div>
        )
      })}
    </div>
  )
}
