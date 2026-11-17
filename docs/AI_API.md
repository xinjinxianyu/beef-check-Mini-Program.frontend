# 牛肉做法助手 API 契约

## 请求

前端调用位置：`services/ai.js`

```http
POST /v1/ai/beef-assistant
Authorization: Bearer <wechat-session-token>
Content-Type: application/json
```

```json
{
  "questionId": "best_cooking",
  "question": "这个部位怎么做更好吃？",
  "context": {
    "cutId": "ribeye",
    "cutName": "眼肉",
    "freshness": 88,
    "source": "local-recognition"
  },
  "dishId": "beef_dish_5",
  "dishName": "杭椒牛柳",
  "policy": "beef-cooking-context-v1"
}
```

允许的 `questionId`：

| ID | 标准问题 |
| --- | --- |
| `best_cooking` | 这个部位怎么做更好吃？ |
| `stew_or_fry` | 这块肉更适合炖还是快速炒制？ |
| `doneness` | 如果做牛排，几分熟更合适？ |
| `storage` | 一次吃不完应该怎么保存？ |
| `custom` | 用户围绕当前识别部位提出的自由问题 |

前端自由输入限制为 120 个字符，并会把最新识别结果固定放入 `context`。没有识别结果时允许询问通用牛肉问题。前端会同时检查“牛肉主体”和“真实意图”，例如“牛肉股票”“用牛腩写诗”“帮我写牛肉炒菜代码”都会在进入模型前被拒绝。后端仍需使用语义级分类器复核，不能只依赖关键词，也不能直接信任 `question` 字段。

## 响应

```json
{
  "code": 0,
  "data": {
    "answer": "眼肉脂肪分布细密，建议用高温香煎或炭烤……",
    "answerId": "ans_20261027_001",
    "disclaimer": "建议仅供家庭烹饪参考，食用安全请以充分加热和实际储存条件为准。"
  }
}
```

话题被拦截时，前端兼容如下返回：

```json
{
  "answer": "请换一个真正与牛肉相关的问题。",
  "blocked": true,
  "blockLabel": "请换个牛肉问题"
}
```

前端也兼容直接把业务对象作为响应顶层字段。HTTP 状态码为 2xx 且 `code` 不等于 `-1` 时视为成功。

## 后端建议

1. 按 `questionId + context.cutId` 选择受控 Prompt 模板；`custom` 问题也必须限制在当前部位的处理、烹饪和保存范围内。
2. `cutId` 只允许模型支持的核心部位 ID。
3. 模型输出限制为烹饪建议、熟度、保存方式，禁止扩展到健康诊断等范围。
4. 统一附加免责声明，并进行敏感内容审核。
5. 大模型密钥只保存在服务端环境变量中。
6. 对用户和登录态进行限流，记录请求 ID 便于审计。
7. 服务端通过 `context.cutId` 和 `context.cutName` 提供当前部位上下文；提问涉及其他牛肉部位时不强制拦截，可回答比较或说明部位差异。
8. 非牛肉问题返回统一的引导语，不调用烹饪建议生成模型。
9. 话题判断应同时考察主体、真实意图和当前识别部位；禁止把“提到牛肉”直接视为“牛肉话题”。
10. 助手以牛肉话题为主。问题同时明确提到牛肉时，允许进行牛肉与其他肉类的比较或替代询问；整句只询问其他肉类时才拒绝。

## 登录接口

`services/auth.js` 向后端发送：

```json
{
  "code": "wx.login 返回的临时 code",
  "profile": {
    "nickName": "微信昵称",
    "avatarUrl": "头像地址"
  }
}
```

期望返回：

```json
{
  "token": "business-session-token",
  "user": {
    "nickName": "微信昵称",
    "avatarUrl": "头像地址"
  }
}
```

当前默认使用微信云开发发送反馈邮件：

1. 小程序将反馈图片上传到云存储。
2. 小程序调用云函数 `sendFeedbackEmail`。
3. 云函数使用 QQ 邮箱 SMTP 将反馈发送到 `2960453506@qq.com`。
4. 邮件发送成功后，尝试将反馈摘要写入云数据库 `feedback` 集合。

云函数需要以下环境变量：

| 变量 | 说明 |
| --- | --- |
| `SMTP_USER` | 发件 QQ 邮箱，建议填写 `2960453506@qq.com` |
| `SMTP_PASS` | QQ 邮箱生成的 SMTP 授权码，不是 QQ 登录密码 |
| `FEEDBACK_TO` | 可选，收件邮箱；默认 `2960453506@qq.com` |

云函数位于 `cloudfunctions/sendFeedbackEmail`。部署时选择“云端安装依赖”，并让云函数运行环境能够访问 `smtp.qq.com:465`。
