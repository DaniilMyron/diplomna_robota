---
name: generate-diplom
description: Generates diploma thesis drafts using the local Odesa Polytech rules as the source of truth and the downloaded reference thesis as an example of the finished artifact. Use when the user asks to draft, expand, structure, or generate diploma/thesis content for this repository or mentions /generate-diplom.
---

# Generate Diplom

## Quick start

1. Read `docs/diploma-rules/RULES.md`.
2. Read `docs/diploma-rules/references/README.md`.
3. Load the `humanizer` skill before generating any connected prose.
4. Use `docs/diploma-rules/references/skripnikova-reference-thesis.pdf` as the example of the finished document shape.
5. Generate content that satisfies the rules first; use the reference thesis for composition, pacing, and completeness.

## Priority order

1. User instructions.
2. `docs/diploma-rules/RULES.md`.
3. The `humanizer` skill for all generated prose.
4. Official examples in `docs/diploma-rules/sources/`.
5. Reference thesis in `docs/diploma-rules/references/`.

If the reference thesis conflicts with the rules, follow the rules.

## Workflow

### 1. Establish the writing target

Before drafting, determine:

- degree level;
- specialty;
- topic;
- required section;
- available source material;
- whether the user wants prose, outline, or a full document artifact.

### 2. Generate by structure

Keep the document aligned with the local rules:

- title page;
- Ukrainian annotation;
- English abstract;
- contents;
- introduction;
- main chapters and conclusions to chapters;
- general conclusions;
- references;
- appendices where needed.

### 3. Humanize all prose

Before delivering any generated prose, run it through the `humanizer` skill.

- Use `professional` voice for general academic prose.
- Use `technical` voice for implementation-heavy passages, architecture descriptions, algorithm explanations, and code-related sections.
- Preserve formal academic content, citations, technical terms, formulas, and required heading wording.
- Do not humanize purely structural artifacts such as title-page fields, table-of-contents entries, bibliographic records, labels, numbering, or placeholders that must stay machine-precise.
- The goal is natural, specific, non-generic academic writing, not casual tone.

### 4. Use the reference thesis well

Use the downloaded thesis to model:

- how long sections typically feel;
- how transitions are handled;
- how figures, tables, formulas, listings, and appendices are integrated into the narrative;
- what a finished, submission-ready thesis looks like as a whole.

Do **not** copy topic-specific text, claims, or sources from the reference thesis into a new work.

### 5. Write in a compliance-aware way

While generating:

- preserve the required introduction blocks;
- keep headings compatible with the rule set;
- leave explicit placeholders where factual data or citations are still missing;
- introduce tables, figures, formulas, scenarios, and listings only when they can be cited correctly in the surrounding text;
- keep bibliography placeholders easy to replace with DСТУ-compliant entries later.

### 6. Finish with a review pass

After generating a substantial section or document:

1. Compare it against `docs/diploma-rules/RULES.md`.
2. Verify that prose passed through `humanizer`.
3. Compare the document shape against the reference thesis.
4. If a `.docx` artifact exists, hand it to `/grill-with-diplom` for compliance review.

## Local references

- `../../../docs/diploma-rules/RULES.md`
- `../../../docs/diploma-rules/checklist.md`
- `../../../docs/diploma-rules/sources/`
- `../../../docs/diploma-rules/references/README.md`
- `../../../docs/diploma-rules/references/skripnikova-reference-thesis.pdf`
- `humanizer`
