import { saveJourney, type SavedJourney } from "@/lib/journey/local"
import { journeyService } from "@/services/journey.service"
import type { JourneyInfoValues } from "@/types/journey"

/** Tạo kế hoạch rồi nhớ link sửa và tên người tạo trên trình duyệt này. */
export async function createJourneyAndSave(destinationSlug: string, values: JourneyInfoValues): Promise<SavedJourney> {
  const { journey, memberId } = await journeyService.create({ ...values, destinationSlug })
  if (!journey.editToken) throw new Error("Máy chủ không trả về link sửa.")
  const [saved] = saveJourney({ id: journey.id, token: journey.editToken, title: journey.title, role: "edit", memberId })
  return saved
}
