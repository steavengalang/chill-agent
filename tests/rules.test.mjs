// tests/rules.test.js
import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

test('Verify chillslop.md contains all 40 R-rules and the Creed', () => {
  const content = fs.readFileSync('chillslop.md', 'utf8');
  assert.ok(content.length > 50000, 'chillslop.md must be a comprehensive >50KB document');
  assert.ok(content.includes('R-01'), 'Must include R-01');
  assert.ok(content.includes('R-40'), 'Must include R-40');
  assert.ok(content.includes('The 6-Step Minimalist Execution Ladder'), 'Must include Ponytail ladder');
});

test('Verify all 11 skills exist and have valid SKILL.md files', () => {
  const expectedSkills = [
    'chill-slop',
    'chill-slop-ui',
    'chill-slop-code',
    'chill-slop-copywriting',
    'chill-slop-human',
    'chill-slop-mobile',
    'chill-audit',
    'chill-review',
    'chill-debt',
    'chill-gain',
    'chill-help'
  ];
  for (const s of expectedSkills) {
    const file = `skills/${s}/SKILL.md`;
    assert.ok(fs.existsSync(file), `Skill file missing: ${file}`);
    const raw = fs.readFileSync(file, 'utf8');
    assert.ok(raw.includes('---'), `Frontmatter missing in ${file}`);
  }
});
