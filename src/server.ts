#!/usr/bin/env node
import express from "express";
import cors from "cors";
import path from "path";
import { scanLoginItems } from "./features/scanLoginItems";
import { scanLaunchAgentsAndDaemons } from "./features/scanLaunchPlists";
import { aggregateResults } from "./features/aggregate";
import { resolveLaunchStatus } from "./features/resolveStatus";

const app = express();
const PORT = 1000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// API エンドポイント
app.get("/api/autostart", async (req, res) => {
	try {
		const withStatus = req.query.status === "true";
		
		const login = await scanLoginItems();
		const launch = await scanLaunchAgentsAndDaemons();
		let list = aggregateResults(login, launch, {});
		
		if (withStatus) {
			list = await resolveLaunchStatus(list);
		}
		
		res.json({
			success: true,
			data: list,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		console.error("API Error:", error);
		res.status(500).json({
			success: false,
			error: error instanceof Error ? error.message : "Unknown error"
		});
	}
});

// ルートページ
app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => {
	console.log(`🚀 自動起動アプリ管理サーバーが起動しました`);
	console.log(`📱 ブラウザで http://localhost:${PORT} にアクセスしてください`);
	console.log(`🔧 API: http://localhost:${PORT}/api/autostart`);
});
