import { AutoStartEntry, ScanResult } from "../shared/types";
import { osaJxa } from "../infra/macos";

// Use JXA to read macOS Login Items for all userspace (current user)
export async function scanLoginItems(): Promise<ScanResult> {
	// JXA script outputs JSON array of { name, path }
	const jxa = String.raw`
		(function() {
			ObjC.import('Foundation');
			const se = Application('System Events');
			const items = se.loginItems().map(li => ({
				name: li.name(),
				path: (function(p){ try { return p() } catch(e){ return null } })(li.path)
			}));
			return JSON.stringify(items);
		})();
	`;
	const out = await osaJxa(jxa);
	let parsed: Array<{ name?: string; path?: string | null }> = [];
	try {
		parsed = JSON.parse(out || "[]");
	} catch {
		parsed = [];
	}
	const entries: AutoStartEntry[] = parsed.map((p, idx) => ({
		id: `loginitem:${idx}:${p.name ?? "unknown"}`,
		source: "loginitem",
		name: p.name,
		path: p.path ?? null,
		runAtLoad: true,
		status: "unknown",
	}));
	return { source: "loginitem", entries };
}


