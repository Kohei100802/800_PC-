import { AutoStartEntry } from "../shared/types";
import { listLaunchctl } from "../infra/macos";

interface LaunchctlRow {
	pid: number | null;
	statusCode: number | null;
	label: string;
}

function parseLaunchctlList(output: string): Map<string, LaunchctlRow> {
	const map = new Map<string, LaunchctlRow>();
	const lines = output.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
	for (const line of lines) {
		// Expected columns: PID	Status	Label (whitespace separated)
		const parts = line.split(/\s+/);
		if (parts.length < 3) continue;
		const pidNum = Number(parts[0]);
		const statusNum = Number(parts[1]);
		const label = parts.slice(2).join(" ");
		if (!label || label === "Label") continue; // skip header
		map.set(label, {
			pid: Number.isFinite(pidNum) ? pidNum : null,
			statusCode: Number.isFinite(statusNum) ? statusNum : null,
			label,
		});
	}
	return map;
}

export async function resolveLaunchStatus(entries: AutoStartEntry[]): Promise<AutoStartEntry[]> {
	const raw = await listLaunchctl().catch(() => "");
	if (!raw) return entries;
	const map = parseLaunchctlList(raw);
	return entries.map((e) => {
		if (!e.label) return e;
		const row = map.get(e.label);
		if (!row) return e;
		return {
			...e,
			status: row.pid && row.pid > 0 ? "loaded" : "not_loaded",
			pid: row.pid ?? null,
		};
	});
}


