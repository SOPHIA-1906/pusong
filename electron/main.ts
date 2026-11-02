import { app, BrowserWindow, ipcMain, screen } from "electron";
import { join } from "node:path";
let petWindow: BrowserWindow | null = null;
let apiConfig = { baseUrl:"https://api.openai.com/v1", model:"gpt-4o-mini", apiKey:"" };
function createPetWindow() {
  const area = screen.getPrimaryDisplay().workArea;
  petWindow = new BrowserWindow({ width:360,height:520,x:area.x+area.width-390,y:area.y+area.height-560,frame:false,transparent:true,backgroundColor:"#00000000",alwaysOnTop:true,resizable:true,hasShadow:false,webPreferences:{preload:join(__dirname,"../preload/index.js"),contextIsolation:true,nodeIntegration:false,sandbox:true} });
  petWindow.setAlwaysOnTop(true,"floating");
  if (process.env.ELECTRON_RENDERER_URL) petWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  else petWindow.loadFile(join(__dirname,"../renderer/index.html"));
  petWindow.on("closed",()=>{petWindow=null;});
}
app.whenReady().then(()=>{
  ipcMain.handle("pet:set-ai-config",(_event,config)=>{
    apiConfig={baseUrl:String(config.baseUrl||"https://api.openai.com/v1").replace(/\/$/,""),model:String(config.model||"gpt-4o-mini"),apiKey:String(config.apiKey||"")};
    return {configured:Boolean(apiConfig.apiKey)};
  });
  ipcMain.handle("pet:chat",async(_event,messages)=>{
    if(!apiConfig.apiKey) throw new Error("请先在设置中填写 API Key。");
    const response=await fetch(apiConfig.baseUrl+"/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+apiConfig.apiKey},body:JSON.stringify({model:apiConfig.model,messages:[{role:"system",content:"你是噗咪，一只亲切、活泼、有自己想法的桌面陪伴伙伴。回复自然、简短，可以使用颜文字，不要机械重复。"},...messages],temperature:0.85})});
    const data=await response.json();
    if(!response.ok) throw new Error(data?.error?.message||"API 请求失败（"+response.status+"）");
    return data?.choices?.[0]?.message?.content||"我刚刚走神啦，再说一次好不好 ovo";
  });
  createPetWindow();
  app.on("activate",()=>{if(BrowserWindow.getAllWindows().length===0)createPetWindow();});
});
app.on("window-all-closed",()=>{if(process.platform!=="darwin")app.quit();});