import "babel-polyfill";
import express = require("express");
import * as http from "http";
import * as path from "path";
import * as fs from "fs";

const sockjs = require('sockjs');
const chokidar = require("chokidar");


let markdownFile = process.argv[2];

if (markdownFile == null) {
  exitError(`Please specify a file.`);
}

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

// app.listen(9876);



// var live = sockjs.createServer({ sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js' });
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

server.listen(9876);

function exitError(err) {
  console.log(err);
  process.exit(1);
}
