import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { ethers } from "ethers";
import { fetchPausePlans } from "./fetchPausePlans.js";
import { createTable } from "./createTable.js";
import pauseABI from "./pause_abi.json" with { type: "json" };

const MCD_PAUSE = "0xbE286431454714F511008713973d3B053A2d38f3";

const argv = yargs(hideBin(process.argv))
  .option("status", {
    alias: "s",
    type: "string",
    description: "Filter by status: PENDING, DROPPED, EXECUTED or ALL",
    choices: ["PENDING", "DROPPED", "EXECUTED", "ALL"],
    default: "ALL",
  })
  .option("from-block", {
    alias: "b",
    type: "number",
    description: "Display spells from a given block",
    default: 0,
  })
  .option("rpc-url", {
    alias: ["fork-url", "f"],
    type: "string",
    description:
      "RPC URL - Falls back to `ETH_RPC_URL` env var, then to a public provider",
    default: process.env.ETH_RPC_URL || "mainnet",
  })
  .help(true)
  .alias("help", "h").argv;

async function main() {
  try {
    if (argv.rpcUrl == "mainnet") {
      console.warn(
        "Falling back to a public provider. For best experience set a custom RPC URL.",
      );
    }

    const pause = new ethers.Contract(
      MCD_PAUSE,
      pauseABI,
      ethers.getDefaultProvider(argv.rpcUrl),
    );    

    const events = await fetchPausePlans(pause, {
      fromBlock: argv.fromBlock,
      status: argv.status,
    });

    const table = createTable(events);

    console.log(table);
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

main();
