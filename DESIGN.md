# SmartQ Design Direction

## Product Frame
SmartQ is a working classroom tool for teachers who need to collect student questions, spot patterns quickly, and move into the next activity without setup friction.

## Visual Principles
- Lead with real classroom context before abstract AI claims.
- Keep the interface calm, readable, and task-first.
- Use restrained blue/green accents for action and learning signals, with neutral surfaces for scanability.
- Avoid decorative emoji as interface icons in new work; prefer clear text, lucide icons, or simple status marks.

## Landing Page
- The first viewport should answer three questions immediately: what SmartQ does, who starts, and how students join.
- Hero imagery should show an actual classroom/product-use situation, not a generic gradient or illustration.
- Korean copy should be explicit and natural in public-facing hero sections. Do not route hero headlines through adaptive terminology helpers when it can produce broken grammar.

## Interaction
- Primary CTA: teacher dashboard/start flow.
- Secondary CTA: student session code entry.
- Disabled controls should avoid dead links and explain the next required action.

## Accessibility
- Icon-only buttons need accessible names.
- Mobile and user menu state should be independent to avoid accidental menu collisions.
- Legal/support links from auth screens must resolve to real pages.

## Dark Mode
Public surfaces should remain legible in both light and dark modes. Authenticated teacher pages need a later consistency pass before adding larger visual polish.

## Verification
For visual changes, verify at least desktop landing, mobile landing, and linked auth/legal paths.
