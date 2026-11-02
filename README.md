# 噗咪桌宠

噗咪双人陪伴桌面应用，当前开发阶段为桌宠 MVP。

## 当前实现
- Electron 透明、无边框、置顶窗口
- 桌面人物立绘展示与皮套切换（读取仓库现有图片素材）
- 窗口顶部拖动、窗口缩放
- 聊天界面
- OpenAI 兼容 Chat Completions API 的真实请求入口
- API Key 仅在当前运行进程内存中保存，不写入仓库

## 开发环境
需要 Node.js 20+ 和 npm。安装依赖后运行：

```bash
npm install
npm run dev
```

## 打包
运行 `npm run dist`。macOS 生成 DMG；Windows 生成 NSIS 安装程序。请在对应操作系统上完成最终打包和测试。

## Live2D 说明
当前仓库中的 JPG/PNG 是人物立绘和动作参考图，不是 Live2D 模型文件。真正的 Live2D 动态需要 Cubism 模型文件（如 model3.json、moc3、纹理和动作文件）。当前使用静态立绘和轻量待机动画，后续再接入 Live2D。
