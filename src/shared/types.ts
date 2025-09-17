export type AutoStartSource = "loginitem" | "launchagent" | "launchdaemon";

export interface AutoStartEntry {
	id: string;
	source: AutoStartSource;
	label?: string;
	name?: string;
	path?: string | null;
	program?: string | null;
	programArguments?: string[] | null;
	runAtLoad?: boolean | null;
	keepAlive?: boolean | Record<string, unknown> | null;
	disabled?: boolean | null;
	plistPath?: string | null;
	user?: string | null;
	status?: "loaded" | "not_loaded" | "unknown";
	pid?: number | null;
	lastModified?: string | null; // ISO string
}

export interface ScanResult {
	source: AutoStartSource;
	entries: AutoStartEntry[];
}

export interface AggregateOptions {
	includeSystem?: boolean;
	includeUser?: boolean;
	resolveStatus?: boolean;
}


