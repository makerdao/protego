import { ethers } from 'ethers';
import { table } from 'table';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import pauseABI from './pause_abi.json' with { type: 'json' };

const argv = yargs(hideBin(process.argv))
    .option('all', {
        alias: 'a',
        type: 'boolean',
        description: 'Show all plans',
        default: false
    })
    .option('pending', {
        alias: 'p',
        type: 'boolean',
        description: 'Show only pending plans',
        default: false
    })
    .check(argv => {
        if (argv.all && argv.pending) {
            throw new Error("You cannot use --all and --pending together.");
        }
        return true;
    })
    .help()
    .alias('help', 'h')
    .argv;

const PLOT_TOPIC = "0x46d2fbbb00000000000000000000000000000000000000000000000000000000";
const EXEC_TOPIC = "0x168ccd6700000000000000000000000000000000000000000000000000000000";
const DROP_TOPIC = "0x162c7de300000000000000000000000000000000000000000000000000000000";
const MCD_PAUSE = "0xbE286431454714F511008713973d3B053A2d38f3";

const tableConfig = {
    columns: {
        0: { width: 66, wrapWord: true },
        1: { width: 42, wrapWord: true },
        2: { width: 66, wrapWord: true },
        3: { width: 33, wrapWord: true },
        4: { width: 10, wrapWord: true },
        5: { width: 10, wrapWord: true },
        6: { width: 10, wrapWord: true }
    }
};

function getProvider() {
    const url = process.env.ETH_RPC_URL || "mainnet";
    if (!process.env.ETH_RPC_URL) {
        console.warn("ETH_RPC_URL not set, falling back to a public RPC provider. For improved results set ETH_RPC_URL to a trusted node.");
    }
    return ethers.getDefaultProvider(url);
}

function decodeLogNote(log, contract) {
    const eventFragment = contract.interface.getEvent('LogNote');
    return contract.interface.decodeEventLog(eventFragment, log.data, log.topics).toObject();
}

function decodeCallParams(sig, fax, contract) {
    const functionFragment = contract.interface.getFunction(sig);
    return contract.interface.decodeFunctionData(functionFragment, fax).toObject();
}

function hash(params) {
    const abiCoder = new ethers.AbiCoder();
    const types = ["address", "bytes32", "bytes", "uint256"];
    const encoded = abiCoder.encode(types, [params.usr, params.tag, params.fax, params.eta]);
    return ethers.keccak256(encoded);
}

async function getFilteredEvents(contract) {
    try {
        const events = await contract.queryFilter('*');
        return events.filter(log => [PLOT_TOPIC, EXEC_TOPIC, DROP_TOPIC].includes(log.topics[0]));
    } catch (error) {
        console.error("Error fetching filtered events:", error);
        throw error;
    }
}

function processEvent(event, contract) {
    const decoded = decodeLogNote(event, contract);
    const decodedCall = decodeCallParams(event.topics[0].slice(0, 10), decoded.fax, contract);
    return {
        ...event,
        decoded,
        decodedCall,
        planHash: hash(decodedCall)
    };
}

function prepareTableData(events, contract) {
    const decodedEvents = events.map(event => processEvent(event, contract));

    let tableData = [["HASH", "USR", "TAG", "FAX", "ETA", "STATUS"]];
    const hashMap = new Map();

    decodedEvents.forEach(event => {
        const planHash = event.planHash;

        if (event.topics[0] === PLOT_TOPIC) {
            const row = [planHash, event.decodedCall.usr, event.decodedCall.tag, event.decodedCall.fax.trim(), event.decodedCall.eta, "PENDING"];
            tableData.push(row);
            hashMap.set(planHash, row);
        } else if (event.topics[0] === EXEC_TOPIC) {
            const row = hashMap.get(planHash);
            if (row) {
                row[5] = "EXECUTED";
            }
        } else if (event.topics[0] === DROP_TOPIC) {
            const row = hashMap.get(planHash);
            if (row) {
                row[5] = "DROPPED";
            }
        }
    });

    return tableData;
}

async function main() {
    try {
        const provider = getProvider();
        const pause = new ethers.Contract(MCD_PAUSE, pauseABI, provider);

        const events = await getFilteredEvents(pause);
        let tableData = prepareTableData(events, pause);

        if (!argv.all && !argv.pending) {
            tableData = tableData.length > 21 ? [tableData[0], ...tableData.slice(-20)] : tableData;
        } else if (argv.pending) {
            tableData = tableData.filter(row => row[6] === "pending" || row[0] === "HASH");
        }

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
