(function () {
const headers = ["GE2413", "SM2702", "SM2706", "SM2105", "SM3601", "SM3612"];
// 邻接矩阵的数据，每个对象代表一行，包含行标签和对应的数值数组
const matrixData = [
    { rowLabel: "GE2413", values: [0, 0, 0, 0, 0, 0] },
    { rowLabel: "SM2702", values: [1, 0, 1, 1, 0, 0] },
    { rowLabel: "SM2706", values: [0, 0, 0, 0, 0, 0] },
    { rowLabel: "SM2105", values: [0, 0, 0, 0, 0, 1] },
    { rowLabel: "SM3601", values: [0, 0, 0, 0, 0, 1] },
    { rowLabel: "SM3612", values: [0, 0, 0, 0, 0, 0] }
];

// 为表头单元格定义一组不同的颜色
const headerColors = [
    "#87CEEB", // 淡粉色
    "#4682B4", // 粉蓝色
    "#FF8C00", // 淡绿色
    "#FFD700", // 金色
    "#c79eedff", // 浅橙色
    "#32CD32"  // 淡紫色
];

// 2. 选择容器
// 选中 HTML 中 id 为 "vis-matrix" 的 section 元素
const container = d3.select("#vis-matrix");

// 3. 创建表格结构
// 在容器内添加一个 <table> 元素
const table = container.append("table");
// 添加表格头部 <thead>
const thead = table.append("thead");
// 添加表格主体 <tbody>
const tbody = table.append("tbody");

// 4. 绘制表头行 (<thead>)
// 在 <thead> 中添加一个 <tr> 元素作为表头行
const headerRow = thead.append("tr");

// 添加左上角的空单元格
headerRow.append("th")
    .text("") // 留空
    .style("background-color", "#f2f2f2"); // 给予一个中性背景色

// 绑定列标题数据，并为每个列标题创建 <th> 单元格
headerRow.selectAll("th.col-header") // 使用类选择器以避免与第一个空 th 冲突
    .data(headers)
    .enter()
    .append("th")
    .attr("class", "header-cell col-header") // 添加通用 header-cell 类和 col-header 类
    .text(d => d) // 设置单元格文本为标题
    .style("background-color", (d, i) => headerColors[i]); // 根据索引应用不同的背景色

// 5. 绘制表格主体行 (<tbody>)
// 绑定 matrixData 到 <tbody> 中的 <tr> 元素
const rows = tbody.selectAll("tr")
    .data(matrixData)
    .enter()
    .append("tr");

// 为每一行添加行标题 (<th>)
rows.append("th")
    .attr("class", "header-cell row-header") // 添加通用 header-cell 类和 row-header 类
    .text(d => d.rowLabel) // 设置单元格文本为行标签
    .style("background-color", (d, i) => headerColors[i]); // 根据索引应用不同的背景色

// 为每一行添加数据单元格 (<td>)
rows.selectAll("td")
    .data(d => d.values) // 绑定当前行的数据值数组
    .enter()
    .append("td")
    .text(d => d) // 设置单元格文本为数据值
    .attr("class", d => d === 1 ? "highlight-one" : null);
})();