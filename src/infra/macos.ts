import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export async function getCurrentUser(): Promise<string> {
	const { stdout } = await execFileAsync("whoami");
	return stdout.trim();
}

export async function runPlistBuddy(args: string[]): Promise<string> {
	const { stdout } = await execFileAsync("/usr/libexec/PlistBuddy", args);
	return stdout.trim();
}

export async function runDefaults(args: string[]): Promise<string> {
	const { stdout } = await execFileAsync("defaults", args);
	return stdout.trim();
}

export async function listLaunchctl(): Promise<string> {
	const { stdout } = await execFileAsync("launchctl", ["list"]);
	return stdout;
}

export async function osaJxa(script: string): Promise<string> {
	const { stdout } = await execFileAsync("osascript", ["-l", "JavaScript", "-e", script]);
	return stdout.trim();
}


