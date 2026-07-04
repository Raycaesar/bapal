# AGENTS.md

## Project

This is a static JavaScript playground for modal logic, epistemic logic, public announcement logic, and Boolean Arbitrary Public Announcement Logic (BAPAL). It is based on the old Modal Logic Playground / Epistemic Logic Playground.

## Core files

- `index.html`: UI and explanatory text.
- `css/app.css`: app styling.
- `js/MPL.js`: formula parser interface, model representation, and semantic evaluator.
- `js/app.js`: D3 graph editor, UI interaction, model editing, formula evaluation.
- `scripts/`: Node-based diagnostics and regression tests.

## Logic conventions

- `K{a}φ` means agent `a` knows `φ`.
- `[α]φ` means after public announcement `α`, `φ`.
- `^φ` is the BAPAL existential Boolean arbitrary announcement operator.
- Intended BAPAL reading: there exists a Boolean/propositional announcement α such that α is true at the current world and, after restricting the model to α-worlds, φ is true.
- Boolean announcements may use propositional variables and Boolean connectives only. They must not use `K`, `[ ]`, or `^`.
- In finite models, Boolean announcements correspond to unions of propositional valuation classes.
- Worlds with the same propositional valuation cannot be separated by Boolean announcements.

## S5 convention

BAPAL should normally be tested on epistemic models whose agent relations are equivalence relations.

If an S5 construction mode is implemented:
- It should maintain real equivalence relations in the underlying model.
- Do not merely alter the visual graph.
- Reflexive loops may be hidden visually, but they must exist in the model if semantic evaluation depends on them.
- Adding an S5 edge for an agent should close the relation under reflexivity, symmetry, and transitivity.

## Engineering rules

- Keep the app static. Do not add React, Vue, TypeScript, Webpack, Vite, or another build system unless explicitly asked.
- Prefer small changes.
- Preserve old modal logic, epistemic logic, and public announcement behavior.
- Add or update tests when changing `js/MPL.js` or relation-editing behavior.
- When possible, use Node scripts in `scripts/` for semantic regression tests.
- After any change, explain:
  1. what changed;
  2. why the logic is still correct;
  3. how to test it;
  4. what remains unverified.
