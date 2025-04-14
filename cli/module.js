import { ethers } from "ethers";
import defaults from "./defaults.js";
import { fetchPausePlans as _fetchPausePlansImpl } from "./fetchPausePlans.js";

export async function fetchPausePlans(
  {
    rpcUrl = defaults.ETH_RPC_URL,
    pauseAddress = defaults.MCD_PAUSE_ADDRESS,
    fromBlock = defaults.fromBlock,
    status = defaults.status,
  } = {
    rpcUrl: defaults.ETH_RPC_URL,
    pauseAddress: defaults.MCD_PAUSE_ADDRESS,
    fromBlock: defaults.fromBlock,
    status: defaults.status,
  },
) {
  const pause = new ethers.Contract(
    pauseAddress,
    defaults.MCD_PAUSE_ABI,
    ethers.getDefaultProvider(rpcUrl),
  );
  return await _fetchPausePlansImpl(pause, { fromBlock, status });
}
