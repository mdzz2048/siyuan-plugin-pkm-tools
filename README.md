这是一个工具集

目前支持一键导入 Flomo 中的笔记到思源的指定文档或按日期拆分的文档。

使用前需要在设置中设置 Flomo 账户密码，用于鉴权。所有账户密码配置明文存储在 `工作空间/data/storage/petal/siyuan-plugin-pkm-tools/config.json` 中。

目前项目还在开发初期，如需使用请手动安装

1. 下载项目代码，安装依赖 `pnpm install`
2. 指定工作空间 `pnpm run make-link`
3. 构建 `pnpm run build`

TODO：

- [ ] 添加文档右键菜单
  - [ ] 获取文档链接的网页标题
  - [ ] 获取文档链接的网页快照 (使用 Cubox 的 API 实现)
- [ ] 支持更多工具
  - [ ] Writeathon
  - [ ] Cubox
  - [ ] Hypothesis
- [ ] 支持使用模板格式化导入内容