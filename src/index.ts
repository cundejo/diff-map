import * as core from "@actions/core";
import { context, getOctokit } from "@actions/github";

type FileStatus = "added" | "modified" | "removed" | "renamed";

async function run(): Promise<void> {
  try {
    console.log("STARTING action...");

    const token = core.getInput("token");
    console.log("token", token);
    const octokit = getOctokit(token);

    // Debug log the payload.
    // core.debug(`Payload keys: ${Object.keys(context.payload)}`);
    console.log("Payload keys:", Object.keys(context.payload));

    // Get event name.
    const eventName = context.eventName;
    console.log("eventName", eventName);

    // Define the base and head commits to be extracted from the payload.
    let base: string | undefined;
    let head: string | undefined;

    switch (eventName) {
      case "pull_request":
        base = context.payload.pull_request?.base?.sha;
        head = context.payload.pull_request?.head?.sha;
        break;
      case "push":
        base = context.payload.before;
        head = context.payload.after;
        break;
      default:
        core.setFailed(
          `This action only supports pull requests and pushes, ${context.eventName} events are not supported. 
          Please submit an issue on this action's GitHub repo if you believe this is incorrect.`
        );
    }

    // Log the base and head commits
    core.info(`Base commit: ${base}`);
    console.log("Base commit:", base);
    core.info(`Head commit: ${head}`);
    console.log("Head commit:", head);

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
