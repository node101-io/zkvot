import { parse } from 'url'
import { createServer } from 'http'
import { parentPort } from 'worker_threads';
import next from 'next';

const DEV = process.env.DEV === 'true';
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 10101;

const nextApp = next({
  dev: DEV,
  dir: DEV ? './' : process.env.NEXT_APP_DIR
});
const handle = nextApp.getRequestHandler();

nextApp.prepare()
  .then(() => {
    createServer((req, res) => {
      const parsedUrl = parse(req.url!, true)
      handle(req, res, parsedUrl)
    }).listen(PORT)

    if (parentPort) parentPort.postMessage(`> next frontend - http://localhost:${PORT}`);
  });
