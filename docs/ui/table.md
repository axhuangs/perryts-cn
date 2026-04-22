# 表格

`Table` 小部件显示带有列、标题和行选择的表格数据。

## 创建表格

```typescript
import { Table } from "perry/ui";

const table = Table(10, 3, (row, col) => {
  return `Row ${row}, Col ${col}`;
});
```

`Table(rowCount, colCount, renderCell)` 创建一个表格。渲染函数为每个单元格调用，应返回文本内容。

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

## 列宽度

```typescript
table.setColumnWidth(0, 150);  // Name column
table.setColumnWidth(1, 250);  // Email column
table.setColumnWidth(2, 100);  // Role column
```

## 行选择

```typescript
table.setOnRowSelect((row) => {
  console.log(`Selected row: ${row}`);
});

// 获取当前选定的行
const selected = table.getSelectedRow();
```

## 动态行数

创建后更新行数：

```typescript
table.updateRowCount(newCount);
```

## 平台说明

| Platform | Implementation |
|----------|---------------|
| macOS | NSTableView + NSScrollView |
| Web | HTML `<table>` |
| iOS/Android/Linux/Windows | Stubs (pending native implementation) |

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

## 下一步

- [Widgets](widgets.md) — 所有可用的小部件
- [Layout](layout.md) — 布局容器
- [Events](events.md) — 事件处理