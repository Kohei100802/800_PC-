import path from "path";
import { readFileSafe } from "../infra/fs";

export interface MineFilterConfig {
	labelPrefixes: string[];
	pathPrefixes: string[];
}

const DEFAULT_CONFIG: MineFilterConfig = {
	labelPrefixes: ["com.kohei.", "com.daruma.", "com.birthbuddy."],
	pathPrefixes: [
		process.env.HOME ? path.join(process.env.HOME, "ローカルフォルダ") : "",
		process.env.HOME || "",
	],
};

export async function loadMineConfig(): Promise<MineFilterConfig> {
	try {
		const filePath = path.join(process.cwd(), "mine.config.json");
		const content = await readFileSafe(filePath);
		if (!content) return DEFAULT_CONFIG;
		const parsed = JSON.parse(content);
		return {
			labelPrefixes: Array.isArray(parsed.labelPrefixes) ? parsed.labelPrefixes : DEFAULT_CONFIG.labelPrefixes,
			pathPrefixes: Array.isArray(parsed.pathPrefixes) ? parsed.pathPrefixes : DEFAULT_CONFIG.pathPrefixes,
		};
	} catch {
		return DEFAULT_CONFIG;
	}
}


