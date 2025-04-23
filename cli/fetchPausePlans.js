import { ethers } from "ethers";

const PLOT_TOPIC =
    "0x46d2fbbb00000000000000000000000000000000000000000000000000000000";
const EXEC_TOPIC =
    "0x168ccd6700000000000000000000000000000000000000000000000000000000";
const DROP_TOPIC =
    "0x162c7de300000000000000000000000000000000000000000000000000000000";

/**
 * Decodes a LogNote event
 * @param {import("ethers/contract").UndecodedEventLog} log
 * @param {import("ethers/contract").Contract} contract
 * @returns {object}
 */
export function decodeLogNote(log, contract) {
    const eventFragment = contract.interface.getEvent("LogNote");
    return contract.interface
        .decodeEventLog(eventFragment, log.data, log.topics)
        .toObject();
}

/**
 * Decodes a call
 * @param {string} sig
 * @param {string} fax
 * @param {import("ethers/contract").Contract} contract
 * @returns {object}
 */
export function decodeCallParams(sig, fax, contract) {
    const functionFragment = contract.interface.getFunction(sig);
    return contract.interface
        .decodeFunctionData(functionFragment, fax)
        .toObject();
}

/**
 * Hashes a pause plan
 * @param {string} params.usr Pause plan user
 * @param {string} params.tag Pause plan tag
 * @param {string} params.fax Pause plan fax
 * @param {string|bigint} params.eta Paule plan ETA
 * @returns {string}
 */
export function hash(params) {
    const abiCoder = new ethers.AbiCoder();
    const types = ["address", "bytes32", "bytes", "uint256"];
    const encoded = abiCoder.encode(types, [
        params.usr,
        params.tag,
        params.fax,
        params.eta,
    ]);
    return ethers.keccak256(encoded);
}

/**
 * Fetches events from the Pause contract
 * @param {number} fromBlock Fetches events from a given block
 * @param {import("ethers/contract").Contract} contract The Pause contract instance
 * @returns {Promise<object[]>}
 */
async function fetchEvents(fromBlock, contract) {
    return await contract.queryFilter(
        [[PLOT_TOPIC, EXEC_TOPIC, DROP_TOPIC]],
        fromBlock,
    );
}

/**
 * Processes an event
 * @param {import("ethers/contract").UndecodedEventLog} event
 * @param {import("ethers/contract").Contract} contract
 * @returns {object}
 */
export function processEvent(event, contract) {
    const decoded = decodeLogNote(event, contract);
    const decodedCall = decodeCallParams(
        event.topics[0].slice(0, 10),
        decoded.fax,
        contract,
    );
    return {
        ...event,
        decoded,
        decodedCall,
        planHash: hash(decodedCall),
    };
}

/**
 * @typedef {object} PausePlan
 * @property {string} hash
 * @property {string} guy
 * @property {string} usr
 * @property {string} tag
 * @property {string} fax
 * @property {string|bigint} eta
 * @property {"ALL"|"PENDING"|"DROPPED"|"EXECUTED"} status
 */

/**
 * Parses the fetched Pause events
 * @param {import("ethers/contract").UndecodedEventLog[]} events
 * @param {"ALL"|"PENDING"|"DROPPED"|"EXECUTED"} status
 * @param {import("ethers/contract").Contract} contract
 * @returns {PausePlan[]}
 */
function parseEvents(events, status, contract) {
    const decodedEvents = events.map((event) => processEvent(event, contract));
    const hashMap = new Map();

    decodedEvents.forEach((event) => {
        const planHash = event.planHash;

        if (!hashMap.has(planHash)) {
            hashMap.set(planHash, {
                hash: planHash,
                guy: event.decoded.guy,
                usr: event.decodedCall.usr,
                tag: event.decodedCall.tag,
                fax: event.decodedCall.fax.trim(),
                eta: event.decodedCall.eta,
                status: "",
            });
        }

        if (event.topics[0] === PLOT_TOPIC) {
            hashMap.get(planHash).status = "PENDING";
        } else if (event.topics[0] === EXEC_TOPIC) {
            hashMap.get(planHash).status = "EXECUTED";
        } else if (event.topics[0] === DROP_TOPIC) {
            hashMap.get(planHash).status = "DROPPED";
        }
    });

    const eventsList = [];
    for (const item of hashMap.values()) {
        if (status === "ALL" || item.status === status) {
            eventsList.push(item);
        }
    }

    return eventsList;
}

/**
 * Fetches pause plans
 * @param {import("ethers/contract").Contract} contractInstance The Pause contract instance
 * @param {number} [options.fromBlock=0] Display spells from a given block
 * @param {"ALL"|"PENDING"|"DROPPED"|"EXECUTED"} [options.status="ALL"] Filter by status
 * @return {Promise<PausePlan[]>}
 */
export async function fetchPausePlans(
    contractInstance,
    { fromBlock = 0, status = "ALL" } = {},
) {
    const events = await fetchEvents(fromBlock, contractInstance);
    return parseEvents(events, status, contractInstance);
}
