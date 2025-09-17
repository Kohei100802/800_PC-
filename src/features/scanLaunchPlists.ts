import plist from "plist";
import bplist from "bplist-parser";
import { listDirectorySafe, joinPath, statMtimeIso, pathExists, readFileBufferSafe } from "../infra/fs";
import { AutoStartEntry, ScanResult } from "../shared/types";

const USER_AGENT_DIRS = [
	"~/Library/LaunchAgents",
	"/Library/LaunchAgents",
];

const SYSTEM_DAEMON_DIRS = [
	"/Library/LaunchDaemons",
	"/System/Library/LaunchDaemons",
];

function expandHome(p: string): string {
	if (p.startsWith("~")) {
		return p.replace("~", process.env.HOME || "");
	}
	return p;
}

async function scanDir(dirPath: string, source: "launchagent" | "launchdaemon"): Promise<AutoStartEntry[]> {
	const resolved = expandHome(dirPath);
	if (!(await pathExists(resolved))) return [];
	const files = await listDirectorySafe(resolved);
	const entries: AutoStartEntry[] = [];
	for (const file of files) {
		if (!file.endsWith(".plist")) continue;
		const full = joinPath(resolved, file);
		const buf = await readFileBufferSafe(full);
		if (!buf) continue;
		try {
			let data: any;
			if (buf.slice(0, 8).toString() === "bplist00") {
				const arr = bplist.parseBuffer(buf);
				data = Array.isArray(arr) ? arr[0] : arr;
			} else {
				data = plist.parse(buf.toString("utf8"));
			}
			const label: string | undefined = data.Label;
			const program: string | undefined = data.Program;
			const programArguments: string[] | undefined = data.ProgramArguments;
			const runAtLoad: boolean | undefined = data.RunAtLoad;
			const keepAlive: boolean | Record<string, unknown> | undefined = data.KeepAlive;
			entries.push({
				id: `${source}:${label ?? file}`,
				source,
				label,
				program: program ?? null,
				programArguments: programArguments ?? null,
				runAtLoad: runAtLoad ?? null,
				keepAlive: keepAlive ?? null,
				plistPath: full,
				lastModified: await statMtimeIso(full),
				status: "unknown",
			});
		} catch {
			continue;
		}
	}
	return entries;
}

export async function scanLaunchAgentsAndDaemons(): Promise<ScanResult[]> {
	const agents = (
		await Promise.all(USER_AGENT_DIRS.map((d) => scanDir(d, "launchagent")))
	).flat();
	const daemons = (
		await Promise.all(SYSTEM_DAEMON_DIRS.map((d) => scanDir(d, "launchdaemon")))
	).flat();
	return [
		{ source: "launchagent", entries: agents },
		{ source: "launchdaemon", entries: daemons },
	];
}


