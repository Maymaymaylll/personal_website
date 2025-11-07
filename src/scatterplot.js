(function () {
    // 原始数据
    const creativeData = [
        // 2021
        { year: 2021, type: "paintings", count: 15 },
        { year: 2021, type: "videos", count: 5 },
        { year: 2021, type: "games", count: 1 },

        // 2022
        { year: 2022, type: "paintings", count: 20 },
        { year: 2022, type: "videos", count: 8 },

        // 2023
        { year: 2023, type: "videos", count: 12 },
        { year: 2023, type: "games", count: 3 },

        // 2024
        { year: 2024, type: "paintings", count: 10 },
        { year: 2024, type: "games", count: 5 },
    ];

    // 1. 数据过滤 (Data filtering)
    // 过滤出2021年及以后的数据
    const filteredData = creativeData.filter(d => d.year >= 2021);

    // 计算每种作品类型的总数，用于排序
    const typeTotalCounts = {};
    filteredData.forEach(d => {
        typeTotalCounts[d.type] = (typeTotalCounts[d.type] || 0) + d.count;
    });

    // 获取所有独特的作品类型，用于颜色比例尺，确保颜色一致性
    // 明确列出所有类型，以保证颜色映射的顺序和一致性
    const allUniqueWorkTypes = ["paintings", "videos", "games"];

    // 2. 设置尺寸 (Set dimensions)
    const margin = { top: 30, right: 75, bottom: 65, left: 80 };
    const targetPlotWidth = 550; // 调整为550px，以减少总宽度
    const width = targetPlotWidth;
    const height = 450 - margin.top - margin.bottom;
    const svgWidth = width + margin.left + margin.right; // 550 + 100 + 40 = 690px
    const svgHeight = height + margin.top + margin.bottom;

    // 3. 添加SVG (Add SVG)
    // 选择DOM中的 #vis-scatterplot 元素，并添加SVG容器
    const svg = d3.select("#vis-scatterplot")
        .append("svg")
        .attr("width", svgWidth) // 设置SVG元素的宽度
        .attr("height", svgHeight) // 设置SVG元素的高度
        .append("g") // 添加一个g元素，用于容纳图表内容，并通过margin进行偏移
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // 4. 定义比例尺 (Define scales)

    // X 比例尺 (年份)
    // 使用线性比例尺，将年份映射到SVG的X坐标
    const minYear = 2020;
    const axisMaxYear = 2025;
    const xScale = d3.scaleLinear()
        .domain([minYear, axisMaxYear]) // 数据域：年份范围
        .range([0, width]); // 输出范围：SVG的X坐标范围

    // Y 比例尺 (工作类型)
    // 使用序数带状比例尺，将作品类型映射到SVG的Y坐标
    // 初始Y轴顺序：从下到上为 "games", "paintings", "videos"
    // 由于 range 是 [height, 0]，这意味着 domain 的第一个元素映射到 height (底部)，最后一个映射到 0 (顶部)。
    const initialYAxisOrder = ["games", "paintings", "videos"]; // 调整顺序以实现从下到上 games, paintings, videos
    let currentYAxisOrder = initialYAxisOrder; // 跟踪当前的Y轴顺序

    const yScale = d3.scaleBand()
        .domain(currentYAxisOrder) // 初始数据域：作品类型顺序
        .range([height, 0]) // 输出范围：SVG的Y坐标范围 (从底部到顶部)
        .padding(1); // 元素之间的间距

    // R 比例尺 (数量)
    // 使用平方根比例尺，将作品数量映射到气泡的半径
    const maxCount = d3.max(filteredData, d => d.count);
    const rScale = d3.scaleSqrt()
        .domain([0, maxCount]) // 数据域：数量范围
        .range([2, 25]); // 输出范围：气泡半径范围

    // 颜色比例尺 (Color scale)
    // 使用序数比例尺，为每种作品类型分配一个颜色
    const colorScale = d3.scaleOrdinal()
        .domain(allUniqueWorkTypes) // 数据域：所有独特的作品类型
        .range(["#1f77b4", "#ff7f0e", "#2ca02c"]); // 输出范围：颜色数组

    // 5. 绘制坐标轴 (Draw axes)

    // X 轴
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0, ${height})`) // 将X轴移动到底部
        .call(d3.axisBottom(xScale) // 创建底部X轴
            .tickFormat(d3.format("d")) // 刻度标签格式化为整数
            .tickValues(d3.range(minYear, axisMaxYear + 1)) // 设置刻度值
        )
        .append("text") // 添加X轴标签
        .attr("y", 40)
        .attr("x", width / 2)
        .attr("fill", "#000")
        .style("text-anchor", "middle")
        .text("年份");

    // Y 轴
    const yAxisGroup = svg.append("g") // 创建Y轴的g元素，并保存引用以便后续更新
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale)); // 创建左侧Y轴

    yAxisGroup.append("text") // 添加Y轴标签
        .attr("transform", "rotate(-90)") // 旋转标签
        .attr("y", -margin.left + 20) // 调整标签位置
        .attr("x", -height / 2)
        .attr("dy", "1em")
        .attr("fill", "#000")
        .style("text-anchor", "middle")

    // 6. 工具提示 (Tooltip)
    // 创建一个 div 元素作为工具提示
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip");

    // 鼠标事件处理函数：鼠标移入
    const mouseover = function (event, d) {
        tooltip.style("opacity", 1); // 显示工具提示
        d3.select(this) // 选中当前气泡
            .attr("stroke", "darkred") // 改变边框颜色
            .attr("stroke-width", 3); // 改变边框宽度
    };

    // 鼠标事件处理函数：鼠标移动
    const mousemove = function (event, d) {
        tooltip
            .html(`year: <strong>${d.year}</strong><br>type: <strong>${d.type}</strong><br>count: <strong>${d.count}</strong>`) // 设置工具提示内容
            .style("left", (event.pageX + 15) + "px") // 设置工具提示的X位置
            .style("top", (event.pageY - 28) + "px"); // 设置工具提示的Y位置
    };

    // 鼠标事件处理函数：鼠标移出
    const mouseleave = function (event, d) {
        tooltip.style("opacity", 0); // 隐藏工具提示
        d3.select(this) // 选中当前气泡
            .attr("stroke", "#666") // 恢复边框颜色
            .attr("stroke-width", 1.5); // 恢复边框宽度
    };

    // 7. 绘制散点图点 (气泡) (Draw scatter plot points)
    // 绑定数据并创建气泡
    const bubbles = svg.selectAll(".bubble") // 保存气泡的选择集，以便后续更新
        .data(filteredData)
        .enter()
        .append("circle")
        .attr("class", "bubble")
        .attr("cx", d => xScale(d.year)) // 设置气泡的X坐标
        .attr("cy", d => yScale(d.type)) // 设置气泡的Y坐标
        .attr("r", d => rScale(d.count)) // 设置气泡的半径
        .attr("fill", d => colorScale(d.type)) // 设置气泡的填充颜色
        .on("mouseover", mouseover) // 绑定鼠标移入事件
        .on("mousemove", mousemove) // 绑定鼠标移动事件
        .on("mouseleave", mouseleave); // 绑定鼠标移出事件


    // 8. 创建图例 (Legend)

    // 估算图例宽度
    const legendWidthEstimate = 80;
    // 计算图例的X偏移量，将其放置在绘图区域的右侧
    const legendX = width - legendWidthEstimate;

    // 创建图例的g元素
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${legendX}, 10)`); // 调整图例位置

    // 绘制/更新图例的函数
    function drawLegend(domainOrder) {
        const legendItems = legend.selectAll(".legend-item")
            .data(domainOrder, d => d); // 绑定数据，使用d作为键，以便D3识别数据项

        // 移除不再需要显示的图例项 (在此例中，类型数量固定，所以不会有exit)
        legendItems.exit().remove();

        // 进入选择集：为新数据项创建新的图例元素
        const newItems = legendItems.enter()
            .append("g")
            .attr("class", "legend-item");

        // 为新图例项添加颜色方块
        newItems.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", d => colorScale(d))
            .attr("stroke", "#333");

        // 为新图例项添加文本标签
        newItems.append("text")
            .attr("x", 15)
            .attr("y", 9)
            .text(d => d)
            .style("alignment-baseline", "middle");

        // 合并进入和更新选择集，并应用过渡效果来定位所有图例项
        legendItems.merge(newItems)
            .transition()
            .duration(750) // 过渡时间
            .attr("transform", (d, i) => `translate(0, ${i * 20})`); // 根据索引定位
    }

    // 初始绘制图例，使用初始的Y轴顺序，并反转以匹配Y轴的视觉顺序
    drawLegend(currentYAxisOrder.slice().reverse());

    // 更新图表的函数，根据新的Y轴顺序重新绘制
    function updateChart(newDomain) {
        currentYAxisOrder = newDomain; // 更新当前的Y轴顺序
        yScale.domain(currentYAxisOrder); // 更新Y比例尺的domain

        // 更新Y轴，并添加过渡效果
        yAxisGroup.transition()
            .duration(750)
            .call(d3.axisLeft(yScale));

        // 更新气泡的Y坐标，并添加过渡效果
        bubbles.transition()
            .duration(750)
            .attr("cy", d => yScale(d.type));

        // 更新图例的顺序，并反转以匹配Y轴的视觉顺序
        drawLegend(currentYAxisOrder.slice().reverse());
    }

    // 绑定排序按钮的事件监听器
    d3.select("#sort-asc").on("click", () => {
        // 按总数升序排列类型 (最小的在Y轴底部，最大的在Y轴顶部)
        const sortedTypes = Object.keys(typeTotalCounts)
            .sort((a, b) => typeTotalCounts[a] - typeTotalCounts[b]);
        updateChart(sortedTypes);
    });

    d3.select("#sort-desc").on("click", () => {
        // 按总数降序排列类型 (最大的在Y轴底部，最小的在Y轴顶部)
        const sortedTypes = Object.keys(typeTotalCounts)
            .sort((a, b) => typeTotalCounts[b] - typeTotalCounts[a]);
        updateChart(sortedTypes);
    });

})();