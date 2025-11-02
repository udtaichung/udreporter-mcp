# 📘 InDesign MCP Server

[English](#english) | [中文](#中文)

---

## English

### Overview
InDesign MCP Server turns Adobe InDesign into a Model Context Protocol (MCP) provider with more than 135 production-grade tools. It gives AI agents and automation scripts fine-grained control over documents, pages, styles, graphics, exports, and the new advanced template workflows that power architecture and presentation projects.

### Highlights
- **Comprehensive Toolset:** 13 handler families covering document, page, style, graphics, export, book, and utility operations.
- **Advanced Template Orchestration:** `indesign-mcp-advanced` server exposes high-level master-page operations that respect slot labels and metadata.
- **AI-Friendly Design:** Responses are MCP-compliant, streaming-safe (stdout reserved for protocol), and include rich context for downstream reasoning.
- **Robust Error Handling:** Every handler guards against missing documents, invalid selections, and COM/AppleScript failures with clear diagnostics.
- **Session Intelligence:** Automatic page dimension tracking, smart placement defaults, and configurable overrides make agent workflows resilient.

### Quick Start
1. **Install Dependencies**
   ```bash
   npm install
   ```
2. **Launch the classic server**
   ```bash
   npm run start
   ```
   Or use the provided batch file on Windows to ensure InDesign launches with the correct working directory:
   ```bat
   start-indesign-mcp.bat
   ```
3. **Launch the advanced template server**
   ```bash
   node src/advanced/index.js
   ```
   Register both servers in your MCP client so the classic atomic tools and the advanced template orchestrator can run side-by-side.

### MCP Client Configuration (example)
```json
{
  "mcpServers": {
    "indesign-mcp-server": {
      "command": "node",
      "args": ["src/index.js"],
      "cwd": "D:/AI/mcp-indesign/indesign-mcp-server",
      "env": { "NODE_ENV": "production" }
    },
    "indesign-mcp-advanced": {
      "command": "node",
      "args": ["src/advanced/index.js"],
      "cwd": "D:/AI/mcp-indesign/indesign-mcp-server",
      "env": { "NODE_ENV": "production" }
    }
  }
}
```
Adjust the paths to match your local directory layout.

### Repository Layout
```
indesign-mcp-server/
├─ src/               # Core runtime, handlers, utilities, advanced template server
├─ tests/             # Scenario-driven test suites (node tests/index.js --required)
├─ scripts/           # Maintenance and automation helpers (e.g., build presentations)
├─ docs/              # Onboarding guides, integration notes, system prompts
└─ README.md          # You are here
```

### Contributing & License
- Follow the guidelines in `CONTRIBUTING.md` and existing conventional commit style (e.g., `feat: …`, `fix: …`).
- Run the required scenarios via `node tests/index.js --required` before opening a PR.
- Licensed under the terms listed in `LICENSE`.

### Support
If you run into issues, check the handler-level documentation in `docs/`, review the tests for usage samples, or open a GitHub issue with reproduction steps.

---

## 中文

### 概览
InDesign MCP Server 将 Adobe InDesign 打造成一个 MCP 服务端，提供 135+ 项专业工具，实现从文档、页面到样式、图形、导出、图书管理的全链路自动化。新增的 `indesign-mcp-advanced` 模块可以让智能体按照母版脚本标签的说明，批量创建页面并填充模板槽位，尤其适合建筑方案汇报、品牌手册等需要高质量版式的场景。

### 核心亮点
- **工具覆盖全面：** 13 组处理器，涵盖文档、页面、样式、图形、导出、图书及通用工具。
- **高级模板编排：** 高级服务器会返回槽位名称、类型与脚本标签说明，智能体可严格遵循母版要求填充内容。
- **对 AI 友好：** 所有响应均符合 MCP 协议并通过 stderr 输出日志，避免干扰协议数据流。
- **健壮的错误处理：** 精准提示缺失文档、非法选择或 COM/AppleScript 异常，便于排查。
- **会话智能：** 自动记录页面尺寸、提供智能定位和 override 逻辑，让连续操作更可靠。

### 快速上手
1. **安装依赖**
   ```bash
   npm install
   ```
2. **启动经典服务器**
   ```bash
   npm run start
   ```
   Windows 用户可执行 `start-indesign-mcp.bat`，确保工作目录和 InDesign 实例正确匹配。
3. **启动高级模板服务器**
   ```bash
   node src/advanced/index.js
   ```
   在 MCP 客户端中同时注册两个服务，让基础原子工具与高级模板流程协同工作。

### MCP 客户端配置示例
```json
{
  "mcpServers": {
    "indesign-mcp-server": {
      "command": "node",
      "args": ["src/index.js"],
      "cwd": "D:/AI/mcp-indesign/indesign-mcp-server",
      "env": { "NODE_ENV": "production" }
    },
    "indesign-mcp-advanced": {
      "command": "node",
      "args": ["src/advanced/index.js"],
      "cwd": "D:/AI/mcp-indesign/indesign-mcp-server",
      "env": { "NODE_ENV": "production" }
    }
  }
}
```
根据本地部署路径调整 `cwd` 与参数。

### 目录结构
```
indesign-mcp-server/
├─ src/               # 主服务与高级模板模块
├─ tests/             # 场景化测试（node tests/index.js --required）
├─ scripts/           # 运维脚本与批处理工具
├─ docs/              # 文档、集成说明、系统提示词
└─ README.md          # 当前文件
```

### 贡献与许可
- 遵循 `CONTRIBUTING.md` 中的规范，使用项目现有的 Conventional Commit 风格提交。
- 在提交 PR 前执行 `node tests/index.js --required`，确保核心流程通过。
- 许可证信息见 `LICENSE`。

### 支持方式
如遇问题，可先查阅 `docs/` 中的集成说明、参考测试用例的调用方式，或在 GitHub 上提交 Issue 并附上复现步骤。

---

**Bring AI-driven precision to every InDesign project — 从智能母版到自动化版式，让创意与效率同步升级。**
