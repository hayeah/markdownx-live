const yargs = require("yargs");
const detectPort = require("detect-port");
const opn = require("opn");

import startServer from  "./server";

const PORT_START = 8000;

interface ArgV {
  port: number,
  _: string[],
}

const cli = yargs
  .options({
    port: {
      alias: "p",
      type: 'number',
      default: undefined,
      describe: "port number"
    }
  })
  .require(1)
  .help('h')
  .alias('h', 'help')
  .example("$0 [file]","start live edit server");



async function main() {
  const argv: ArgV = cli.argv;
  const markdownFile = argv._[0];

  try {
    let port = await getPort(argv);

    let app = startServer(markdownFile, port);

    app.listen(port, (err) => {
      if(err) {
        exitError(err);
      }

      opn(`http://localhost:${port}`);

      console.log("Server listening on", port);

    });
  } catch(err) {
    exitError(err);
  }
}

async function getPort(argv: ArgV): Promise<number> {
  let port: number = argv.port || (process.env.PORT && parseInt(process.env.PORT));

  if(port) {
    return port;
  }

  console.log("look for port");


  return await detectPort(PORT_START);
}

function exitError(err) {
  console.log(err);
  process.exit(1);
}

main();