// test/auditor.test.js
import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { scanFile } from '../src/auditor.js';

test('Auditor detects generic purple/cyan gradients and marketing hype', () => {
  const tmpFile = path.join(process.cwd(), 'test', 'sample_slop.jsx');
  const slopContent = `
    import React from 'react';

    // This is the render method
    export function Hero() {
      return (
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl shadow-2xl">
          <h1>Unleash the power of AI ✨</h1>
          <button><svg></svg></button>
        </div>
      );
    }
  `;
  fs.writeFileSync(tmpFile, slopContent, 'utf8');

  const findings = scanFile(tmpFile);
  fs.unlinkSync(tmpFile);

  assert.ok(findings.length >= 4, `Expected at least 4 slop detections, found ${findings.length}`);
  const ids = findings.map((f) => f.id);
  assert.ok(ids.includes('VISUAL-01'), 'Must flag generic purple gradient');
  assert.ok(ids.includes('VISUAL-02'), 'Must flag rounded-3xl floating card');
  assert.ok(ids.includes('COPY-01'), 'Must flag "Unleash the power of"');
  assert.ok(ids.includes('COPY-02'), 'Must flag sparkle emoji');
  assert.ok(ids.includes('CODE-01'), 'Must flag obvious code comment');
});
