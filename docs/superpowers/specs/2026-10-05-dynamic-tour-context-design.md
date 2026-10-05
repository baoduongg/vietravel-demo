# Dynamic Tour Context for Chat

## Goal

Reduce Gemini input tokens while preserving Vietravel chat accuracy. Keep the existing catalog and Gemini cached-content flow; send only tour records relevant to the current conversation. No vector database or new dependency.

## Current flow

`buildSystemPrompt(today)` embeds company facts, FAQs, all upcoming tours, and response rules. `POST /api/avatar/chat` builds recent conversation content and uses a one-hour Gemini cached content containing that full prompt. On cache creation failure or cache miss, it sends the full prompt directly.

## Proposed behavior

1. Split prompt construction into stable company/FAQ/rules and dynamic tour context. Stable prompt excludes all tour rows; dynamic context contains a bounded candidate set selected from the catalog.
2. Extract destination, departure city, budget, and travel date signals from the recent conversation messages already sent to Gemini. Apply deterministic matching against tour name/highlight/region, departureCity, base/deal price, and upcoming departure dates.
3. Rank tours by the number and strength of matched criteria; keep a small bounded result set (initial target: 5). Preserve deterministic ordering for ties. Include a brief match-relevant reason only if needed by the model; do not send unrelated tour fields.
4. If no criteria are recognized, provide no catalog rows and instruct the model to ask one short question for the most important missing criterion. If criteria are recognized but no tour matches, provide a small fallback set of closest candidates, clearly label them as alternatives, and require the model to state the mismatch rather than imply an exact match.
5. Keep the existing `TOURS:` output contract, hotline fallback, sentence limit, and tour validation behavior unchanged.
6. Cache only the stable system instruction. Send selected tour context with each request as dynamic input, so cache key does not vary with user criteria. Preserve cache-miss/direct-request fallback behavior.

## Matching and safety boundaries

- Use only tour fields and the current catalog; do not infer availability, prices, or dates not present in catalog.
- Treat a budget as an upper bound only when user wording signals a maximum (for example, "dưới", "tối đa"); do not interpret a stated target price as a strict cap.
- A tour can be selected only if its departure date is on or after `today`; a deal is valid only when its deal departure date is upcoming.
- Destination matching must tolerate Vietnamese case and diacritic variants and common aliases already represented by the catalog. Do not introduce broad fuzzy matching that can create false positives.
- No recognized criteria means ask, not arbitrary tour recommendations. Recognized criteria with zero matches means disclose the mismatch and optionally offer nearest alternatives.

## Verification

- Add focused runnable checks for matching, ranking, date/deal eligibility, no-criteria behavior, and no-match alternatives.
- Exercise chat cases: destination only, city + date, maximum budget, contradictory constraints, no recognized criteria, and no matching tour.
- Verify each returned `TOURS:` code exists in currently upcoming tours and corresponds to a tour actually present in context.
- Compare Gemini `countTokens` estimates for the current full prompt versus stable prompt plus selected-tour context across representative requests. Record token reduction; do not claim a fixed percentage before measuring.
- Confirm repeated requests still use cached stable instructions and that cache creation failure/cache miss still produce valid requests.

## Scope and rollout

Modify prompt construction and chat request assembly only; preserve unrelated working-tree changes. No catalog schema changes, UI changes, new services, dependencies, or provider migration. Validate with existing checks and representative API/browser chat behavior before completion.

## Open implementation detail

The initial candidate cap is 5. Tune only if representative cases show relevant tours are being excluded; prefer deterministic matching rules over adding embedding infrastructure.
