import command from "../../utils/command.js";

import logs from "./command.js";

command
  .command("logs")
  .description("stream logs of counting processes")
  .argument("<election-id>", "public key of the vote")
  .action(logs);
