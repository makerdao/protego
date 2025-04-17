import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { ethers } from "ethers";
import { table } from "table";
import { fetchPausePlans } from "./fetchPausePlans.js";
import defaults from "./defaults.js";

const argv = yargs(hideBin(process.argv))
  .option("pause-address", {
    type: "string",
    description: "MCD_PAUSE contract address",
    default: defaults.MCD_PAUSE_ADDRESS,
  })
  .option("status", {
    alias: "s",
    type: "string",
    description: "Filter by status: PENDING, DROPPED, EXECUTED or ALL",
    choices: ["PENDING", "DROPPED", "EXECUTED", "ALL"],
    default: defaults.STATUS,
  })
  .option("from-block", {
    alias: "b",
    type: "number",
    description: "Display spells from a given block",
    default: defaults.FROM_BLOCK,
  })
  .option("rpc-url", {
    alias: ["fork-url", "f"],
    type: "string",
    description:
      "RPC URL - Falls back to `ETH_RPC_URL` env var, then to a public provider",
    default: process.env.ETH_RPC_URL || defaults.ETH_RPC_URL,
  })
  .help(true)
  .alias("help", "h").argv;

const tableConfig = {
  columns: {
    0: { width: 21, wrapWord: true },
    1: { width: 33, wrapWord: true },
    2: { width: 21, wrapWord: true },
    3: { width: 33, wrapWord: true },
    4: { width: 10, wrapWord: true },
    5: { width: 10, wrapWord: true },
    6: { width: 10, wrapWord: true },
  },
};

function createTable(events) {
  let tableData = events.map((event) => [
    event.guy,
    event.hash,
    event.usr,
    event.tag,
    event.fax,
    event.eta,
    event.status,
  ]);

  tableData.sort((a, b) => {
    const etaA = BigInt(a[5]);
    const etaB = BigInt(b[5]);
    return etaB > etaA ? 1 : etaB < etaA ? -1 : 0;
  });

  if (tableData.length === 0) {
    return "No records to display.";
  }

  tableData.unshift(["SPELL", "HASH", "USR", "TAG", "FAX", "ETA", "STATUS"]);

  return table(tableData, tableConfig);
}

async function main() {
  try {
    if (argv.rpcUrl == "mainnet") {
      console.warn(
        "Falling back to a public provider. For best experience set a custom RPC URL.",
      );
    }

    const pause = new ethers.Contract(
      argv.pauseAddress,
      defaults.MCD_PAUSE_ABI,
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
