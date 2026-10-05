# Dynamic Tour Context Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce Gemini input tokens by replacing the full tour catalog in the cached system prompt with a small deterministic set of upcoming tours selected from recent chat messages.

**Architecture:** Keep company facts, FAQs, and answer rules in a stable system instruction; move tour selection into a pure helper that ranks catalog items against user-provided criteria. Attach a maximum of five selected tour records to request contents, cache only the stable instruction, and retain current direct-prompt fallback behavior.

**Tech Stack:** TypeScript, Next.js route handler, Gemini REST API, built-in Node test/assert facilities where available; no new dependency.

**Spec:** `docs/superpowers/specs/2026-10-05-dynamic-tour-context-design.md`

## Global Constraints

- Modify prompt construction and chat request assembly only; preserve unrelated working-tree changes.
- No catalog schema changes, UI changes, new services, dependencies, vector database, or provider migration.
- Only use upcoming departure dates; only use deal price when deal departure is upcoming.
- Budget is an upper bound only when user wording signals a maximum.
- No recognized criteria means ask one short question, not arbitrary tour recommendations.
- Preserve existing `TOURS:` contract, hotline fallback, sentence limit, and tour validation behavior.
- Candidate limit starts at 5 and ordering remains deterministic.

## Review Focus

- Vietnamese place names with and without diacritics must match same catalog destination; test normalized matching without broad fuzzy matching.
- Budget written with separators or Vietnamese number words must not become a false upper bound; test numeric formats supported by existing project utilities and make unsupported forms not filter by budget.
- Travel date referring only to month or relative phrase must not be treated as exact departure date; test month boundary and date parsing.
- Multiple or conflicting constraints must not yield an arbitrary exact-match claim; test contradictory city/date/budget inputs and alternatives labeling.
- A tour's expired deal must not leak its deal price into selected context; test a past deal date with a future standard departure.

---

## File Structure

- Modify `src/lib/system-prompt.ts`: make stable prompt omit tour rows; expose a small formatter for selected-tour context or keep formatting in focused helper.
- Create `src/lib/tour-matching.ts`: pure deterministic extraction/ranking over existing `Tour[]` and recent `ChatMessage[]`, including selected candidates and match state.
- Modify `src/app/api/avatar/chat/route.ts`: select tour context from conversation, send it as dynamic user context, cache only stable system prompt, preserve both direct fallback paths.
- Create `src/lib/tour-matching.test.ts`: runnable focused assertions for parser/matcher/ranking/date/deal/fallback invariants, using Node built-ins and available TypeScript execution support; no test framework dependency.
- No changes to catalog schema or company config expected.

## Task 1: Add deterministic tour matching helper

**Files:**
- Create: `src/lib/tour-matching.ts`
- Test: `src/lib/tour-matching.test.ts`
- Reference: `src/data/tours.ts`, `src/types/tour.ts`, `src/lib/vietnamese-number.ts`

**Interfaces:**
- Consumes: `Tour[]`, `ChatMessage[]`, `today: string`.
- Produces: `selectRelevantTours(tours: Tour[], messages: ChatMessage[], today: string): { criteriaRecognized: boolean; hasExactMatches: boolean; tours: Tour[] }`.
- Candidate cap: 5.
- Keep criteria extraction deterministic and limited to destination, departure city, max budget, and explicit date.

- [ ] **Step 1: Write focused failing assertions**

Create Node `assert/strict` assertions for: destination match with accent normalization; departure city; explicit maximum budget; non-maximum target price; date eligibility; expired deal; ranking; no criteria; contradictory/no exact match fallback; deterministic max-five cap.

- [ ] **Step 2: Run assertions to verify failure**

Run the test with available native TypeScript runner. First inspect Node version; use `node --experimental-strip-types src/lib/tour-matching.test.ts` if supported. Expected: import/function failure until helper exists. If Node cannot execute TS imports, use available project TypeScript tooling without adding dependencies.

- [ ] **Step 3: Implement minimal matching helper**

Normalize Vietnamese strings with Unicode decomposition, remove combining marks, lowercase, and normalize common `đ`/`d` equivalence. Parse explicit criteria only; use existing Vietnamese number parsing where supported. Score matched destination/city/date/budget and sort by score descending then stable original catalog order. Filter expired tour dates and expired deals before selection. Return up to five exact matches; when criteria recognized but none match, return up to five closest upcoming alternatives with `hasExactMatches: false`. If no criterion parsed, return no tours.

