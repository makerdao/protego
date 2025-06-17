import chalk from "chalk";
import { ethers } from "ethers";
import prompts from "prompts";
import { fetchPausePlans } from "./fetchPausePlans.js";
import defaults from "./defaults.js";
import { ttyOnlySpinner, createJson, formatDate } from "./utils.js";

/**
 * Runs the CLI Encode command
 * @param {object} localOptions Command options (currently unused)
 * @param {import("commander").Command} command Commander command object
 * @returns {Promise<void>}
 */
export async function encode(localOptions, command) {
    const { rpcUrl, fromBlock, pauseAddress } = command.optsWithGlobals();

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

        const plans = await fetchPausePlans(pause, {
            fromBlock,
            status: "PENDING",
        });
        spinner.success("Done!");

        if (plans.length === 0) {
            console.log(chalk.yellow("No pending spells found to encode."));
            process.exit(1);
        }

        const response = await prompts([
            {
                type: "multiselect",
                name: "plans",
                message:
                    "Select spells to be encoded for `drop(Plan[] calldata _plans)`",
                choices: plans.map((plan) => ({
                    title: `hash: ${plan.hash} | guy: ${plan.usr} | usr: ${plan.usr} | eta: ${plan.eta} (${formatDate(plan.eta)})`,
                    value: plan.hash,
                })),
            },
        ]);

        const selectedPlans = plans
            .filter((plan) => response.plans.includes(plan.hash))
            .map((plan) => [plan.usr, plan.tag, plan.fax, plan.eta.toString()]);

        console.log("\n Encoded plans:");
        console.log(chalk.green(createJson(selectedPlans)));
    } catch (error) {
        spinner.error("Failed!");
        console.error(chalk.red("An error occurred:", error));
        process.exit(1);
    }
}
