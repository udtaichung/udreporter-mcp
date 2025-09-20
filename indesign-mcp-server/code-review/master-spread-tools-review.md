# 主版面管理工具代码审查

## 概述

主版面管理工具包含主版面的创建、编辑、应用和管理功能，共计11个工具。

## 工具审查结果

### ✅ 通过的工具

#### 主版面基本操作
- **listMasterSpreads**: 实现正确，显示完整的版面信息
- **deleteMasterSpread**: 实现正确，包含索引验证
- **duplicateMasterSpread**: 实现正确，支持多种位置选项
- **applyMasterSpread**: 实现正确，支持页面范围应用
- **getMasterSpreadInfo**: 实现正确，显示详细的版面信息

#### 主版面内容创建
- **createMasterTextFrame**: 实现正确，支持字体和对齐设置
- **createMasterRectangle**: 实现正确，支持颜色和描边设置
- **createMasterGuides**: 实现正确，支持行列和边距设置

#### 主版面覆盖管理
- **detachMasterItems**: 实现正确，支持单个和批量分离
- **removeMasterOverride**: 实现正确，通过删除项目恢复主版面

**GPT5复查异议：**

- 工具契约不一致问题：实现与工具定义（src/types/toolDefinitionsMasterSpread.js）存在偏差。
  - `deleteMasterSpread`/`duplicateMasterSpread`/`getMasterSpreadInfo` 等处理器以索引（masterIndex）为主要参数，而工具定义分别要求以名称（name/newName 等）为主键。该不一致会导致通过 MCP 工具层调用时参数对不上，建议统一为与工具定义一致的命名参数，或同步更新工具定义。
- `createMasterGuides` 单位与类型处理：当前实现将 `rowGutter`/`columnGutter` 作为字符串直接传入，并未使用 `UnitValue("<mm>")` 明确单位；同时 `guideColor` 在实现中以数组字面量（如 `[0,0,255]`）拼入，而工具定义描述为字符串（UI 颜色名或逗号分隔 RGB）。建议：
  - 与页面/跨页同类实现保持一致，使用 `UnitValue("<mm>")` 指定毫米单位，避免环境首选项差异带来的单位歧义；
  - 统一 `guideColor` 的入参与拼接方式，确保与工具定义描述一致（字符串 UI 名称或标准化的 RGB 输入）。

### ❌ 有问题的工具

#### 主版面创建工具
- **createMasterSpread**: ❌ **有严重错误**

**问题描述：**
方法接收了name、namePrefix、baseName参数但没有使用它们，主版面创建后无法设置这些属性。

**错误代码片段：**
```javascript
static async createMasterSpread(args) {
    const { name, namePrefix, baseName, showMasterItems = true } = args;
    // ... 参数转义代码 ...
    const script = [
        'if (app.documents.length === 0) {',
        '  "No document open";',
        '} else {',
        '  var doc = app.activeDocument;',
        '  var masterSpread = doc.masterSpreads.add();',  // 未使用参数
        '  masterSpread.showMasterItems = ${showMasterItems};',
        '  "Master spread created successfully: " + masterSpread.name;',
        '}'
    ].join('\n');
    // ...
}
```

**正确实现应该：**
```javascript
const script = [
    'if (app.documents.length === 0) {',
    '  "No document open";',
    '} else {',
    '  var doc = app.activeDocument;',
    '  var masterSpread = doc.masterSpreads.add();',
    `  masterSpread.name = "${escapedName}";`,
    `  masterSpread.namePrefix = "${escapedNamePrefix}";`,
    `  masterSpread.baseName = "${escapedBaseName}";`,
    `  masterSpread.showMasterItems = ${showMasterItems};`,
    '  "Master spread created successfully: " + masterSpread.name;',
    '}'
].join('\n');
```

**影响：**
- 主版面名称无法自定义
- 主版面前缀和基础名称无法设置
- 用户无法创建具有特定名称的主版面

## 总结

- **通过工具**: 10个 (90.9%)
- **有问题工具**: 1个 (9.1%)
- **主要问题**: 主版面创建时忽略了关键的命名参数

建议修复 `createMasterSpread` 工具，确保正确使用name、namePrefix和baseName参数。

**codex复查总结**: GPT 结论与当前实现不符, createMasterSpread 支持全部命名参数, 需纠正。
