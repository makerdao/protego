import { ethers } from 'ethers';
import pauseABI from './pause_abi.json' with { type: 'json' };

const MCD_PAUSE = "0xbE286431454714F511008713973d3B053A2d38f3";
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

async function fetchEvents(contract, fromBlock) {
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

function parseEvents(events, contract) {
    const decodedEvents = events.map(event => processEvent(event, contract));

    const eventsList = [];
    const hashMap = new Map();

    decodedEvents.forEach(event => {
        const planHash = event.planHash;

        if (event.topics[0] === PLOT_TOPIC) {
            const item = {
                hash: planHash,
                guy: event.decoded.guy,
                usr: event.decodedCall.usr,
                tag: event.decodedCall.tag,
                fax: event.decodedCall.fax.trim(),
                eta: event.decodedCall.eta,
                status: "PENDING"
            }
            eventsList.push(item)
            hashMap.set(planHash, item);
        } else if (event.topics[0] === EXEC_TOPIC) {
            const item = hashMap.get(planHash);
            if (item) {
                item.status = "EXECUTED";
            }
        } else if (event.topics[0] === DROP_TOPIC) {
            const item = hashMap.get(planHash);
            if (item) {
                item.status = "DROPPED";
            }
        }
    });

    return eventsList;
}

export async function fetchAndParseEvents(rpcUrl, fromBlock) {
    const pause = new ethers.Contract(MCD_PAUSE, pauseABI, ethers.getDefaultProvider(rpcUrl));
    const events = await fetchEvents(pause, fromBlock);
    return parseEvents(events, pause);
}