- [ ] **Step 4: Add review-focus assertions and run test**

Include unsupported relative/month-only date, contradictory constraints, and past-deal cases. Run focused test; expected: PASS.

## Task 2: Separate stable prompt from selected-tour context

**Files:**
- Modify: `src/lib/system-prompt.ts`
- Test: `src/lib/tour-matching.test.ts` or a focused prompt assertion in same runnable test

**Interfaces:**
- Preserve `buildSystemPrompt(today, config)` but remove full-catalog tour block.
- Add `buildTourContext(tours: Tour[], matchState: { criteriaRecognized: boolean; hasExactMatches: boolean }): string` or equivalent clearly typed formatter.

- [ ] **Step 1: Assert stable prompt excludes tour catalog and retains essential rules**

Use the first catalog tour code as a sentinel; assert `buildSystemPrompt(today)` does not include it, but still includes hotline, `TOURS:` marker, sentence limit, grounding/no-invention rules, and exact-match behavior instructions.

- [ ] **Step 2: Assert dynamic context distinguishes exact matches, alternatives, and no criteria**

Check formatter output includes only selected tour facts and appropriate instructions. No criteria case must explicitly tell model to ask one question and recommend no tour. No exact match case must label alternatives and require disclosure of mismatch.

- [ ] **Step 3: Implement compact context formatting**

Reuse existing `describeTour` where it preserves needed facts, or compact its fields to code, name, scope/region, departure city, duration, upcoming dates, applicable price/deal, tour line, transport. Ensure stale deal never appears. Do not duplicate whole-catalog formatting.

- [ ] **Step 4: Run focused assertions**

Expected: PASS; stable prompt contains no tour rows and selected context bounded to five.

## Task 3: Wire dynamic context and stable cache into chat route

**Files:**
- Modify: `src/app/api/avatar/chat/route.ts`
- Reference: `src/lib/system-prompt.ts`, `src/lib/tour-matching.ts`

**Interfaces:**
- `getCachedSystemInstruction` caches only `buildSystemPrompt(today)` as `systemInstruction`.
- Request `contents` includes original conversation plus a clearly delimited dynamic tour context in a user content part immediately before the latest user question (or an equivalent representation that preserves chronological user intent).
- Both cache-failure and cache-miss direct paths send stable system prompt plus the same dynamic tour context.

- [ ] **Step 1: Factor request content assembly and test placement**

Add a small helper only if needed to attach dynamic context consistently. Ensure the latest user message remains the final conversational input and model can distinguish server-provided tour data from user-authored instructions. Prefer adding context as a separate user part adjacent to the latest user turn with explicit delimiters; do not rewrite historical messages.

- [ ] **Step 2: Wire selector and stable cache**

Compute selected tour context from parsed messages and catalog once per request. Remove all calls that rebuild a full-tour system prompt. Preserve retries, cache miss recovery, and cached content reference behavior.

- [ ] **Step 3: Verify all request branches**

Inspect request payloads for cache-hit, cache-create failure, and cached-content 404 recovery. Each must include stable instruction and selected dynamic context exactly once; cache hit must reference cache and avoid sending duplicate system instruction.

## Task 4: Verify tokens, correctness, and app behavior

**Files:**
- No further source changes expected; adjust prior tasks if verification exposes issues.

- [ ] **Step 1: Run focused matcher checks, lint, and production build**

Run the runnable assertions, `npm run lint`, and `npm run build`; address failures caused by implementation.

- [ ] **Step 2: Compare token counts with Gemini countTokens**

Using configured Gemini credentials, count current full prompt plus representative user request versus stable prompt plus selected context. Record counts for destination-only, city/date, max-budget, no-criteria, and no-match queries. If credentials unavailable, state this and do not claim measured savings.

- [ ] **Step 3: Exercise representative chat cases**

Use running app/API with configured key: destination only, city + date, upper budget, contradictory constraints, no recognized criteria, no matches, valid and expired deals. Verify response text and returned tour codes agree with context; verify `TOURS:` contract and hotline behavior remain intact.

- [ ] **Step 4: Report measured outcome**

Report before/after token counts, test/build results, any cases not exercised, and retained pre-existing working-tree changes. Do not commit unless explicitly requested.
