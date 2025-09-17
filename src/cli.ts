#!/usr/bin/env node
import { scanLoginItems } from "./features/scanLoginItems";
import { scanLaunchAgentsAndDaemons } from "./features/scanLaunchPlists";
import { aggregateResults } from "./features/aggregate";
import { resolveLaunchStatus } from "./features/resolveStatus";

// Gracefully handle EPIPE when piped to tools like `head`
process.stdout.on("error", (err: any) => {
	if (err && (err.code === "EPIPE" || err.code === "ERR_STREAM_DESTROYED")) {
		try { process.exit(0); } catch {}
	}
});

async function runOnce(asJson: boolean, withStatus: boolean) {
	const login = await scanLoginItems();
	const launch = await scanLaunchAgentsAndDaemons();
	let list = aggregateResults(login, launch, {});
	if (withStatus) list = await resolveLaunchStatus(list);
	if (asJson) {
		process.stdout.write(JSON.stringify(list, null, 2) + "\n");
		return;
	}
	const rows = list.map((e) => [
		(e.source ?? ""),
		(e.label || e.name || ""),
		(e.program || e.path || ""),
		String(e.runAtLoad ?? ""),
		(e.status ?? ""),
		(e.pid ? String(e.pid) : ""),
	]);
	const header = ["source", "label/name", "program/path", "runAtLoad", "status", "pid"];
	const all = [header, ...rows];
	const widths = header.map((_, i) => Math.max(...all.map(r => (r[i] ?? "").length)));
	const lines = all.map(r => r.map((c, i) => (c ?? "").padEnd(widths[i])).join("  "));
	process.stdout.write(lines.join("\n") + "\n");
}

async function main() {
	const args = process.argv.slice(2);
	const asJson = args.includes("--json");
	const withStatus = args.includes("--status");
	const watchIndex = args.indexOf("--watch");
	const intervalSec = watchIndex >= 0 ? Number(args[watchIndex + 1]) || 30 : 0;

	if (intervalSec > 0) {
		// Watch mode: refresh every N seconds
		// eslint-disable-next-line no-constant-condition
		const run = async () => {
			console.clear();
			process.stdout.write(`[${new Date().toLocaleString()}] auto-start entries\n`);
			await runOnce(asJson, withStatus);
		};
		await run();
		const timer = setInterval(run, intervalSec * 1000);
		process.on("SIGINT", () => {
			clearInterval(timer);
			process.stdout.write("\nStopped.\n");
			process.exit(0);
		});
		return;
	}

	await runOnce(asJson, withStatus);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});


