(function () {
    // 原始数据
    const data = [
        { category: "Visual design", year: 2023, count: 2 },
        { category: "Visual design", year: 2024, count: 3 },
        { category: "Visual design", year: 2025, count: 1 },
        { category: "Painting", year: 2023, count: 12 },
        { category: "Painting", year: 2024, count: 14 },
        { category: "Painting", year: 2025, count: 20 },
        { category: "Video & Animation", year: 2023, count: 2 },
        { category: "Video & Animation", year: 2024, count: 12 },
        { category: "Video & Animation", year: 2025, count: 5 },
        { category: "Game", year: 2023, count: 0 },
        { category: "Game", year: 2024, count: 2 },
        { category: "Game", year: 2025, count: 1 }
    ];

    // 2. 设置图表尺寸和边距
    const margin = { top: 40, right: 40, bottom: 60, left: 150 };
    const chartWidth = 600 - margin.left - margin.right; // 内部绘图区域宽度
    const chartHeight = 400 - margin.top - margin.bottom; // 内部绘图区域高度

    const svgWidth = chartWidth + margin.left + margin.right;
    const svgHeight = chartHeight + margin.top + margin.bottom;

    // 3. 创建 SVG 容器
    const svg = d3.select("#vis-scatterplot")
        .append("svg")
        .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`) // 响应式 viewBox
        .attr("preserveAspectRatio", "xMidYMid meet")
        .style("width", "100%") // 确保 SVG 宽度适应父容器
        .style("height", "auto") // 高度自适应
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // 4. 定义比例尺
    // X 轴比例尺 (年份)
    const years = ["2023", "2024", "2025"]; // 确保是字符串，与数据中的 year 匹配
    const xScale = d3.scaleBand()
        .domain(years)
        .range([0, chartWidth])
        .paddingInner(0.5); // 内部填充

    // 提取所有唯一的类别
    const uniqueCategories = Array.from(new Set(data.map(d => d.category)));

    // 计算每个类别的总数量
    const categoryTotals = {};
    uniqueCategories.forEach(cat => {
        categoryTotals[cat] = d3.sum(data.filter(d => d.category === cat), d => d.count);
    });

    // Y 轴比例尺 (作品类别) - domain 将在 updateChart 函数中设置
    const yScale = d3.scaleBand()
        .range([chartHeight, 0]) // Y 轴从下到上
        .paddingInner(0.5); // 内部填充

    // 为了计算 `maxRadiusAllowed`，需要先临时设置 `yScale` 的 domain 来获取 `bandwidth`
    // `bandwidth` 的值在类别数量不变的情况下是固定的，与排序无关
    yScale.domain(uniqueCategories);
    const maxRadiusAllowed = yScale.bandwidth() / 2 - 1; // 减去1作为安全边距
    yScale.domain([]); // 清空 domain，将在 updateChart 中重新设置

    // 圆点半径比例尺 (作品数量)
    const radiusScale = d3.scaleSqrt() // 使用平方根比例尺，使面积与数量成比例
        .domain([0, d3.max(data, d => d.count)]) // 数量从 0 到最大值
        .range([5, maxRadiusAllowed]); // 半径范围 5 到计算出的最大值

    // 颜色比例尺 (按类别)
    const colorScale = d3.scaleOrdinal()
        .domain(uniqueCategories) // 类别作为域
        .range(d3.schemeCategory10); // 使用 D3 内置的颜色方案

    // 5. 绘制 X 轴 (静态部分，不随排序改变)
    const xAxis = d3.axisBottom(xScale);
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(xAxis);

    // X 轴标题 (静态)
    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "middle")
        .attr("x", chartWidth / 2)
        .attr("y", chartHeight + margin.bottom - 10)
        .text("Year");

    // 6. 绘制 Y 轴 (动态部分，需要更新)
    // 先创建一个 Y 轴的 G 元素，后续通过 updateChart 更新其内容
    const yAxisGroup = svg.append("g")
        .attr("class", "y axis");

    // Y 轴标题 (静态)
    svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "middle")
        .attr("x", -chartHeight / 2)
        .attr("y", -margin.left + 30) // 调整位置
        .attr("transform", "rotate(-90)")
        .text("Type of work");

    // 7. 绘制散点 (初始创建，后续通过 updateChart 更新其位置)
    const tooltip = d3.select("#tooltip");

    const circles = svg.selectAll("circle")
        .data(data, d => d.category + "-" + d.year) // 使用 key function 确保数据绑定正确，以便 D3 识别和过渡元素
        .enter()
        .append("circle")
        .attr("cx", d => xScale(String(d.year)) + xScale.bandwidth() / 2)
        .attr("r", d => radiusScale(d.count))
        .attr("fill", d => colorScale(d.category))
        .attr("opacity", 0.7)
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .on("mouseover", function (event, d) {
            // 显示提示框
            tooltip.style("visibility", "visible")
                .html(`Type: ${d.category}<br>Year: ${d.year}<br>Count: ${d.count}`);
            // 高亮当前圆点
            d3.select(this).attr("stroke", "red").attr("stroke-width", 2);
        })
        .on("mousemove", function (event) {
            // 更新提示框位置
            tooltip.style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function () {
            // 隐藏提示框
            tooltip.style("visibility", "hidden");
            // 恢复圆点样式
            d3.select(this).attr("stroke", "black").attr("stroke-width", 1);
        });

    /**
     * 根据总数量对类别进行排序
     * @param {string} order 'asc' 为升序，'desc' 为降序
     * @returns {Array<string>} 排序后的类别数组
     */
    function sortCategoriesByTotal(order) {
        const sortedCategories = [...uniqueCategories]; // 复制一份，避免修改原始数组
        sortedCategories.sort((a, b) => {
            const totalA = categoryTotals[a];
            const totalB = categoryTotals[b];
            if (order === 'asc') {
                return totalA - totalB;
            } else { // 'desc'
                return totalB - totalA;
            }
        });
        return sortedCategories;
    }

    /**
     * 更新图表，包括 Y 轴和散点的位置
     * @param {Array<string>} newCategoryOrder 排序后的类别数组
     */
    function updateChart(newCategoryOrder) {
        // 更新 Y 轴比例尺的 domain
        yScale.domain(newCategoryOrder);

        // 转换 Y 轴
        yAxisGroup
            .transition()
            .duration(750) // 动画持续时间
            .call(d3.axisLeft(yScale));

        // 转换圆点的位置
        circles
            .transition()
            .duration(750) // 动画持续时间
            .attr("cy", d => yScale(d.category) + yScale.bandwidth() / 2);
    }

    // 初始绘制：使用默认的类别顺序（即 uniqueCategories 数组的自然顺序）
    // 如果想要默认按降序排列，可以调用 updateChart(sortCategoriesByTotal('desc'));
    updateChart(uniqueCategories);

    // 绑定排序按钮事件
    d3.select("#sortAscBtn").on("click", () => {
        const sorted = sortCategoriesByTotal('asc');
        updateChart(sorted);
    });

    d3.select("#sortDescBtn").on("click", () => {
        const sorted = sortCategoriesByTotal('desc');
        updateChart(sorted);
    });

})();