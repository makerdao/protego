import chalk from "chalk";
import { ethers } from "ethers";
import { table } from "table";
import { fetchPausePlans } from "./fetchPausePlans.js";
import defaults from "./defaults.js";
import { ttyOnlySpinner, createJson } from "./utils.js";

/**
 * Runs the CLI list command
 * @param {object} options Command options
 * @param {string} options.status Filter by status
 * @param {string} options.format Output format
 * @param {import("commander").Command} command Commander command object
 * @returns {Promise<void>}
 */
export async function list({ status, format }, command) {
    const { rpcUrl, fromBlock, pauseAddress } = command.optsWithGlobals();

    if (rpcUrl === defaults.RPC_URL) {
        console.warn(
            chalk.yellow(
                `🟡 WARNING: Falling back to a public provider: ${rpcUrl}. For a better experience, set a custom RPC URL with the --rpc-url <rpc-url> option or the ETH_RPC_URL env variable.`,
            ),
        );
    }

    const spinner = ttyOnlySpinner().start("Fetching pause plans...");

    try {
        const pause = new ethers.Contract(
            pauseAddress,
            defaults.MCD_PAUSE_ABI,
            ethers.getDefaultProvider(rpcUrl),
        );

        const plans = await fetchPausePlans(pause, { fromBlock, status });
        spinner.success("Done!");
        if (plans.length === 0) {
            console.log(chalk.yellow("No records to display."));
            process.exit(1);
        }

        if (format === "TABLE") {
            console.log(createTable(plans));
        } else {
            console.log(createJson(plans, 2));
        }

        process.exit(0);
    } catch (error) {
        spinner.error("Failed!");
        console.error(chalk.red("An error occurred:", error));
        process.exit(1);
    }
}

/**
 * Converts a list of pause plans to a formatted table
 * @param {import("./fetchPausePlans").PausePlan[]} plans
 * @returns {string}
 */
function createTable(plans) {
    const data = [...plans]
        .sort((a, b) => {
            const etaA = BigInt(a.eta);
            const etaB = BigInt(b.eta);
            return etaB > etaA ? 1 : etaB < etaA ? -1 : 0;
        })
        .map((event) => [
            colorize(event.status, event.guy),
            colorize(event.status, event.hash),
            colorize(event.status, event.usr),
            colorize(event.status, event.tag),
            colorize(event.status, event.fax),
            colorize(event.status, event.eta),
            colorize(event.status),
        ]);

    data.unshift(
        ["GUY", "HASH", "USR", "TAG", "FAX", "ETA", "STATUS"].map((item) =>
            chalk.bold.cyan(item),
        ),
    );

    return table(data, {
        columns: {
            0: { width: 21, wrapWord: true },
            1: { width: 33, wrapWord: true },
            2: { width: 21, wrapWord: true },
            3: { width: 33, wrapWord: true },
            4: { width: 10, wrapWord: true },
            5: { width: 10, wrapWord: true },
            6: { width: 10, wrapWord: true },
        },
    });
}

/**
 * Colorizes a status string
 * @param {string} status The status to define the color
 * @param {string} [text=status] The text to colorize
 * @returns {string}
 */
function colorize(status, text = status) {
    switch (status) {
        case "PENDING":
            return chalk.yellow(String(text));
        case "DROPPED":
            return chalk.red(String(text));
        case "EXECUTED":
            return chalk.green(String(text));
        default:
            return status;
    }
}
