import { app, BrowserWindow, ipcMain, screen } from "electron";
import { join } from "node:path";

let petWindow: BrowserWindow | null = null;
let apiConfig = { baseUrl: "https://api.openai.com/v1", model: "gpt-4o-mini", apiKey: "" };

function createPetWindow() {
  const area = screen.getPrimaryDisplay().workArea;
  petWindow = new BrowserWindow({
    width: 360,
    height: 520,
    x: area.x + area.width - 390,
    y: area.y + area.height - 560,
    frame: false,
    transparent: true,
    backgroundColor: "#00000000",
    alwaysOnTop: true,
    resizable: true,
    hasShadow: false,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  petWindow.setAlwaysOnTop(true, "floating");
  if (process.env.ELECTRON_RENDERER_URL) petWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  else petWindow.loadFile(join(__dirname, "../renderer/index.html"));
  petWindow.on("closed", () => { petWindow = null; });
}

app.whenReady().then(() => {
  ipcMain.handle("pet:set-ai-config", (_event, config) => {
    const baseUrl = String(config.baseUrl || "https://api.openai.com/v1").trim().replace(/\/$/, "");
    const model = String(config.model || "gpt-4o-mini").trim();
    const apiKey = String(config.apiKey || "").trim();
    if (!/^https?:\/\//i.test(baseUrl)) throw new Error("接口地址必须以 https:// 或 http:// 开头。");
    if (/[\u0000-\u0020\u007f-\uffff]/.test(apiKey)) {
      throw new Error("API Key 含有非英文/特殊字符。请重新从 OpenAI 控制台复制密钥，只粘贴 sk-... 本身，不要带引号、说明文字或中文标点。");
    }
    apiConfig = { baseUrl, model, apiKey };
    return { configured: Boolean(apiConfig.apiKey) };
  });

  ipcMain.handle("pet:chat", async (_event, messages) => {
    if (!apiConfig.apiKey) throw new Error("请先在设置中填写 API Key。");
    if (/[\u0000-\u0020\u007f-\uffff]/.test(apiConfig.apiKey)) {
      throw new Error("API Key 含有非英文/特殊字符，请重新复制并载入配置。");
    }
    let response: Response;
    try {
      response = await fetch(apiConfig.baseUrl + "/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + apiConfig.apiKey
        },
        body: JSON.stringify({
          model: apiConfig.model,
          messages: [
            { role: "system", content: "你是噗咪，一只亲切、活泼、有自己想法的桌面陪伴伙伴。回复自然、简短，可以使用颜文字，不要机械重复。" },
            ...messages
          ],
          temperature: 0.85
        })
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error("网络请求失败：" + message);
    }
    const raw = await response.text();
    let data: any = {};
    try { data = raw ? JSON.parse(raw) : {}; } catch { /* keep raw response out of the UI */ }
    if (!response.ok) {
      const detail = data?.error?.message || "API 请求失败（" + response.status + "）";
      throw new Error(detail);
    }
    return data?.choices?.[0]?.message?.content || "我刚刚走神啦，再说一次好不好 ovo";
  });

  createPetWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createPetWindow();
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
