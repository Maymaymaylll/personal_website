(function () {
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

    // 1. 数据过滤
    const filteredData = creativeData.filter(d => d.year >= 2021);

    // 2. 设置尺寸
    const margin = { top: 30, right: 40, bottom: 60, left: 100 };
    const targetPlotWidth = 600;
    const width = targetPlotWidth;
    const height = 450 - margin.top - margin.bottom;
    const svgWidth = width + margin.left + margin.right;
    const svgHeight = height + margin.top + margin.bottom;


    // 3. 添加SVG
    const svg = d3.select("#vis-scatterplot")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // 4. 定义比例尺

    // X 比例尺 (年份)
    const minYear = 2020;
    const axisMaxYear = 2025;
    const xScale = d3.scaleLinear()
        .domain([minYear, axisMaxYear])
        .range([0, width]);

    // Y 比例尺 (工作类型)
    const workTypes = ["paintings", "videos", "games"];
    const yScale = d3.scaleBand()
        .domain(workTypes)
        .range([height, 0])
        .padding(1);

    // R 比例尺 (数量)
    const maxCount = d3.max(filteredData, d => d.count);
    const rScale = d3.scaleSqrt()
        .domain([0, maxCount])
        .range([2, 25]);

    // 颜色比例尺
    const colorScale = d3.scaleOrdinal()
        .domain(workTypes)
        .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);

    // 5. 绘制坐标轴

    // X 轴
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale)
            .tickFormat(d3.format("d"))
            .tickValues(d3.range(minYear, axisMaxYear + 1))
        )
        .append("text")
        .attr("y", 40)
        .attr("x", width / 2)
        .attr("fill", "#000")
        .style("text-anchor", "middle")
        .text("Year");

    // Y 轴
    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale))
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -height / 2)
        .attr("dy", "1em")
        .attr("fill", "#000")
        .style("text-anchor", "middle")
        .text("Type of Creative Work");

    // 6. 工具提示 (Tooltip)
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip");

    const mouseover = function (event, d) {
        tooltip.style("opacity", 1);
        d3.select(this).attr("stroke", "darkred").attr("stroke-width", 3);
    };

    const mousemove = function (event, d) {
        tooltip
            .html(`Year: <strong>${d.year}</strong><br>Type: <strong>${d.type}</strong><br>Count: <strong>${d.count}</strong>`)
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 28) + "px");
    };

    const mouseleave = function (event, d) {
        tooltip.style("opacity", 0);
        d3.select(this).attr("stroke", "#333").attr("stroke-width", 1);
    };

    // 7. 绘制散点图点 (气泡)
    svg.selectAll(".bubble")
        .data(filteredData)
        .enter()
        .append("circle")
        .attr("class", "bubble")
        .attr("cx", d => xScale(d.year))
        .attr("cy", d => yScale(d.type))
        .attr("r", d => rScale(d.count))
        .attr("fill", d => colorScale(d.type))
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);


    // 8. 创建图例 (Legend)

    // 估算图例宽度 (假设每个标签大约 60px 宽，这里有 3 个标签)
    const legendWidthEstimate = 80;

    // 计算图例的 X 偏移量：将图例放置在绘图区域的最右侧，并留出 10px 边距
    const legendX = width - legendWidthEstimate;

    const legend = svg.append("g")
        .attr("class", "legend")
        // *** 核心修改：将 X 坐标设置为 legendX，Y 坐标保持 10 ***
        .attr("transform", `translate(${legendX}, 10)`);

    // 绑定数据并创建图例项
    const legendItems = legend.selectAll(".legend-item")
        .data(workTypes)
        .enter()
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * 20})`);

    // 添加颜色点
    legendItems.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", d => colorScale(d))
        .attr("stroke", "#333");

    // 添加文本标签
    legendItems.append("text")
        .attr("x", 15)
        .attr("y", 9)
        .text(d => d)
        .style("alignment-baseline", "middle");
})();