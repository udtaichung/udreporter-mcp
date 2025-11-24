# 📘 InDesign MCP Server

[English](#english) | [中文](#中文)

---

## English

### Prerequisites
- **Adobe InDesign desktop** (2023–2025). On Windows the COM ProgIDs `InDesign.Application.2025/2024/...` are used; launch InDesign once so COM is registered.
- **Node.js >= 18**.
- **Windows (recommended)**. macOS is supported via AppleScript, but you may need to change the target app name in `src/core/scriptExecutor.js` if your InDesign version differs from `Adobe InDesign 2025`.

### Overview
InDesign MCP Server turns Adobe InDesign into a Model Context Protocol (MCP) provider with more than 135 production-grade tools. It gives AI agents and automation scripts fine-grained control over documents, pages, styles, graphics, exports, and the new advanced template workflows that power architecture and presentation projects.

### Highlights
- **Comprehensive Toolset:** 13 handler families covering document, page, style, graphics, export, book, and utility operations.
- **Advanced Template Orchestration:** `indesign-mcp-advanced` server exposes high-level master-page operations that respect slot labels and metadata.
- **AI-Friendly Design:** Responses are MCP-compliant, streaming-safe (stdout reserved for protocol), and include rich context for downstream reasoning.
- **Robust Error Handling:** Every handler guards against missing documents, invalid selections, and COM/AppleScript failures with clear diagnostics.
- **Session Intelligence:** Automatic page dimension tracking, smart placement defaults, and configurable overrides make agent workflows resilient.

### Quick Start
1. **Install dependencies (from the project root)**
   ```bash
   cd indesign-mcp-server
   npm install
   ```
   This pulls `winax` for Windows COM access; make sure you run it on Windows with InDesign installed.
2. **Launch the classic server**
   ```bash
   npm run start
   ```
   This starts `src/index.js`, which exposes 130+ atomic tools over MCP.
3. **Launch the advanced template server (optional)**
   ```bash
   node src/advanced/index.js
   ```
   The advanced server runs alongside the classic one and returns JSON payloads wrapped in MCP text responses for template orchestration.
4. **Smoke check (optional)**
   ```bash
   node scripts/quick_check.mjs   # prints tool count
   ```
   Or use `temp-run.mjs` / `temp-send.mjs` to send sample MCP messages to the advanced server.

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
└─ README.md          # Project-level documentation (see ./indesign-mcp-server/README.md)
```

### Contributing & License
- Follow the guidelines in `indesign-mcp-server/CONTRIBUTING.md` and existing conventional commit style (e.g., `feat: …`, `fix: …`).
- Run the required scenarios via `node tests/index.js --required` before opening a PR.
- Licensed under the terms listed in `indesign-mcp-server/LICENSE`.

### Support
If you run into issues, consult the handler-level docs in `indesign-mcp-server/docs/`, review the tests for usage samples, or open a GitHub issue with reproduction steps.

---

## 中文

### 前置条件
- **Adobe InDesign 桌面版**（2023–2025）。在 Windows 通过 COM ProgID（如 `InDesign.Application.2025`）连接，首次安装后请先启动一次 InDesign 以完成注册。
- **Node.js >= 18**。
- **Windows（推荐）**。macOS 走 AppleScript，若版本号不同需在 `src/core/scriptExecutor.js` 中调整目标应用名（默认 `Adobe InDesign 2025`）。

### 概览
InDesign MCP Server 将 Adobe InDesign 打造成一个 MCP 服务端，提供 135+ 项专业工具，实现从文档、页面到样式、图形、导出、图书管理的全链路自动化。新增的 `indesign-mcp-advanced` 模块可以让智能体按照母版脚本标签的说明，批量创建页面并填充模板槽位，尤其适合建筑方案汇报、品牌手册等需要高质量版式的场景。

### 核心亮点
- **工具覆盖全面：** 13 组处理器，涵盖文档、页面、样式、图形、导出、图书及通用工具。
- **高级模板编排：** 高级服务器会返回槽位名称、类型与脚本标签说明，智能体可严格遵循母版要求填充内容。
- **对 AI 友好：** 所有响应均符合 MCP 协议并通过 stderr 输出日志，避免干扰协议数据流。
- **健壮的错误处理：** 精准提示缺失文档、非法选择或 COM/AppleScript 异常，便于排查。
- **会话智能：** 自动记录页面尺寸、提供智能定位和 override 逻辑，让连续操作更可靠。

### 快速上手
1. **安装依赖（从项目根目录进入子目录）**
   ```bash
   cd indesign-mcp-server
   npm install
   ```
   需在已安装 InDesign 的 Windows 环境执行，以便正确安装 `winax`。
2. **启动经典服务器**
   ```bash
   npm run start
   ```
   对应 `src/index.js`，暴露 130+ 原子化工具。
3. **启动高级模板服务器（可选）**
   ```bash
   node src/advanced/index.js
   ```
   高级服务器与经典服务并行运行，返回 JSON 文本响应以支持模板编排。
4. **快速自检（可选）**
   ```bash
   node scripts/quick_check.mjs   # 输出工具总数
   ```
   也可使用 `temp-run.mjs` / `temp-send.mjs` 向高级服务器发送示例 MCP 消息。

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
└─ README.md          # 项目文档（详见 ./indesign-mcp-server/README.md）
```

### 贡献与许可
- 遵循 `indesign-mcp-server/CONTRIBUTING.md` 中的规范，使用项目现有的 Conventional Commit 风格提交。
- 在提交 PR 前执行 `node tests/index.js --required`，确保核心流程通过。
- 许可证信息见 `indesign-mcp-server/LICENSE`。

### 支持方式
如遇问题，可查阅 `indesign-mcp-server/docs/` 中的集成说明、测试用例或在 GitHub 上提交 Issue 并附复现步骤。

---

**Bring AI-driven precision to every InDesign project — 从智能母版到自动化版式，让创意与效率同步升级。**
