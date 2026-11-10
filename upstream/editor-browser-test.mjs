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

  await page.evaluate(() => {
    const editor = window.online_ide_access.getIDE('edu_abstract_datatype_visualizer').ide.getMainEditor();
    editor.setValue('public class');
    editor.setPosition({ lineNumber: 1, column: 13 });
    editor.focus();
  });
  // Check cancellation of native insertion, not just the resulting text: this
  // prevents the OS from applying double-space punctuation on affected systems.
  for (let i = 0; i < 2; i++) {
    const canceled = await input.evaluate(element => !element.dispatchEvent(new KeyboardEvent('keydown', {
      key: ' ', code: 'Space', keyCode: 32, bubbles: true, cancelable: true,
    })));
    assert.equal(canceled, true, 'Space must bypass native text insertion');
  }
  assert.equal(await source(), 'public class  ');
  await page.keyboard.press('Space');
  await page.keyboard.press('Space');
  assert.equal(await source(), 'public class    ');
  await page.keyboard.type('.');
  assert.equal(await source(), 'public class    .');

  const compositionCanceled = await input.evaluate(element => !element.dispatchEvent(new KeyboardEvent('keydown', {
    key: ' ', code: 'Space', keyCode: 32, isComposing: true, bubbles: true, cancelable: true,
  })));
  assert.equal(compositionCanceled, false, 'Composition must retain native input');
  assert.equal(await source(), 'public class    .');

  await page.evaluate(() => {
    const editor = window.online_ide_access.getIDE('edu_abstract_datatype_visualizer').ide.getMainEditor();
    editor.setValue('ab\ncd');
    editor.setSelections([1, 2].map(line => ({
      selectionStartLineNumber: line, selectionStartColumn: 2,
      positionLineNumber: line, positionColumn: 3,
    })));
  });
  await page.keyboard.press('Space');
  assert.equal(await source(), 'a \nc ');
  await page.evaluate(() => {
    const editor = window.online_ide_access.getIDE('edu_abstract_datatype_visualizer').ide.getMainEditor();
    editor.trigger('test', 'undo', null);
  });
  assert.equal(await source(), 'ab\ncd');
  await page.evaluate(() => window.online_ide_access.getIDE('edu_abstract_datatype_visualizer').ide.getMainEditor().updateOptions({ readOnly: true }));
  await page.keyboard.press('Space');
  assert.equal(await source(), 'ab\ncd');
  await page.evaluate(() => window.online_ide_access.getIDE('edu_abstract_datatype_visualizer').ide.getMainEditor().updateOptions({ readOnly: false }));
  assert.deepEqual(errors, []);
  console.log('PASS Chromium textarea input: spaces, native insertion cancellation, composition, backspace and explicit period');
} finally {
  await browser.close();
}
