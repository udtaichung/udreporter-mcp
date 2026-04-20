## Why
- Agents 需要在原子化工作流中读取/更新页面元素的脚本标签，当前基础服务器缺少对应工具，必须降级为自写 ExtendScript。
- 脚本标签是高级模板流程的关键元数据，没有统一工具会造成 Classic/Advanced 两套服务器能力不对齐。

## What Changes
- 新增 get_page_item_script_labels 工具，可基于当前选区、pageIndex+itemIndex、pageNumber+objectId 或文档全量清单读取非空脚本标签。
- 新增 set_page_item_script_label 工具，可按照同样的定位模式批量覆盖脚本标签，写入前自动清空旧值。
- 在 page-items 能力下补充规范与任务，描述接口行为、定位规则与空标签过滤。

## Impact
- 无破坏性改动，页面元素管理能力扩展。
- 便于 Agent 在单一服务器内完成模板槽位与标签同步流程。
