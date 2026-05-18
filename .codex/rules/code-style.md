# Code Style Rules

Hard constraints that apply across the repo.

## 1. Prefer guard clauses

Avoid nested conditionals when a guard clause makes the flow clearer.

## 2. Name complex conditions

When a condition combines multiple facts, extract the important facts into well-named booleans before composing them.

## 3. Refactor continuously

Use small refactorings proactively when they reduce duplication, sharpen names, or make ownership clearer.

## 4. Keep language-specific discipline local

TypeScript-specific rules belong in the frontend rules. Java-specific rules belong in the backend rules. Shared guidance must stay language-agnostic.
