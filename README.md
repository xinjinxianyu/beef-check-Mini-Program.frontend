> 第九届传智杯全国大学生数智创新与AI应用大赛 · AI微信小程序开发挑战赛参赛作品
>
> 作品说明文档：[第九届传智杯-AI小程序赛道-识牛.docx](deliverables/第九届传智杯-AI小程序赛道-识牛.docx)  
> 演示录屏脚本：[识牛-演示录屏脚本.md](deliverables/识牛-演示录屏脚本.md)  
> 架构图：[architecture.png](artifacts/competition_assets/architecture.png) · [flow.png](artifacts/competition_assets/flow.png)

# 识牛 · 微信小程序前端

基于图片中的功能架构完成的原生微信小程序前端。项目不依赖 npm 包，可直接导入微信开发者工具运行。

## 已实现页面

- 首页：品牌展示、快速拍照入口、端侧模型说明、做法助手与百科入口、热门部位。
- 识别页：相机/相册选图、首次模型加载进度、端侧推理模拟、Canvas 原图画框、结果卡片。
- 结果页：部位与新鲜度报告、判断依据、做法建议、AI 助手上下文入口和纠错反馈。
- 牛肉做法助手：锁定最近一次识别部位，支持快捷问题和围绕处理、做法、熟度、保存的自由提问；内置 112 道牛肉菜谱识别、技法兜底和分类做法，独立 AI API 服务层。
- 百科页：中式分割部位、新鲜度判断、保存指南，共 20 条独立条目；7 组潮汕火锅叫法已并入对应中式部位，新鲜度页包含“看、闻、按”和冷鲜、冷冻、鲜切肉避坑指南。
- 历史页：本地记录、时间展示、删除和清空，所有记录仅保存在当前设备。
- 登录页：游客模式、微信 `wx.login` + `wx.getUserProfile` 快捷登录。
- 个人中心：头像昵称、识别次数、本地存储状态、缓存清理和隐私说明。

## 运行

1. 使用微信开发者工具导入当前目录。
2. 项目使用 `project.config.json` 中配置的小程序 AppID。
3. 直接点击“识别牛肉”即可体验真实图片识别流程。

当前端侧识别已接入 YOLO26 导出的 ONNX 模型和新鲜度分类模型。检测模型输出肩肉、里脊、牛腩、臀肉和外脊 5 个类别，新鲜度模型输出新鲜/不新鲜概率。模型从云存储下载后缓存在本机，推理过程不上传原图。

默认关闭模拟回退。若模型未部署或模型尺寸不匹配，页面会明确提示识别失败，不会静默返回演示结果。

## AI 接口

AI 请求统一从 `services/ai.js` 的 `askBeefAssistant(payload)` 发出，页面层不会直接调用模型。默认 `config/env.js` 中：

```js
USE_MOCK_AI: true
```

保持为 `true` 时使用部位相关的本地演示答案。接入真实服务时，将 `USE_MOCK_AI` 改为 `false`，配置 `API_BASE_URL` 与 `AI_ASSISTANT_PATH` 即可。

大模型密钥不能写入小程序。后端负责调用文心一言、通义千问等模型，并完成：

- 固定问题 ID 到受控 Prompt 的映射。
- `context` 数据清洗与长度限制。
- 内容安全审核、限流、鉴权和日志审计。
- 统一返回烹饪答案与免责声明。

完整请求/响应契约见 [docs/AI_API.md](docs/AI_API.md)。

## 数据与隐私

- 识别历史始终通过 `wx.setStorageSync` 保存在当前设备，不提供云端同步。
- 登录时保存微信登录态与用户展示资料；正式的 `code` 换登录态逻辑由 `services/auth.js` 调用后端。
- 识别记录不会上传云端；清理缓存或删除小程序后无法恢复。
- 反馈默认通过微信云函数调用 QQ SMTP 发送到 `2960453506@qq.com`，可选择是否附带当前识别图片，同时保留本机副本。
- 识别图片在选图后会复制到 `wx.env.USER_DATA_PATH`，避免临时路径失效。

## 端侧模型

`services/inference.js` 对外暴露两个方法：

```js
loadModel(onProgress)
recognize(photoPath, onProgress)
```

页面只依赖这两个方法的返回结构。模型配置位于 `config/model.js`，模型文件通过 `getModelUrl` 云函数获取临时下载地址。部署时需要保证：

- 云存储中存在 `models/beef-v1/part_detector_int8.onnx` 和 `models/beef-v1/freshness_classifier_int8.onnx`。
- `EXPECTED_MODEL_BYTES` 与云端文件大小一致。
- `getModelUrl` 云函数已部署到同一云环境。
- 手机或基础库支持 `wx.createInferenceSession`。

模型输出继续使用以下兼容结构：

```js
{
  id,
  cutId,
  cutName,
  cutAlias,
  freshness,
  confidence,
  freshnessLabel,
  flavor,
  serving,
  reason: [],
  note,
  boxes: [{ x, y, width, height, label }],
  imagePath,
  createdAt,
  modelVersion,
  status
}
```

`boxes` 使用相对图片宽高的 0–1 坐标，识别页 Canvas 会据此绘制标注框。

## 静态检查

项目附带无依赖校验脚本，检查页面文件完整性、JSON、JavaScript 语法、WXML 标签闭合、事件处理函数和本地 require 路径：

```powershell
node scripts/validate-project.js
```

如果本机 PowerShell 允许执行 npm 脚本，也可运行 `npm run check`。
