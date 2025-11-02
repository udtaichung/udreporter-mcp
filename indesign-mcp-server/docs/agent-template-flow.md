# AI Agent 模板制作流程图

```mermaid
flowchart TD
    A[开始\nAI Agent 接到“生成某页演示内容”的指令] --> B{是否需要了解模板库现状？}
    B -- 是 --> B1[调用 list_template_blueprints\n列出所有母版模板（名称、槽位数量、用途说明）]
    B -- 否 --> C[已有特定模板需求]

    B1 --> C

    C[挑选候选模板\n例如 A-封面 / G-案例图文页] --> D[调用 inspect_template_blueprint\n获取该模板的槽位、尺寸、PageNotes 说明]
    D --> E[结合业务数据整理填充内容\n准备 {槽位名: 文本/图片路径} 映射]

    E --> F[调用 create_page_with_template\n新建页面并套用选定母版\n返回页面索引 p]
    F --> G[调用 override_template_slots\n对页面 p 的模板元素执行 override（全部或指定槽位）]

    G --> H[调用 fill_page_slots\n向页面 p 的槽位写入文本/图片\n可设置 clearExisting、fit 等参数]
    H --> I{是否需要检查结果？}

    I -- 是 --> I1[调用 summarize_page_slots\n查看页面 p 当前槽位填充情况（文本预览、图片链接）]
    I1 --> J{是否需要调整？}

    I -- 否 --> K[跳过检查]

    J -- 是 --> J1[调用 clear_page_slot_overrides（可选）\n重置指定槽位后回到 G 或 H]
    J1 --> G
    J -- 否 --> L[完成本页制作]

    K --> L
    L --> M{是否还有其他页面待生成？}
    M -- 是 --> C
    M -- 否 --> N[流程结束\n提交或导出 InDesign 文档]
```
