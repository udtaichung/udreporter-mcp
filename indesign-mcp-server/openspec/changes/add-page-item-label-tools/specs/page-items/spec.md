## ADDED Requirements
### Requirement: Manage Script Labels On Page Items
Page items MUST expose non-empty script labels and allow overwriting them through supported targeting modes.
#### Scenario: Read labels from targeted items
- **GIVEN** 文档中存在已设置脚本标签的页面元素
- **WHEN** 调用 `get_page_item_script_labels` 并提供任意受支持的定位方式（`CURRENT_SELECTION`、`PAGE_ITEM`、`PAGE_NUMBER_AND_OBJECT_ID`）
- **THEN** 返回数组条目，包含 `pageIndex`、`pageNumber`、`pageName`、`itemIndex`、`objectId`、`itemType`、`layerName` 与 `label`
- **AND** 过滤掉标签为空的元素。

#### Scenario: Sweep all labelled page items
- **GIVEN** 文档被成功打开
- **WHEN** `mode` 设为 `ALL_WITH_LABELS`
- **THEN** 返回文档内所有非空脚本标签元素的同字段清单。

#### Scenario: Update labels for current selection
- **GIVEN** 当前选区包含一个或多个页面元素
- **WHEN** 调用 `set_page_item_script_label` 并传入目标标签值
- **THEN** 每个选中元素的旧标签被清空并替换为新值
- **AND** 响应内给出 `updatedCount` 与成功更新的 `objectIds`。

#### Scenario: Update label by identifiers
- **GIVEN** 提供了有效的 `pageNumber`（文档偏移 + 1）与 `objectId`
- **WHEN** 调用 `set_page_item_script_label`
- **THEN** 指定对象的脚本标签被覆盖，响应返回更新结果。
