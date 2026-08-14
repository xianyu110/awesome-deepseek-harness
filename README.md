# Awesome DeepSeek Harness

精选 DeepSeek Harness（DSH）插件、工具、主题、工作流与相关资源。

## 目录

### 作者相关仓库

- [deepseek-harness](https://github.com/xianyu110/deepseek-harness) - DeepSeek Harness 主项目的代码镜像，包含 Web、TUI、桌面端、插件系统和开发文档。[官网](https://deepseek.com/harness)
- [deepseek-harness-orange-book](https://github.com/xianyu110/deepseek-harness-orange-book) - DeepSeek Harness 橙皮书，收录系统提示词、启动配置、原始会话日志、PTC 实测和扩展包考古资料，并提供 PDF、EPUB、HTML 等格式。

### UI 与桌面

- [dsh-web-ui](https://github.com/xianyu110/dsh-web-ui) - Web UI 插件合集：任务板、Git 图、侧栏、移动端、桌面宠物和 Token 统计。[官网](https://gallery.dsh-market.com)
- [DSH-better-sidebar](https://github.com/xianyu110/DSH-better-sidebar) - 侧栏工作台，提供文件编辑、终端、Git 和子代理。
- [dsh-TUI](https://github.com/xianyu110/dsh-TUI) - Claude Code 风格的全屏终端 UI。
- [dsh-tianshu-tui](https://github.com/xianyu110/dsh-tianshu-tui) - 终端 UI 与 Harness 工作流。
- [dsh-openpencil](https://github.com/xianyu110/dsh-openpencil) - OpenPencil 设计预览和编辑插件。[官网](https://op.zseven.tech)
- [dsh-visualize](https://github.com/xianyu110/dsh-visualize) - 在对话内生成交互式 HTML 卡片。
- [dsh-genui](https://github.com/xianyu110/dsh-genui) - 在回复中渲染图表、表单、Mermaid 和 3D UI。
- [deepseek-harness-desktop](https://github.com/xianyu110/deepseek-harness-desktop) - 面向 macOS 和 Windows 的桌面端。[官网](https://deepseekdesktop.com)
- [oh-dsh](https://github.com/xianyu110/oh-dsh) - TUI、桌面端和 Web UI 一体化社区发行版。
- [whale-girl](https://github.com/xianyu110/whale-girl) - DSH Web GUI 桌面宠物。

### 视觉、浏览与搜索

- [modlens](https://github.com/xianyu110/modlens) - 图片理解、OCR、版面和语义结构化。[官网](https://liustack.dev)
- [dsh-vision-toolkit](https://github.com/xianyu110/dsh-vision-toolkit) - 图片问答、长截图 OCR、UI 还原和 GUI 自动化。
- [modsearch](https://github.com/xianyu110/modsearch) - Web / X 搜索和结构化引用。[官网](https://liustack.dev)
- [dsh-browser](https://github.com/xianyu110/dsh-browser) - 让 DSH 直接操作浏览器的 Chrome 侧栏插件。

### 工作流与开发集成

- [dsh-agent-teams](https://github.com/xianyu110/dsh-agent-teams) - Agent Teams 多智能体协作插件。
- [dsh-at-file](https://github.com/xianyu110/dsh-at-file) - 类 Codex 的 `@file` 文件引用。
- [dsh-turn-rewind](https://github.com/xianyu110/dsh-turn-rewind) - 会话和代码状态回退。
- [dsh-auto-continue](https://github.com/xianyu110/dsh-auto-continue) - 请求中断后自动发送“继续”。
- [dsh-github](https://github.com/xianyu110/dsh-github) - GitHub PR、Issue 和后台审查，写操作需要人工批准。
- [deepseek-harness-acp](https://github.com/xianyu110/deepseek-harness-acp) - DeepSeek Harness 的 ACP 服务实现。

### 资料与生态目录

- [dsh-handbook](https://github.com/xianyu110/dsh-handbook) - DeepSeek Harness 中文/英文深度手册。
- [awesome-deepseek-harness-0xsline](https://github.com/xianyu110/awesome-deepseek-harness-0xsline) - DSH 生态、插件和基础设施目录。[官网](https://deepseekdocs.com/)
- [awesome-dsh-plugins](https://github.com/xianyu110/awesome-dsh-plugins) - 自动扫描插件候选的 Radar 目录。
- [awesome-dsh-plugin](https://github.com/xianyu110/awesome-dsh-plugin) - 带自动更新的 DSH 插件目录。
- [awesome-dsh-plugin-community](https://github.com/xianyu110/awesome-dsh-plugin-community) - 社区维护的插件精选列表。[官网](https://awesome-dsh-plugin.com)

<!-- BEGIN DEEPSEEK-HARNESS-AUTO-DISCOVERY -->
### 自动发现项目

以下条目由 GitHub Actions 根据 `dsh-plugin` Topic 或 `deepseek-harness` 搜索结果自动维护。

本次运行未发现新的候选项目。
<!-- END DEEPSEEK-HARNESS-AUTO-DISCOVERY -->

## 收录范围

本列表优先收录 DeepSeek Harness 本体、插件生态、开发工具、主题、工作流和实测文档。仅使用 DeepSeek API、但与 Harness 无直接关系的项目暂不列入。

## 自动化

`.github/workflows/discover-and-fork.yml` 每 30 分钟搜索 `dsh-plugin` 和 `deepseek-harness`，自动 Fork 新项目、同步目录中的相关 Fork，并通过同一个 PR 分支更新本 README。每次运行最多处理 20 个新项目，避免搜索结果异常时产生大量 Fork。

请在本仓库的 Actions secrets 中配置 `FORK_TOKEN`。Fine-grained Token 需要允许访问所有公开仓库，并授予创建 Fork 所需的 `Administration: write`、`Contents: read`，以及本仓库的 `Contents: write` 和 `Pull requests: write`；不要把 Token 写入代码或日志。具体权限要求可参考 [GitHub Fork API 文档](https://docs.github.com/en/rest/repos/forks) 和 [同步 Fork API 文档](https://docs.github.com/en/rest/branches/branches#sync-a-fork-branch-with-the-upstream-repository)。

## 贡献

欢迎通过 Pull Request 补充项目。请为每个条目提供项目链接、简短说明，并确认项目与 DeepSeek Harness 相关。

## License

本目录内容以 CC0-1.0 发布；各被收录项目遵循其自身许可证。
