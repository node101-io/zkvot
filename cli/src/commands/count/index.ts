import { spawn } from "child_process";

import command from "../../utils/command.js";

command
    .command("count")
    .description("count votes by id")
    .argument("<election-id>", "public key of the vote")
    .option("-r, --mina-rpc <url>", "rpc url of the mina node to fetch the contract state")
    .option("-f, --follow", "follow the counting process")
    .action((election_id, options) => {
        const spawnedProcess = spawn(
            process.execPath,
            [
                `${import.meta.dirname}/command.js`,
                JSON.stringify({
                    election_id: election_id,
                    mina_rpc: options.minaRpc,
                }),
            ],
            {
                detached: !options.follow,
                stdio: options.follow ? "inherit" : "ignore",
            }
        );

        if (!options.follow) spawnedProcess.unref();
    });
