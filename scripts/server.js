import http from "node:http";
import { WebSocketServer } from "ws";
import fs from "node:fs";
import path from "node:path";


const createAppServer = (port, appUrl) => {
  const server = http.createServer((req, res) => {
    try {
      if (req.url.startsWith('/.well-known')) {
        return;
      }

      const filePath = path.normalize(path.join(process.cwd(), req.url == '/' ? '/index.html' : req.url));

      let fileContent = fs.readFileSync(filePath);

      if (req.url.endsWith('.svg')) {
        res.setHeader('Content-Type', 'image/svg+xml');
      }

      res.writeHead(200);
      res.end(fileContent);
    } catch (error) {
      console.log('\n');
      console.error(error);
      console.log('\n');

      res.writeHead(500);
      res.end(JSON.stringify(error));
    }
  });

  server.listen(port, () => {
    console.log(`Server started ${appUrl}\n`);
  });
}


const createWsServer = (port) => {
  const wsServer = new WebSocketServer({port: port});

  return {
    reloadClient: () => {
      wsServer.clients.forEach((client) => {
        if (client.readyState === 1) {
          // console.log('Notify the client to reload the page');
          client.send('RELOAD');
        }
      });
    }
  }
}

export { createAppServer, createWsServer }
