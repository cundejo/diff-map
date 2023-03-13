import * as core from "@actions/core";
import { context, getOctokit } from "@actions/github";

type FileStatus = "added" | "modified" | "removed" | "renamed";

async function run(): Promise<void> {
  try {
    console.log("STARTING ACTION...");

    const token = core.getInput("token");
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
    core.info(`Head commit: ${head}`);
    console.log("context.repo.owner", context.repo.owner);
    console.log("context.repo.repo", context.repo.repo);

    // Ensure that the base and head properties are set on the payload.
    if (!base || !head) {
      core.setFailed(
        `The base and head commits are missing from the payload for this ${context.eventName} event. ` +
          "Please submit an issue on this action's GitHub repo."
      );
    }

    // Use GitHub's compare two commits API.
    // https://developer.github.com/v3/repos/commits/#compare-two-commits
    const response = await octokit.request(
      "GET /repos/{owner}/{repo}/compare/{basehead}",
      {
        owner: context.repo.owner,
        repo: context.repo.repo,
        basehead: `${base}...${head}`,
        headers: { "X-GitHub-Api-Version": "2022-11-28" },
      }
    );

    // Ensure that the request was successful.
    if (response.status !== 200) {
      core.setFailed(
        `The GitHub API for comparing the base and head commits for this ${context.eventName} event returned ${response.status}, expected 200. 
          Please submit an issue on this action's GitHub repo.`
      );
    }

    // Ensure that the head commit is ahead of the base commit.
    if (response.data.status !== "ahead") {
      core.setFailed(
        `The head commit for this ${context.eventName} event is not ahead of the base commit. 
        Please submit an issue on this action's GitHub repo.`
      );
    }

    // Get the changed files from the response payload.
    const files = response.data.files;
    console.log("files", files);

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
