import { AggregateOptions, AutoStartEntry, ScanResult } from "../shared/types";

export function aggregateResults(
	login: ScanResult,
	launchSets: ScanResult[],
	_options?: AggregateOptions
): AutoStartEntry[] {
	const entries: AutoStartEntry[] = [];
	entries.push(...login.entries);
	for (const s of launchSets) entries.push(...s.entries);
	return entries;
}


