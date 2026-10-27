import { execFileSync } from 'node:child_process';
import { copyFileSync, writeFileSync, existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'upstream/dist-visualizer');
if (!existsSync(resolve(output, 'index.html'))) throw Error('Run npm run build first.');
const sourceRef = process.env.PAGES_SOURCE_REF || 'HEAD';
// git archive includes committed source and lockfiles, never node_modules or .git.
execFileSync('git', ['rev-parse', '--verify', `${sourceRef}^{tree}`], { cwd: root, stdio: 'pipe' });
execFileSync('git', ['archive', '--format=zip', '--prefix=edu_abstract_datatype_visualizer/',
  `--output=${resolve(output, 'source.zip')}`, sourceRef], { cwd: root, stdio: 'inherit' });
copyFileSync(resolve(root, 'LICENSE'), resolve(output, 'LICENSE.txt'));
copyFileSync(resolve(root, 'UPSTREAM.md'), resolve(output, 'UPSTREAM.md'));
const lock = JSON.parse(readFileSync(resolve(root, 'upstream/package-lock.json'), 'utf8'));
const notices = ['Third-party runtime dependency licenses (from the installed locked packages).\n'];
for (const [path, metadata] of Object.entries(lock.packages)) {
  if (!path || metadata.dev) continue;
  const directory = resolve(root, 'upstream', path);
  if (!existsSync(directory)) continue;
  notices.push(`\n===== ${path} @ ${metadata.version} · ${metadata.license ?? 'see package notice'} =====\n`);
  for (const file of readdirSync(directory)) {
    if (/^(licen[cs]e|copying|notice)([._-]|$)/i.test(file)) {
      try { notices.push(readFileSync(resolve(directory, file), 'utf8')); } catch { /* directory, not a notice file */ }
    }
  }
}
for (const file of ['docs/third-party/ASSET-NOTICES.txt', 'docs/third-party/Roboto-LICENSE.txt', 'upstream/assets/graphics/textures/celestial/License.txt', 'upstream/assets/icons/svg-loaders/LICENSE.md']) {
  notices.push(`\n===== ${file} =====\n`, readFileSync(resolve(root, file), 'utf8'));
}
writeFileSync(resolve(output, 'THIRD_PARTY_NOTICES.txt'), notices.join('\n'));
writeFileSync(resolve(output, '.nojekyll'), '');
const revision = execFileSync('git', ['rev-parse', sourceRef], { cwd: root, encoding: 'utf8' }).trim();
writeFileSync(resolve(output, 'build-info.json'), JSON.stringify({ revision, repository: process.env.GITHUB_REPOSITORY || null }, null, 2));
console.log(`Packaged Pages site and source.zip from ${revision}.`);
