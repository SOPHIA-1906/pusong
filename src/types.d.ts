export {};
declare global { interface Window { petAPI:{
 setAIConfig(config:{baseUrl:string;model:string;apiKey:string}):Promise<{configured:boolean}>;
 chat(messages:{role:"user"|"assistant";content:string}[]):Promise<string>;
}; } }