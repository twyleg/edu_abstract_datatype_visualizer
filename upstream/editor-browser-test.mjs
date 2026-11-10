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
  await page.evaluate(() => {
    window.online_ide_access.getIDE('edu_abstract_datatype_visualizer').ide.getMainEditor()
      .getDomNode().setAttribute('data-editor-test', 'source');
  });
  const input = page.locator('[data-editor-test="source"] textarea.inputarea');
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
  // Simulate the native replacement independently of keydown: headless Linux
  // does not have the affected OS's double-space punctuation service.
  for (const inputType of ['insertText', 'insertReplacementText']) {
    await page.keyboard.press('Space');
    const canceled = await input.evaluate((element, inputType) => !element.dispatchEvent(new InputEvent('beforeinput', {
      inputType, data: '. ', bubbles: true, cancelable: true,
    })), inputType);
    assert.equal(canceled, true, `${inputType} double-space replacement must be canceled`);
  }
  assert.equal(await source(), 'public class    ');

  for (const options of [
    { inputType: 'insertText', data: '.' },
    { inputType: 'insertFromPaste', data: '. ' },
    { inputType: 'insertText', data: '. ', isComposing: true },
  ]) {
    const canceled = await input.evaluate((element, options) => !element.dispatchEvent(new InputEvent('beforeinput', {
      ...options, bubbles: true, cancelable: true,
    })), options);
    assert.equal(canceled, false, 'Explicit punctuation, paste and composition must retain native input');
  }

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
  await page.evaluate(() => {
    const editor = window.online_ide_access.getIDE('edu_abstract_datatype_visualizer').ide.getMainEditor();
    editor.setValue('a \nb ');
    editor.setSelections([1, 2].map(line => ({
      selectionStartLineNumber: line, selectionStartColumn: 3,
      positionLineNumber: line, positionColumn: 3,
    })));
  });
  assert.equal(await input.evaluate(element => !element.dispatchEvent(new InputEvent('beforeinput', {
    inputType: 'insertReplacementText', data: '. ', bubbles: true, cancelable: true,
  }))), true);
  assert.equal(await source(), 'a  \nb  ');
  await page.evaluate(() => window.online_ide_access.getIDE('edu_abstract_datatype_visualizer').ide.getMainEditor().trigger('test', 'undo', null));
  assert.equal(await source(), 'a \nb ');
  await page.evaluate(() => window.online_ide_access.getIDE('edu_abstract_datatype_visualizer').ide.getMainEditor().updateOptions({ readOnly: true }));
  await page.keyboard.press('Space');
  assert.equal(await source(), 'a \nb ');
  const readOnlyCanceled = await input.evaluate(element => !element.dispatchEvent(new InputEvent('beforeinput', {
    inputType: 'insertText', data: '. ', bubbles: true, cancelable: true,
  })));
  assert.equal(readOnlyCanceled, false);
  assert.equal(await source(), 'a \nb ');
  await page.evaluate(() => window.online_ide_access.getIDE('edu_abstract_datatype_visualizer').ide.getMainEditor().updateOptions({ readOnly: false }));
  assert.deepEqual(errors, []);
  console.log('PASS Chromium textarea input: spaces, native replacement cancellation, composition, backspace and explicit period');
} finally {
  await browser.close();
}
