(function () {
    // 1. 定义数据 (使用 pieData)
    const pieData = [
        { category: "Painting", value: 25 },
        { category: "Online Video", value: 30 },
        { category: "Writing", value: 25 },
        { category: "Project Planning", value: 20 }
    ];

    // 2. 设置图表尺寸和半径 (使用 pieWidth, pieHeight, pieRadius)
    const pieWidth = 450;
    const pieHeight = 450;
    const pieRadius = Math.min(pieWidth, pieHeight) / 2;

    // 3. 创建 SVG 元素并将其定位到中心 (使用 pieSvg)
    const pieSvg = d3.select("#vis-piechart")
        .append("svg")
        // 使用 viewBox 保证响应性，并为图例预留空间
        .attr("viewBox", `0 0 ${pieWidth + 150} ${pieHeight}`)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .append("g")
        .attr("transform", `translate(${pieWidth / 2}, ${pieHeight / 2})`);

    // 4. 定义颜色比例尺 (使用 pieColor)
    const pieColor = d3.scaleOrdinal()
        .domain(pieData.map(d => d.category))
        .range(d3.schemeCategory10);

    // 5. 定义饼图生成器 (使用 pieGenerator)
    const pieGenerator = d3.pie()
        .value(d => d.value)
        .sort(null);

    // 6. 定义弧形生成器 (使用 pieArc)
    const pieArc = d3.arc()
        .innerRadius(0)
        .outerRadius(pieRadius);

    // 7. 绘制扇区 (Slices) (使用 pieArcs)
    const pieArcs = pieSvg.selectAll(".pie-arc")
        .data(pieGenerator(pieData))
        .enter()
        .append("g")
        .attr("class", "pie-arc");

    // 绘制路径并添加过渡动画
    pieArcs.append("path")
        .attr("d", pieArc)
        .attr("fill", d => pieColor(d.data.category))
        .attr("stroke", "white")
        .style("stroke-width", "2px")
        .transition()
        .duration(1000)
        .attrTween("d", function (d) {
            const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
            return function (t) {
                return pieArc(interpolate(t));
            };
        });

    // 8. 添加百分比标签到扇区中心
    pieArcs.append("text")
        .attr("transform", d => `translate(${pieArc.centroid(d)})`)
        .attr("text-anchor", "middle")
        .text(d => `${d.data.value}%`)
        .style("fill", "white")
        .style("font-size", "14px")
        .style("pointer-events", "none");

    // 9. 添加图例 (Legend) (使用 pieLegend)
    const pieLegend = pieSvg.selectAll(".pie-legend")
        .data(pieData)
        .enter().append("g")
        .attr("class", "pie-legend")
        // 将图例定位到饼图右侧
        .attr("transform", (d, i) => `translate(${pieRadius + 20}, ${i * 25 - pieRadius + 50})`);

    // 图例颜色块
    pieLegend.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", d => pieColor(d.category));

    // 图例文本
    pieLegend.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(d => d.category);

})(); // IIFE 结束