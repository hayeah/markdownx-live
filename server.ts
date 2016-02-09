import express = require("express");
import * as http from "http";
import * as path from "path";
import * as fs from "fs";

const sockjs = require('sockjs');
const chokidar = require("chokidar");

export default function startServer(markdownFile: string, port: number) {
  if (!fs.existsSync(markdownFile)) {
    exitError(`file doesn't exist: ${markdownFile}`);
  }

  let markdownDir = path.dirname(markdownFile);

  let app = express();

  // app.use(express.static(path.join(process.cwd())));
  app.use(express.static(markdownDir));

  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
  });

  let server = http.createServer(app);

  bindSockJS(markdownFile, server);

  server.listen(port);
}

function bindSockJS(markdownFile: string, server: http.Server) {
  var live = sockjs.createServer({
    sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js'
  });

  live.on('connection', function(conn) {
    // let srcPath = markdownFilepath;
    let watcher = chokidar.watch(markdownFile);

    function sendContent() {
      // let r = fs.createReadStream(markdownFile,"utf8");
      // r.pipe(conn);
      fs.readFile(markdownFile, "utf8", (err, src) => {
        conn.write(src);
      });
    }

    console.log("client connected");

    sendContent();

    watcher.on("change", (path) => {
      sendContent();
    });

    conn.on('close', function() {
      console.log("client closed");
    });
  });

  live.installHandlers(server, { prefix: '/live' });
}

function exitError(err) {
  console.log(err);
  process.exit(1);
}
