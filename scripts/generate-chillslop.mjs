// scripts/generate-chillslop.mjs
import fs from 'node:fs';

let text = fs.readFileSync('antislop.raw.md', 'utf8');

text = text.replace(
  /# antislop\n\n> Anti Slop: Rules for AI Coding Agents/g,
  '# ChillSlop 2.0: Anti-Slop & Pragmatic Senior Dev Standard\n\n> Dual Core: Anti-Slop (miqdadbadjuber) + Ponytail (dietrichgebert) + ChillRewind Time-Travel'
);

text = text.replace(/antislop/g, 'chill-agent');
text = text.replace(/Anti Slop/g, 'ChillAgent Anti-Slop & Ponytail Core');

const ponytailHeader = `
## The Pragmatic Senior Dev Creed (Ponytail Synthesis)

> **"The best code is the code you never wrote. The best design is the interface that gets out of the user's way."**

Active for the whole session until the user says "stop chill" or "normal mode".
Switch intensity mode: \`/chill [lite|full|ultra]\`.

### The 6-Step Minimalist Execution Ladder
Take the first option that completely solves the problem:
1. **Does it need to exist?** Skip features, options, and flexibility nobody asked for.
2. **Already in this codebase?** Use existing helpers, components, and services.
3. **Standard library or native platform?** Reach for \`node:*\`, native \`fetch\`, CSS Grid, native \`<dialog>\`.
4. **Already-installed dependency?** Use what exists in \`package.json\`. Never add an npm package for 10 lines.
5. **Can it be a single readable line?** Write the single line.
6. **Otherwise:** The minimum code that works reliably.

Be lazy about the solution, never about the change itself: finish every caller, test, fixture, and edge case your change touches. Deletion beats addition.
`;

text = text.replace('## Core Principle', ponytailHeader + '\n## Core Principle');

fs.writeFileSync('chillslop.md', text, 'utf8');
fs.writeFileSync('antislop.md', text, 'utf8');
fs.writeFileSync('rules/chillslop.md', text, 'utf8');
fs.writeFileSync('rules/antislop.md', text, 'utf8');
fs.writeFileSync('rules/chillslop.mdc', text, 'utf8');

console.log('Successfully generated full-length master rules (chars: ' + text.length + ')');
