import pauseABI from "./pause-abi.json" with { type: "json" };

export default {
    MCD_PAUSE_ADDRESS: "0xbE286431454714F511008713973d3B053A2d38f3",
    MCD_PAUSE_ABI: pauseABI,
    // Use the default provider from ethers
    ETH_RPC_URL: "mainnet",
    FROM_BLOCK: 0,
    STATUS: "ALL",
    FORMAT: "TABLE",
};
