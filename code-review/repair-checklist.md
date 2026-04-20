# 待修复工具清单

以下整理自 Codex 复查，与 Grok 结果存在差异的工具均为可复现缺陷，建议开发优先处理。

## 内容工具（content）
- create_text_frame（src/handlers/textHandlers.js:53；src/core/scriptExecutor.js:115）
- edit_text_frame（src/handlers/textHandlers.js:176）
- create_table（src/handlers/textHandlers.js:251）
- populate_table（src/handlers/textHandlers.js:312）
- create_rectangle（src/handlers/graphicsHandlers.js:45）
- create_ellipse（src/handlers/graphicsHandlers.js:138）
- create_polygon（src/handlers/graphicsHandlers.js:209）
- place_image（src/handlers/graphicsHandlers.js:287）
- get_image_info（src/handlers/graphicsHandlers.js:550）
- apply_object_style（src/handlers/graphicsHandlers.js:494）
- apply_paragraph_style（src/handlers/styleHandlers.js:169）
- apply_character_style（src/handlers/styleHandlers.js:207）
- apply_color（src/handlers/styleHandlers.js:423）

缺陷说明：上述工具在 ScriptExecutor 将 `userInteractionLevel` 设为 `NEVER_INTERACT` 时 `app.activeWindow` 为空，全部回退到 `doc.pages[0]`，只能操作第一页。

额外说明：`create_color_swatch` 已使用正确的 RGB→CMYK 转换逻辑，无需修复。

## 文档工具（document）
- validateDocument（src/handlers/documentHandlers.js:1357-1387）
- cleanupDocument（src/handlers/documentHandlers.js:1403-1435）

缺陷说明：`validateDocument` 忽略 `checkImages`、`checkStyles`；`cleanupDocument` 仅统计未实际删除对象，且忽略 `removeUnusedLayers` / `removeHiddenElements` 参数。

原判定 `setDocumentPreferences` / `setDocumentGridSettings` / `setDocumentLayoutPreferences` 中的 UnitValue/字符串问题不存在。

## 页面与页项目工具
- setPageItemProperties（src/handlers/pageItemHandlers.js:157-166）**（已修复）**

缺陷说明：将颜色名直接插入模板字符串，生成 `if (Blue !== undefined)` 等非法语句，首次调用即抛 ReferenceError，应在 JS 侧预先转义并注入字符串常量。已在 handler 中使用 JSON.stringify 转义颜色名并统一处理布尔/数值参数，返回更友好的错误信息。

## 版面（Spread）工具
- placeFileOnSpread（src/handlers/spreadHandlers.js:229-243）**（已修复）**
- placeXmlOnSpread（src/handlers/spreadHandlers.js:260-277）**（已修复）**

缺陷说明：两个工具都固定在 `sp.pages[0]` 上放置内容，多页跨面时右页或后续页无法处理。已新增 `pageIndexWithinSpread` 参数并在 ExtendScript 中进行页索引校验。

## Master Spread 工具
- createMasterSpread（src/handlers/masterSpreadHandlers.js:20-33）

缺陷说明：无需修复。Grok 误判，当前实现已对 name/namePrefix/baseName 进行赋值。

## 其他说明
- Utility / Export / Layer 工具未发现新问题。


## 自动化测试

- 新增 `tests/tool-suite/run-all-tools.js`，自动遍历 120+ 工具并写入日志 `tests/tool-suite/logs/*.json`。
- 针对跨页工具的回归脚本 `tests/regression/test-cross-page-tools.js` 可独立运行验证核心修复。
