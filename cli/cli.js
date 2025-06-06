#!/usr/bin/env node

import { Command, Option } from "commander";
import chalk from "chalk";
import yoctoSpinner from "yocto-spinner";
import figlet from "figlet";
import { ethers } from "ethers";
import { table } from "table";
import prompts from "prompts";
import { fetchPausePlans } from "./fetchPausePlans.js";
import defaults from "./defaults.js";
import p from "./package.json" with { type: "json" };

const program = new Command();

program
    .storeOptionsAsProperties(false)
    .name("Protego CLI")
    .description(figlet.textSync("Protego", { horizontalLayout: "full" }))
    .version(p.version)
    .addOption(
        new Option("-r, --rpc-url <rpc-url>", "Ethereum Node RPC URL")
            .env("ETH_RPC_URL")
            .default(defaults.RPC_URL),
    )
    .addOption(
        new Option(
            "-b, --from-block <block-number>",
            "Display spells from a given block",
        )
            .argParser(Number.parseInt)
            .default(defaults.FROM_BLOCK),
    )
    .addOption(
        new Option("-s, --status <status>", "Filter by status")
            .choices(["PENDING", "DROPPED", "EXECUTED", "ALL"])
            .default(defaults.STATUS),
    )
    .addOption(
        new Option(
            "--pause-address <address>",
            "MCD_PAUSE contract address",
        ).default(defaults.MCD_PAUSE_ADDRESS),
    )
    .addOption(
        new Option("-f, --format <format>", "Output format")
            .choices(["TABLE", "JSON"])
            .default(defaults.FORMAT),
    )
    .showHelpAfterError()
    .action(run)
    .addCommand(
        new Command("encode")
            .description(
                "Encode calldata to cancel Spells (Etherscan/Tenderly input)",
            )
            .action(encode),
    );

program.parse();

/**
 * Runs the CLI
 * @param {string} options.rpcUrl Ethereum Node RPC URL
 * @param {number} options.fromBlock Display spells from a given block
 * @param {"ALL"|"PENDING"|"DROPPED"|"EXECUTED"} options.status Filter by status
 * @param {string} options.pauseAddress MCD_PAUSE contract address
 * @returns {Promise<void>}
 */
async function run({ rpcUrl, fromBlock, status, pauseAddress, format }) {
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

        if (format === "TABLE") {
            console.log(createTable(plans));
        } else {
            console.log(createJson(plans));
        }

        process.exit(0);
    } catch (error) {
        spinner.error("Failed!");
        console.error(chalk.red("An error occurred:", error));
        process.exit(1);
    }
}

/**
 * Creates a spinner that only shows if stdout is a TTY
 * @param {...any} args
 * @returns {import("yocto-spinner").Spinner}
 */
function ttyOnlySpinner(...args) {
    // Only show a spinner if stdout is a TTY
    if (process.stdout.isTTY) {
        return yoctoSpinner(...args);
    }

    // If not a TTY, return a dummy spinner with empty chainable methods
    return {
        start() {
            return this;
        },
        success() {
            return this;
        },
        error() {
            return this;
        },
    };
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

    if (data.length === 0) {
        return "No records to display.";
    }

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

/**
 * Converts a list of pause plans to a JSON string
 * @param {import("./fetchPausePlans").PausePlan[]} plans
 * @returns {string}
 */
function createJson(plans) {
    return JSON.stringify(
        plans,
        (_, v) => (typeof v === "bigint" ? v.toString() : v),
        2,
    );
}

/**
 * Runs the CLI Encode command
 * @param {object} localOptions
 * @param {Command} command
 * @returns {Promise<void>}
 */
async function encode(localOptions, command) {
    const globalParentOptions = command.parent.opts();
    const { rpcUrl, fromBlock, pauseAddress } = globalParentOptions;

    if (rpcUrl === defaults.RPC_URL) {
        console.warn(
            chalk.yellow(
                `🟡 WARNING: Falling back to a public provider: ${rpcUrl}. For a better experience, set a custom RPC URL with the --rpc-url <rpc-url> option or the ETH_RPC_URL env variable.`,
            ),
        );
    }

    const spinner = ttyOnlySpinner().start("Fetching pending pause plans...");

    try {
        const pause = new ethers.Contract(
            pauseAddress,
            defaults.MCD_PAUSE_ABI,
            ethers.getDefaultProvider(rpcUrl),
        );

        const status = "PENDING";
        const plans = await fetchPausePlans(pause, { fromBlock, status });
        spinner.success("Done!");

        if (plans.length === 0) {
            console.log(chalk.yellow("No pending spells found to encode."));
            return;
        }

        const response = await prompts([
            {
                type: "multiselect",
                name: "plans",
                message:
                    "Select spells to be encoded for `drop(Plan[] calldata _plans)`",
                choices: plans.map((plan) => ({
                    title: `hash: ${plan.hash} | usr: ${plan.usr} | eta: ${plan.eta}`,
                    value: plan.hash,
                })),
            },
        ]);

        const selectedPlans = plans
            .filter((plan) => response.plans.includes(plan.hash))
            .map((plan) => [plan.usr, plan.tag, plan.fax, plan.eta.toString()]);

        console.log("\n Encoded plans:");
        console.log(chalk.green(JSON.stringify(selectedPlans)));
    } catch (error) {
        spinner.error("Failed!");
        console.error(chalk.red("An error occurred:", error));
        process.exit(1);
    }
}
