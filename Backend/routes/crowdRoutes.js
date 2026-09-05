import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CROWD_BACKEND_URL = "http://127.0.0.1:5773";

// AI Process Management
let aiProcess = null;


export const initCrowdAI = (backendPath) => {
    if (process.env.VERCEL) {
        console.warn("⚠️ AI Core disabled in Vercel Serverless Mode. Please deploy the Python AI service separately and update CROWD_BACKEND_URL.");
        return;
    }

    if (aiProcess) return;

    const venvWin = path.join(backendPath, ".venv", "Scripts", "python.exe");
    const venvUnix = path.join(backendPath, ".venv", "bin", "python");
    let pythonPath = process.platform === "win32" ? "py" : "python3";

    if (fs.existsSync(venvWin)) {
        pythonPath = venvWin;
    } else if (fs.existsSync(venvUnix)) {
        pythonPath = venvUnix;
    }

    console.log("🐍 AI Core Python Executable:", pythonPath);

    const scriptPath = path.join(backendPath, "AI_Core", "crowd_engine.py");

    // Fix for DeprecationWarning and Security: verify python exists or use shell: false
    // Using shell: false is safer and removes the warning
    aiProcess = spawn(pythonPath, [scriptPath], {
        stdio: "inherit",
        shell: false,
        cwd: path.join(backendPath, "AI_Core")
    });

    aiProcess.on("error", (err) => {
        console.error("❌ AI Core failed to ignite:", err);
    });

    process.on("exit", () => {
        if (aiProcess) aiProcess.kill();
    });
};

// Proxy Middleware for AI Endpoints
router.use(
    "/",
    createProxyMiddleware({
        target: CROWD_BACKEND_URL,
        changeOrigin: true,
        pathRewrite: {
            "^/api/v1/crowd": "",
        },
        ws: true,
        onError: (err, req, res) => {
            res.status(502).json({
                error: "AI Neural Core is offline",
                message: "The AI engine is currently initializing or unavailable."
            });
        },
    })
);

export default router;
