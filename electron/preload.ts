import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("petAPI",{
 setAIConfig:(config:{baseUrl:string;model:string;apiKey:string})=>ipcRenderer.invoke("pet:set-ai-config",config),
 chat:(messages:{role:"user"|"assistant";content:string}[])=>ipcRenderer.invoke("pet:chat",messages)
});