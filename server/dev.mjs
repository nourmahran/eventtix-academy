import { fork, spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);
const api = fork(fileURLToPath(new URL('./index.mjs', import.meta.url)), [], { cwd: root, stdio: ['inherit', 'inherit', 'inherit', 'ipc'], windowsHide: true });
let web; let stopping = false;
function stop(code = 0) {
  if (stopping) return; stopping = true;
  api.kill(); web?.kill();
  // Both children are Node processes; no shell or detached process is spawned.
  setTimeout(() => process.exit(code), 200).unref();
}
api.once('message', message => {
  if (message !== 'ready' || stopping) return;
  web = spawn(process.execPath, [require.resolve('@angular/cli/bin/ng.js'), 'serve', '--host', '127.0.0.1', ...process.argv.slice(2)], { cwd: root, stdio: 'inherit', windowsHide: true });
  web.on('error', () => { console.error('Angular could not start. Run npm ci first.'); stop(1); });
  web.on('exit', code => stop(code ?? 1));
});
api.on('error', () => { console.error('Chat backend could not start.'); stop(1); });
api.on('exit', code => stop(code ?? 1));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => stop());
