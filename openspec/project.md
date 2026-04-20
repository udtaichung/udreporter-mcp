# 项目上下文

## 目的
InDesign MCP Server 将 Adobe InDesign 转变为 Model Context Protocol (MCP) 服务提供者，为建筑、室内设计事务所提供 135+ 专业自动化工具。核心目标是实现演示文稿、分析图、品牌手册等高质量排版任务的智能化，让 AI 智能体能够精确控制文档、页面、样式、图形和导出流程。

**双服务器架构：**
- **经典服务器** (`src/index.js`)：提供原子级工具，涵盖文档管理、文本/图形创建、样式控制、导出等 13 个处理器家族
- **高级模板服务器** (`src/advanced/index.js`)：提供母版页编排能力，按照脚本标签智能填充槽位，适合建筑方案汇报等复杂模板场景

## 技术栈
- **运行时：** Node.js ≥18，ES Modules（显式 `.js` 扩展名）
- **核心依赖：**
  - `@modelcontextprotocol/sdk` (^0.5.0) - MCP 协议实现
  - `winax` (^3.6.2) - Windows COM 自动化桥接
- **构建：** 无需转译，直接运行源码
- **平台：** Windows + Adobe InDesign（COM 自动化要求）

## 项目约定

### 代码风格
- **模块系统：** ES Modules，所有导入必须包含 `.js` 扩展名
- **缩进：** 4 空格（非 Tab）
- **分号：** 必须使用
- **命名约定：**
  - 类名：`PascalCase`（如 `DocumentHandlers`）
  - 函数名：`camelCase`（如 `createTextFrame`）
  - 工具名：与 `types/toolDefinitions*.js` 中的定义严格对齐
- **日志规范：** 所有日志输出到 `stderr`（绝不使用 `stdout`，以保护 MCP 协议数据流）
- **质量检查：** 提交前运行 `node --check` 或 ESLint 验证语法

### 架构模式
**模块化分层结构：**
```
src/
├── core/                    # MCP 运行时核心
│   ├── InDesignMCPServer    # 服务器主类
│   ├── SessionManager       # 会话状态管理
│   └── ScriptExecutor       # COM/AppleScript 执行器
├── handlers/                # 按功能分组的 13 个处理器
│   ├── documentHandlers.js  # 文档生命周期
│   ├── pageHandlers.js      # 页面创建与布局
│   ├── textHandlers.js      # 文本框与段落样式
│   ├── graphicsHandlers.js  # 图像与路径处理
│   ├── styleHandlers.js     # 样式管理（段落/字符/对象）
│   ├── exportHandlers.js    # PDF/IDML/图片导出
│   ├── bookHandlers.js      # 图书与章节管理
│   └── ...                  # 其他 6 个处理器
├── types/                   # 工具元数据与 JSON Schema
│   └── toolDefinitions*.js  # 按处理器拆分的工具定义
├── utils/                   # 共享工具函数
│   └── stringUtils.js       # 字符串操作辅助
└── advanced/                # 高级模板服务器（独立运行）
```

**设计原则：**
- **单一职责：** 每个处理器只负责一类能力（如 `pageHandlers` 仅管理页面）
- **复用优先：** 共享逻辑抽取到 `utils/`，避免跨处理器重复代码
- **全局一致：** 所有工具返回 MCP 标准响应格式，错误信息包含清晰的诊断上下文
- **最小联动：** 处理器间通过 InDesign COM 对象交互，避免直接依赖其他处理器内部状态

### 测试策略
**场景驱动测试：**
- **测试入口：** `tests/index.js` - 运行 `node tests/index.js [--required|--help]`
- **套件分级：**
  - 必需套件（`--required`）：连接性、文档创建、网格布局等核心流程
  - 可选套件：高级模板、复杂样式、批量导出等扩展场景
- **覆盖要求：**
  - 每个新处理器必须在 `tests/test-*.js` 中添加至少一个场景
  - 在 `tests/index.js` 中注册该场景的覆盖报告
- **资源管理：** 测试数据放在 `tests/test-data.csv`，避免硬编码客户资产路径
- **提交前验证：** 所有 PR 必须通过 `node tests/index.js --required`

### Git 工作流
**提交规范：** Conventional Commits
- 格式：`<type>: <summary>`（主题 <72 字符）
- 示例：
  - `feat: add master spread slot inspection tools`
  - `fix: correct page dimension tracking in session manager`
  - `refactor: improve script execution and session management`
  - `docs: surface bilingual readme at root`
- **PR 检查清单：**
  1. 简洁的变更概述
  2. 关联的 Issue 或 MCP 需求编号
  3. 复现步骤或工具调用示例
  4. 截图/日志摘录（如涉及 InDesign 面板或提示）
  5. 手动测试命令记录，便于审阅者重现

**分支策略：**
- 主分支：`master`
- 功能分支：`feature/<change-id>` 或 `fix/<issue-number>`
- 严禁直接向 `master` 推送未经测试的代码

## 领域上下文
**目标用户：** 建筑师 @龙潇 及设计事务所团队

**业务场景：**
1. **演示文稿自动化：** 从项目数据（CSV/JSON）批量生成建筑方案汇报 PPT，包含封面、分析图、平面图、效果图等
2. **母版槽位编排：** 使用脚本标签定义的母版页模板（如 `slot:title|type:text|instruction:项目名称`），AI 智能体严格按规则填充内容
3. **分析图生成：** 动态创建用地分析、交通流线、日照分析等专业图表，支持图层控制与样式继承
4. **品牌手册排版：** 自动应用段落样式、字符样式、对象样式，确保全局视觉一致性

**专业术语映射：**
- **母版页 (Master Spread)：** 定义页面模板的基础布局与占位符
- **槽位 (Slot)：** 母版页中通过脚本标签标记的可填充区域
- **对象样式 (Object Style)：** 应用于图形框架、文本框架的预设样式
- **IDML：** InDesign 标记语言，用于跨版本兼容或程序化编辑

## 重要约束
1. **平台限制：** 仅支持 Windows 平台，需安装 Adobe InDesign 并在同一用户会话下运行
2. **COM 依赖：** 使用 `winax` 进行 COM 自动化，贡献者必须在 Windows + InDesign 环境中验证变更
3. **协议安全：** `stdout` 完全保留给 MCP 协议，禁止输出任何调试信息或数据（使用 `stderr`）
4. **文件结构规范：** 新建文件必须归类到对应文件夹（handlers/、types/、utils/ 等），严禁随意存放
5. **隐私保护：** 测试和日志中禁止包含真实客户文档内容或资产路径，使用匿名化示例

## 外部依赖
1. **Adobe InDesign：** COM 自动化目标应用，需保持运行状态
2. **MCP 客户端：** Claude Desktop 或其他支持 MCP 的 AI 客户端，通过 stdio 通信
3. **操作系统服务：**
   - Windows COM Runtime（`winax` 调用）
   - 文件系统访问（模板读取、导出输出）
4. **可选服务：**
   - 图像处理库（如需在 InDesign 外预处理图片）
   - 数据源（CSV、JSON、数据库）用于批量文档生成

## 开发工作流快速参考
```bash
# 安装依赖
npm install

# 启动经典服务器（135+ 原子工具）
npm run start
# 或 Windows 批处理（自动设置工作目录）
start-indesign-mcp.bat

# 启动高级模板服务器（母版编排）
node src/advanced/index.js

# 调试模式（Chrome DevTools 或 VS Code）
npm run dev

# 运行必需测试套件
node tests/index.js --required

# 查看测试帮助
node tests/index.js --help
```
