import * as core from "@actions/core";
import { ClaRunner } from "./claRunner";
import * as inputHelper from "./inputHelper";

export async function run() {
    try {
        const runner = new ClaRunner({ inputSettings: inputHelper.getInputs() });
        core.info("Starting CLA Assistant GitHub Action");
        await runner.execute();
        core.info("CLA processing complete.");
    } catch (error) {
        core.setFailed(`Error: "${error.message}" Details: "${JSON.stringify(error)}"`);
    }
}
run();
