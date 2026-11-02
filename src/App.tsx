import {useEffect,useRef,useState} from "react";
type Message={role:"user"|"assistant";content:string};
const skins=[["原皮","原皮.jpg"],["亚麻","亚麻原皮.jpg"],["粉毛","粉毛原皮.jpg"],["淡紫","淡紫毛.jpg"],["黑毛","黑毛原皮.jpg"]];
const asset=(file:string)=>"https://raw.githubusercontent.com/SOPHIA-1906/pusong/main/"+encodeURIComponent(file);
export default function App(){
 const [skin,setSkin]=useState(0),[tab,setTab]=useState("pet"),[input,setInput]=useState(""),[busy,setBusy]=useState(false);
 const [messages,setMessages]=useState<Message[]>([{role:"assistant",content:"嗨！我在这里陪你～今天也要记得照顾自己呀 ovo"}]);
 const [apiKey,setApiKey]=useState(""),[baseUrl,setBaseUrl]=useState("https://api.openai.com/v1"),[model,setModel]=useState("gpt-4o-mini"),[notice,setNotice]=useState("今天也要开心！");
 const bottom=useRef<HTMLDivElement>(null);
 useEffect(()=>{bottom.current?.scrollIntoView({behavior:"smooth"});},[messages,busy]);
 async function send(){const content=input.trim();if(!content||busy)return;const next=[...messages,{role:"user" as const,content}];setMessages(next);setInput("");setBusy(true);try{const reply=await window.petAPI.chat(next);setMessages([...next,{role:"assistant",content:reply}]);}catch(e){setMessages([...next,{role:"assistant",content:"连接失败："+(e instanceof Error?e.message:"未知错误")}]);}finally{setBusy(false);}}
 async function save(){try{await window.petAPI.setAIConfig({baseUrl,model,apiKey});setNotice(apiKey?"AI 配置已载入（当前运行期间有效）":"请填写 API Key");}catch{setNotice("配置失败");}}
 return <main className="shell">
 <header className="topbar"><span className="brand">✿ 噗咪</span><nav>{[["pet","桌宠"],["chat","聊天"],["settings","设置"]].map(([id,label])=><button className={tab===id?"active":""} onClick={()=>setTab(id)} key={id}>{label}</button>)}</nav><button className="close" onClick={()=>window.close()}>×</button></header>
 {tab==="pet"&&<section className="pet-view"><div className="speech">{notice}</div><div className="character-wrap"><img className="character" src={asset(skins[skin][1])} alt="噗咪人物立绘"/></div><div className="pet-footer"><span>今天和噗咪相处中 ♡</span><select value={skin} onChange={e=>setSkin(Number(e.target.value))}>{skins.map((s,i)=><option value={i} key={s[0]}>{s[0]}</option>)}</select></div><div className="quick-actions"><button onClick={()=>setNotice("被摸摸啦！好舒服 (｡･ω･｡)")}>摸摸</button><button onClick={()=>setNotice("谢谢投喂！我会好好吃掉的！")}>投喂</button><button onClick={()=>setTab("chat")}>和我聊天</button></div></section>}
 {tab==="chat"&&<section className="chat-view"><div className="messages">{messages.map((m,i)=><div className={"message "+m.role} key={i}>{m.content}</div>)}{busy&&<div className="message assistant">噗咪正在想怎么回答…</div>}<div ref={bottom}/></div><form className="composer" onSubmit={e=>{e.preventDefault();void send();}}><input value={input} onChange={e=>setInput(e.target.value)} placeholder="和噗咪说点什么…"/><button disabled={busy||!input.trim()}>发送</button></form></section>}
 {tab==="settings"&&<section className="settings-view"><h2>AI 接口设置</h2><p>当前支持 OpenAI 兼容的 Chat Completions 接口。API Key 只保存在本次运行的主进程内存中，关闭程序后需要重新填写。</p><label>接口地址<input value={baseUrl} onChange={e=>setBaseUrl(e.target.value)}/></label><label>模型名称<input value={model} onChange={e=>setModel(e.target.value)}/></label><label>API Key<input type="password" value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="粘贴你的 API Key"/></label><button className="save" onClick={()=>void save()}>载入配置</button><p className="hint">{notice}</p><p className="hint">不要把 API Key 发给别人，也不要提交到 GitHub。</p></section>}
 <footer className="footnote">拖动窗口顶部可移动桌宠 · 噗咪 0.1.0</footer></main>;
}