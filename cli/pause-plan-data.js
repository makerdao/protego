import { ethers } from 'ethers';

const PLOT_TOPIC = "0x46d2fbbb00000000000000000000000000000000000000000000000000000000";
const EXEC_TOPIC = "0x168ccd6700000000000000000000000000000000000000000000000000000000";
const DROP_TOPIC = "0x162c7de300000000000000000000000000000000000000000000000000000000";

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

export async function getFilteredEvents(contract, fromBlock) {
    try {
        return await contract.queryFilter([[PLOT_TOPIC, EXEC_TOPIC, DROP_TOPIC]], fromBlock);
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

export function prepareData(events, contract, filter) {
    const decodedEvents = events.map(event => processEvent(event, contract));

    const tableData = [];
    const hashMap = new Map();

    decodedEvents.forEach(event => {
        const planHash = event.planHash;

        if (event.topics[0] === PLOT_TOPIC) {
            const row = [event.decoded.guy, planHash, event.decodedCall.usr, event.decodedCall.tag, event.decodedCall.fax.trim(), event.decodedCall.eta, "PENDING"];
            tableData.push(row);
            hashMap.set(planHash, row);
        } else if (event.topics[0] === EXEC_TOPIC) {
            const row = hashMap.get(planHash);
            if (row) {
                row[6] = "EXECUTED";
            }
        } else if (event.topics[0] === DROP_TOPIC) {
            const row = hashMap.get(planHash);
            if (row) {
                row[6] = "DROPPED";
            }
        }
    });

    tableData.sort((a, b) => {
        const etaA = BigInt(a[5]);
        const etaB = BigInt(b[5]);
        return etaB > etaA ? 1 : etaB < etaA ? -1 : 0;
    });

    if (filter)
        return tableData.filter(row => row[6] === filter);
    else
        return tableData;
}
