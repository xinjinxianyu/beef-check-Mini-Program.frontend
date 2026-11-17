# sendFeedbackEmail

该云函数将小程序用户反馈通过 QQ 邮箱 SMTP 发送到
`2960453506@qq.com`。

## 部署

1. 在微信开发者工具中开通云开发环境。
2. 将云环境 ID 填入项目根目录 `config/env.js` 的 `CLOUD_ENV_ID`。
3. 登录 QQ 邮箱网页版，在“设置 → 账号”中开启 SMTP 服务并生成授权码。
4. 在云开发控制台为 `sendFeedbackEmail` 云函数添加环境变量：

   ```text
   SMTP_USER=2960453506@qq.com
   SMTP_PASS=QQ邮箱生成的SMTP授权码
   FEEDBACK_TO=2960453506@qq.com
   ```

5. 在微信开发者工具中右键该云函数，选择“上传并部署：云端安装依赖”。
6. 建议在云数据库中创建 `feedback` 集合，用于保存反馈副本。
7. 重新编译小程序，在识别结果页提交一条测试反馈。

`SMTP_PASS` 必须是 QQ 邮箱授权码，不能填写 QQ 登录密码。授权码只能保存在云函数环境变量中。
