import { promises as fs } from "fs";
import path from "path";

export async function pathExists(targetPath: string): Promise<boolean> {
	try {
		await fs.access(targetPath);
		return true;
	} catch {
		return false;
	}
}

export async function readFileSafe(filePath: string): Promise<string | null> {
	try {
		return await fs.readFile(filePath, "utf8");
	} catch {
		return null;
	}
}

export async function readFileBufferSafe(filePath: string): Promise<Buffer | null> {
	try {
		return await fs.readFile(filePath);
	} catch {
		return null;
	}
}

export async function listDirectorySafe(dirPath: string): Promise<string[]> {
	try {
		return await fs.readdir(dirPath);
	} catch {
		return [];
	}
}

export async function statMtimeIso(filePath: string): Promise<string | null> {
	try {
		const s = await fs.stat(filePath);
		return s.mtime.toISOString();
	} catch {
		return null;
	}
}

export function joinPath(...segments: string[]): string {
	return path.join(...segments);
}


