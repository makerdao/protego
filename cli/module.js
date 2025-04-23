import { ethers } from "ethers";
import defaults from "./defaults.js";
import { fetchPausePlans as _fetchPausePlansImpl } from "./fetchPausePlans.js";

/**
 * Fetches pause plans
 * @param {string} [options.rpcUrl] Ethereum Node RPC URL
 * @param {number} [options.fromBlock=0] Display spells from a given block
 * @param {"ALL"|"PENDING"|"DROPPED"|"EXECUTED"} [options.status="ALL"] Filter by status
 * @param {string} [options.pauseAddress="0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f"] MCD_PAUSE contract address
 * @returns {Promise<import("./fetchPausePlans").PausePlan[]>}
 */
export async function fetchPausePlans({
    rpcUrl,
    pauseAddress = defaults.MCD_PAUSE_ADDRESS,
    fromBlock = defaults.fromBlock,
    status = defaults.status,
} = {}) {
    const pause = new ethers.Contract(
        pauseAddress,
        defaults.MCD_PAUSE_ABI,
        ethers.getDefaultProvider(rpcUrl),
    );
    return await _fetchPausePlansImpl(pause, { fromBlock, status });
}
