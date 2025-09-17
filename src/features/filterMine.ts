import { AutoStartEntry } from "../shared/types";
import { MineFilterConfig } from "../shared/config";

function startsWithAny(value: string, prefixes: string[]): boolean {
	for (const p of prefixes) {
		if (!p) continue;
		if (value.startsWith(p)) return true;
	}
	return false;
}

export function filterMine(entries: AutoStartEntry[], cfg: MineFilterConfig): AutoStartEntry[] {
	return entries.filter((e) => {
		const labelOrName = (e.label || e.name || "").toLowerCase();
		const programOrPath = (e.program || e.path || "").toLowerCase();
		const labelHit = startsWithAny(labelOrName, cfg.labelPrefixes.map(s => s.toLowerCase()));
		const pathHit = startsWithAny(programOrPath, cfg.pathPrefixes.map(s => s.toLowerCase()));
		return labelHit || pathHit;
	});
}


