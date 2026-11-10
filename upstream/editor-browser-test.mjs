import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(process.env.VISUALIZER_URL ?? 'http://localhost:5173/visualizer.html');
  await page.waitForFunction(() => window.online_ide_access?.getIDE('edu_abstract_datatype_visualizer'), { timeout: 120000 });
  // Assert the real input backend as headless Chromium cannot reproduce OS
  // preferences such as automatic punctuation after a double space.
  const input = page.locator('.monaco-editor textarea.inputarea').first();
  await input.waitFor({ state: 'attached' });
  await page.evaluate(() => {
    const editor = window.online_ide_access.getIDE('edu_abstract_datatype_visualizer').ide.getMainEditor();
    editor.setValue('// whitespace');
    editor.setPosition({ lineNumber: 1, column: 14 });
    editor.focus();
  });
  for (let i = 0; i < 6; i++) await page.keyboard.press('Space');
  await page.keyboard.type('end');
  const source = () => page.evaluate(() => window.online_ide_access.getIDE('edu_abstract_datatype_visualizer').ide.getMainEditor().getValue());
  assert.equal(await source(), '// whitespace      end');
  await page.keyboard.press('Home');
  for (let i = 0; i < 4; i++) await page.keyboard.press('Space');
  assert.equal(await source(), '    // whitespace      end');
  await page.keyboard.press('Backspace');
  assert.equal(await source(), '   // whitespace      end');
  await page.keyboard.type('.');
  assert.equal(await source(), '   .// whitespace      end');
  assert.deepEqual(errors, []);
  console.log('PASS Chromium textarea input: leading and repeated spaces, backspace and explicit period');
} finally {
  await browser.close();
}
