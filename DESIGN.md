# Kanso Instruments Design System

## Physical scene

A producer leans over a crowded workbench at midnight under a hot task lamp, surrounded by patch cables, graph paper, and bright plastic control caps.

## Direction

Reference lane: early electronic-instrument manuals colliding with screen-printed Berlin gig posters. This is not a terminal UI. The page behaves like a large patchable faceplate with kinetic type and a generative sequencer field.

## Color strategy

Full palette in OKLCH:

- Solder: `oklch(93% 0.18 103)`
- Signal: `oklch(65% 0.25 29)`
- Patch: `oklch(61% 0.2 259)`
- Bakelite: `oklch(20% 0.03 55)`
- Paper: `oklch(96% 0.025 92)`

## Typography

Display and body: Bricolage Grotesque. Labels: Azeret Mono, used only where the physical panel needs technical notation. Headline scale from 4rem to 11rem.

## Layout

Visible 12-column logic, intentionally broken by the instrument field. Hard rectangular controls, hairline rules, no decorative cards. The hero occupies more than one viewport on desktop.

## Motion

Kinetic word strips, a pointer-reactive canvas, rotating knobs, lit pads, and crisp section reveals. Only transforms and opacity animate. Reduced motion stops all automatic movement while preserving manual state changes.

## Accessibility

Controls are actual buttons or range inputs with labels. Focus is highly visible. Canvas is decorative. Contrast meets WCAG AA. Mobile collapses the panel without hiding content.
