import * as core from "@actions/core";
import { context, getOctokit } from "@actions/github";

async function run(): Promise<void> {
  try {
    console.log("STARTING action...");

    const token = core.getInput("token");
    console.log("token", token);
    const octokit = getOctokit(token);

    // Debug log the payload.
    core.debug(`Payload keys: ${Object.keys(context.payload)}`);

    // Get event name.
    const eventName = context.eventName;
    core.debug(`eventName: ${eventName}`);

    //
    //
    // // `who-to-greet` input defined in action metadata file
    // const nameToGreet = core.getInput("who-to-greet");
    // console.log(`Hello ${nameToGreet}!`);
    // const time = new Date().toTimeString();
    // core.setOutput("time", time);
    // // Get the JSON webhook payload for the event that triggered the workflow
    // const payload = JSON.stringify(context.payload, undefined, 2);
    // console.log(`The event payload: ${payload}`);
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();
