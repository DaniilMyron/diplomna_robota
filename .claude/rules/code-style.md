# Code Style Rules

Hard constraints on TypeScript code across the repo (client and server).

## 1. No nested `if` — **guard clauses**

One `if` per block. For a second condition: combine with `&&`/`||`, use an early-return guard, or extract the inner branch into a function. *Fowler: Replace Nested Conditional with Guard Clauses.*

```ts
// Forbidden
if (player.isAlive) {
	if (player.canInteract) openDialog(npc);
}

// Allowed
if (!player.isAlive) return;
if (!player.canInteract) return;
openDialog(npc);
```

## 2. Complex conditions become named booleans — **explaining variables**

A condition is complex if it combines two or more predicates, calls a function whose result is compared or negated, or mixes comparisons with logical operators. Extract it — and every sub-expression inside it — into named booleans above the statement. *Fowler: Introduce Explaining Variable.*

Each sub-expression is its own named fact describing state, not mechanism. Prefer positive phrasing. Name raw constants. The composition must narrate as a sentence — if reading it aloud doesn't sound like one, decompose further. If no clean name exists for a sub-condition, the abstraction is wrong — re-think, don't inline.

```ts
// Forbidden — inline, or one named boolean hiding a full chain
if (
	Math.abs(player.x - npc.x) < 16 &&
	Math.abs(player.y - npc.y) < 16 &&
	player.facing === npc.side &&
	!world.activeDialog
) triggerInteraction(npc);

// Allowed — each fact named, composition reads like a sentence
const INTERACT_RADIUS_PX = 16;
const dx = Math.abs(player.x - npc.x);
const dy = Math.abs(player.y - npc.y);

const isWithinInteractRadius = dx < INTERACT_RADIUS_PX && dy < INTERACT_RADIUS_PX;
const isFacingNpc = player.facing === npc.side;
const isDialogFree = !world.activeDialog;

const canTriggerInteraction = isWithinInteractRadius && isFacingNpc && isDialogFree;

if (canTriggerInteraction) triggerInteraction(npc);
```

## 3. Apply Fowler's refactoring catalog continuously

Rules 1 and 2 are specific instances. The general contract: apply Fowler's refactoring catalog as the default toolkit. Ask "why wasn't this refactoring applied?" — silence is a finding.

## 4. Strict TypeScript — no `any`

Strict mode is on everywhere. **Never use `any`.** If a third-party type is genuinely missing and no `unknown` + narrowing path exists, annotate the escape with a one-line comment explaining *why* `any` is unavoidable.

Prefer `unknown` + a type guard or a schema parse over `any`. Avoid `as` casts for the same reason — if a cast is unavoidable, comment the invariant that makes it safe.

## Scope

Trivial single-predicate conditions stay inline (`if (isLoading)`, `if (!error)`). `switch` and `match` chains are out of scope for rules 1 and 2.

Component-decomposition rules (200-line cap, dumb-component pattern) are client-specific and live in `apps/client/.claude/rules/frontend-architecture.md`.
