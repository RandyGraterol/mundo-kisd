# Reglas

- No ejecutar comandos bash. El usuario los ejecuta manualmente.
- Delegar al usuario cualquier ejecución de comandos.

# Summary

## Goal
Achieve consistent dark mode and compact/responsive layout across all game pages, with no bright/colorful elements.

## Constraints & Preferences
- Scrollbar must be hidden but scroll must still work (`scrollbar-width: none` + `::-webkit-scrollbar { display: none }`)
- Nav and footer must be fixed/static (`shrink-0`); only middle container scrolls
- Auth pages must fit without internal scroll; the `<main>` container handles overflow
- Root `/` must redirect to `/auth/login`
- In dark mode, no bright/showy colors anywhere — all elements must be muted/neutral (whites, grays)
- Hover borders on cards must be neutral, not colored
- Globe map container must not have a white wrapper; use native dark background
- Buttons, icons, text, stats, badges — all must be visibly smaller and compact on every page
- Option letter hovers (A/B/C/D) in trivia must not show orange in dark mode
- Modal images must not overlap text (use `pr-12` clearance)

## Done
- Restructured login/registro: title/subtitle + "Volver al inicio" moved inside the form card; "Mundo Kids" h2 removed from side panels
- Removed `overflow-y-auto` from login card; removed `overflow-hidden` from auth-wrapper
- Removed all backgrounds, gradients, blur circles, transparencies from auth pages and side panels
- `layout.ejs`: `<main>` changed to `flex-1 overflow-y-auto scroll-container` (hidden scrollbar); wrapper `overflow-hidden` removed; footer now always rendered with `shrink-0`
- Root `/` route redirects to `/auth/login` instead of `bienvenida.ejs`
- Removed duplicate footer includes from `login.ejs` and `registro.ejs`
- Fixed "Cambiar Contraseña" hover square effect in `perfil.ejs` (removed `group-hover:bg-sky-100`)
- Added dark mode CSS overrides in `estilos-globales.css` for text, bg, timer, puzzle board colors
- Added menu page dark mode overrides with `#menu-progress`, `#menu-links`, `#menu-activities` selectors — all muted grays
- Restructured `/continentes` page: removed white wrapper around globe, kept only `#mapa-mundo` with native dark gradient
- Added dark mode classes to `continentes.ejs`: continent-title, -icon, -sidebar, -link, -hint, -arrow, -header-badge
- Added dark mode to `continente.ejs` (individual continent page): cont-white-card, cont-sabias, cont-chip, cont-back-btn with all sub-classes
- Neutralized "¿Sabías qué?" card from orange/amber to slate neutrals
- Neutralized "Acepta el Reto" button with `cont-reto` class — slate bg in dark mode
- `trivia-banderas.ejs`: complete compact redesign — header+stats in one row, 2-column option grid, reduced all sizes (stats `px-4 py-2 text-sm`, button `py-3 px-8 text-sm`, options `p-4 text-sm`), dark mode for all elements
- Fixed flag SVG overlapping description text: added `pr-12` and smaller SVG (40×40, opacity-6)
- Removed orange hover on trivia option letters in dark mode (`group-hover` overrides)
- `resultado-trivia.ejs`: complete redesign — result+stats in horizontal row, buttons side by side, reduced sizes (icon `w-14 h-14`, text `sm:text-3xl`, stats `text-xl`), dark mode CSS
- `modal-atencion.ejs`: responsive — `max-w-lg` → `max-w-xl`, padding `p-6 sm:p-8 md:p-10`, `p-8` inner, `flex gap-4` layout; dark mode — all slate neutrals
- `sopa-letras.ejs`: complete redesign — header inline, grid+sidebar `gap-4`, 2-column options, compact theme cards (`p-4 w-12 h-12 text-xs`), dark mode CSS
- `clasificacion.ejs`: complete redesign — header inline, top 3 flex row, compact avatars (`w-16 h-16`/`w-14 h-14`), table `px-4 py-3 text-sm`, dark mode CSS
- `puzzle.ejs`: complete redesign — badge inline, stats grid `col-3`, mode buttons `py-2 text-xs`, actions `py-3 text-xs`, theme/continent/difficulty cards compact, dark mode CSS
- `memoria.ejs`: complete redesign — 4-column grid layout (board 3, sidebar 1), compact cards, smaller text, dark mode CSS for all components (timer, stats, level, progress, buttons, victory, timeout, selection cards, theme/continent cards)

## Key Decisions
- Used page-specific `<style>` blocks with prefixed class names (`triv-`, `res-`, `cont-`, `sl-`, `cl-`, `pz-`, `mem-`) for targeted dark mode overrides instead of bloating global CSS
- Used `flex flex-col sm:flex-row` for header+stats on many pages to save vertical space on mobile
- Used `max-w-lg` → `max-w-xl`/`max-w-4xl` and inner padding `p-6 sm:p-8` consistently for compact cards
- Removed the outer white wrapper around the globe instead of overriding its background — cleaner approach
- For procedural canvas-generated puzzle images, acknowledged limitation (not a bug in recent changes)

## Next Steps
- Verify dark mode on remaining pages (admin/*)
- Check all responsive breakpoints after container changes
- Consider removing `bienvenida.ejs` if no longer needed

## Relevant Files
- `views/layout.ejs`: Main layout — scroll container, always-show footer
- `views/menu.ejs`: Dark mode overrides with IDs `#menu-progress`, `#menu-links`, `#menu-activities`
- `views/continentes.ejs`: Globe wrapper removed, dark mode classes
- `views/continente.ejs`: Full dark mode for all cards, chips, buttons
- `views/trivia-banderas.ejs`: Compact redesign with dark mode CSS
- `views/resultado-trivia.ejs`: Compact redesign with dark mode CSS
- `views/partials/modal-atencion.ejs`: Responsive + dark mode fix
- `views/sopa-letras.ejs`: Compact redesign with dark mode CSS
- `views/clasificacion.ejs`: Compact redesign with dark mode CSS
- `views/puzzle.ejs`: Compact redesign with dark mode CSS
- `views/memoria.ejs`: Compact redesign with dark mode CSS
- `public/css/estilos-globales.css`: Broad dark mode overrides for common Tailwind utility classes
