# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Tripi: Vietnamese-speaking 3D mascot travel assistant demo for Vietravel (Next.js 15 App Router, React 19, Tailwind 4, three.js). User talks/types → LLM replies in Vietnamese → TTS speaks → mascot lip-syncs → tour cards shown. UI copy, prompts and comments are Vietnamese. See [README.md](README.md) for user-facing docs.

## Commands

```bash
pnpm dev        # next dev (localhost:3000, use Chrome/Edge for speech recognition)
pnpm build
pnpm lint
python3 scripts/scrape-tours.py   # refresh src/data/tours.json from travel.com.vn
```

No test runner configured. Tests are plain `node:assert` scripts; run one directly:

```bash
npx tsx src/lib/tour-matching.test.ts
```

Env (`.env.local`, template in `.env.example`): `GEMINI_API_KEY`, `GEMINI_MODEL`, `VIENEU_API_KEY`, `DEMO_PASSWORD`, `JOURNEY_DATA_DIR` (tùy chọn, mặc định `.data/journeys`).

## Architecture

- **Auth gate**: [src/middleware.ts](src/middleware.ts) checks a cookie holding a hash of `DEMO_PASSWORD`; `/login` page + `/api/login` set it.
- **Chat pipeline** ([src/app/api/avatar/chat/route.ts](src/app/api/avatar/chat/route.ts)): parse messages (optional image data URL) → `getUpcomingTours` (drops past departures) → `selectRelevantTours` (rule-based keyword/criteria matching, [src/lib/tour-matching.ts](src/lib/tour-matching.ts)) → if no criteria recognized, fall back to `searchToursHybrid` (Gemini embeddings + semantic taxonomy, [src/lib/vector-rag/](src/lib/vector-rag/)) → matched tours injected as dynamic context via `buildTourContext` + static `buildSystemPrompt` ([src/lib/system-prompt.ts](src/lib/system-prompt.ts)) → Gemini REST call → reply split on `TOUR_TAG` into spoken text + tour codes → `toSpokenText` trims to ≤3 sentences → codes resolved to tour cards (`findToursByCode`, or `inferToursFromReply` if no tag).
- **TTS** ([src/app/api/avatar/tts/route.ts](src/app/api/avatar/tts/route.ts)): strips markdown, spells money amounts as words ([src/lib/vietnamese-number.ts](src/lib/vietnamese-number.ts)), VieNeu TTS ([src/lib/vieneu-tts.ts](src/lib/vieneu-tts.ts), fixed voice `company.voice.name`, MP3); text cleanup in [src/lib/speech-text.ts](src/lib/speech-text.ts).
- **Tour data**: [src/data/tours.json](src/data/tours.json) (scraped, committed) wrapped by [src/data/tours.ts](src/data/tours.ts). Embeddings for tours are built in-memory lazily.
- **Kế hoạch chuyến đi (Journey)**: `/hanh-trinh` (danh sách trong localStorage + tạo mới) và `/hanh-trinh/[token]` (token quyết định quyền sửa/xem). Logic thuần trong [src/lib/journey/](src/lib/journey/): `catalog.ts` (dịch vụ: mock khách sạn/vé bay/thuê xe ở [src/data/services/](src/data/services/) + tour thật; chỗ duy nhất đổi khi có API Hub), `cost.ts`, `operations.ts` (`applyOp` dùng chung server và client để cập nhật lạc quan). Lưu file JSON ở `.data/journeys` qua `JourneyStore` (`store.ts`; hàng đợi ghi chỉ đúng với một tiến trình Node, serverless cần store khác). API ở `src/app/api/journeys/`; client hỏi lại mỗi 3 giây với `?since=<version>` ([src/hooks/use-journey.ts](src/hooks/use-journey.ts)).
- **Client**: [src/hooks/use-avatar-conversation.ts](src/hooks/use-avatar-conversation.ts) orchestrates speech recognition → chat → TTS → mascot; state in zustand ([src/stores/avatar.store.ts](src/stores/avatar.store.ts)); HTTP via [src/services/](src/services/); components in [src/components/avatar/](src/components/avatar/).
- **Avatar**: `avatarModel` in [src/config/company.ts](src/config/company.ts) picks `mascot` (GLB at `public/avatars/vietravel-robot.glb`), `mascot-procedural`, or `human` (TalkingHead, [src/lib/avatar-engine.ts](src/lib/avatar-engine.ts)). Mascot animation in [src/lib/mascot-engine.ts](src/lib/mascot-engine.ts); GLB must keep named parts (`torso`, `head`, `arm-l/r`, `mitten-l/r`, `face-display`).
- [src/config/company.ts](src/config/company.ts) is the single source for brand, persona, voice, offers, FAQ, quick questions, `TOUR_TAG`, `MAX_RECOMMENDED_TOURS`.
