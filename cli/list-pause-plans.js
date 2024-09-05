import { ethers } from 'ethers';
import { table } from 'table';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import pauseABI from './pause_abi.json' with { type: 'json' };
import { getFilteredEvents, prepareData } from "./pause-plan-data.js";

const argv = yargs(hideBin(process.argv))
    .option('pending', {
        alias: 'p',
        type: 'boolean',
        description: 'Show only pending plans',
        default: false
    })
    .option('from-block', {
        alias: 'b',
        type: 'number',
        description: 'Display spells from a given block',
        default: 0
    })
    .option('eth-rpc-url', {
        alias: 'e',
        type: 'string',
        description: 'Rpc URL - Falls back to ETH_RPC_URL env var, then to a public provider',
        default: 0
    })
    .help(true)
    .alias('help', 'h')
    .argv;

const MCD_PAUSE = "0xbE286431454714F511008713973d3B053A2d38f3";

const tableConfig = {
    columns: {
        0: { width: 21, wrapWord: true },
        1: { width: 33, wrapWord: true },
        2: { width: 21, wrapWord: true },
        3: { width: 33, wrapWord: true },
        4: { width: 10, wrapWord: true },
        5: { width: 10, wrapWord: true },
        6: { width: 10, wrapWord: true }
    }
};

function getProvider() {
    const url = argv.ethRpcUrl || process.env.ETH_RPC_URL || "mainnet";
    if (url == "mainnet") {
        console.warn("Falling back to a public provider. For best experience set a custom RPC URL.");
    }
    return ethers.getDefaultProvider(url);
}

async function main() {
    try {
        const provider = getProvider();
        const pause = new ethers.Contract(MCD_PAUSE, pauseABI, provider);

        const events = await getFilteredEvents(pause, argv.fromBlock);
        let tableData = prepareData(events, pause, argv.pending ? "PENDING" : null);

        tableData.unshift(["SPELL", "HASH", "USR", "TAG", "FAX", "ETA", "STATUS"]);

        if (tableData.length === 1) {
            console.log("No records to display.");
        } else {
            console.log(table(tableData, tableConfig));
        }
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

main();
