# 表格（Table）

`Table` 组件用于展示带列、表头和行选择功能的表格数据。

## 创建表格

```typescript
import { Table } from "perry/ui";

const table = Table(10, 3, (row, col) => {
  return `Row ${row}, Col ${col}`;
});
```

`Table(rowCount, colCount, renderCell)` 方法用于创建表格。渲染函数会为每个单元格调用，需返回单元格的文本内容。

## 列标题

```typescript
const table = Table(100, 3, (row, col) => {
  const data = [
    ["Alice", "alice@example.com", "Admin"],
    ["Bob", "bob@example.com", "User"],
    // ...
  ];
  return data[row]?.[col] ?? "";
});

table.setColumnHeader(0, "Name");
table.setColumnHeader(1, "Email");
table.setColumnHeader(2, "Role");
```

`setColumnHeader` 方法用于设置列标题，示例中分别为第0、1、2列设置了“姓名”“邮箱”“角色”相关的英文标题（标识符不翻译）。

## 列宽

```typescript
table.setColumnWidth(0, 150);  // Name column
table.setColumnWidth(1, 250);  // Email column
table.setColumnWidth(2, 100);  // Role column
```

`setColumnWidth` 方法用于设置列宽，示例中分别为姓名列（第0列）设置150像素宽度、邮箱列（第1列）设置250像素宽度、角色列（第2列）设置100像素宽度。

## 行选择

```typescript
table.setOnRowSelect((row) => {
  console.log(`Selected row: ${row}`);
});

// Get the currently selected row
const selected = table.getSelectedRow();
```

`setOnRowSelect` 方法用于设置行选择事件回调函数，当行被选中时触发；`getSelectedRow` 方法用于获取当前选中的行。

## 动态行数量

创建表格后更新行数量的方法：

```typescript
table.updateRowCount(newCount);
```

`updateRowCount` 方法接收新的行数参数 `newCount`，用于动态更新表格的行数量。

## 平台说明

| 平台       | 实现方式                          |
|------------|-----------------------------------|
| macOS      | NSTableView + NSScrollView        |
| Web        | HTML `<table>`                    |
| iOS/Android/Linux/Windows | 占位实现（待原生功能开发完成） |

## 完整示例

```typescript
import { App, Table, Text, VStack, State } from "perry/ui";

const selectedName = State("None");

const users = [
  { name: "Alice", email: "alice@example.com", role: "Admin" },
  { name: "Bob", email: "bob@example.com", role: "Editor" },
  { name: "Charlie", email: "charlie@example.com", role: "Viewer" },
  { name: "Diana", email: "diana@example.com", role: "Admin" },
  { name: "Eve", email: "eve@example.com", role: "Editor" },
];

const table = Table(users.length, 3, (row, col) => {
  const user = users[row];
  if (col === 0) return user.name;
  if (col === 1) return user.email;
  return user.role;
});

table.setColumnHeader(0, "Name");
table.setColumnHeader(1, "Email");
table.setColumnHeader(2, "Role");
table.setColumnWidth(0, 150);
table.setColumnWidth(1, 250);
table.setColumnWidth(2, 100);

table.setOnRowSelect((row) => {
  selectedName.set(users[row].name);
});

App({
  title: "Table Demo",
  width: 600,
  height: 400,
  body: VStack(12, [
    table,
    Text(`Selected: ${selectedName.value}`),
  ]),
});
```

## 后续参考

- [Widgets](widgets) — 所有可用组件
- [Layout](layout) — 布局容器
- [Events](events) — 事件处理