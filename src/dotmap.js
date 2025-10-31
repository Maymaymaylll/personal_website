(function () {
    const visitDataRaw = [
        { name: "上海", country: "中国", count: 20 },
        { name: "江苏", country: "中国", count: 10 },
        { name: "浙江", country: "中国", count: 3 },
        { name: "青海", country: "中国", count: 1 },
        { name: "云南", country: "中国", count: 3 },
        { name: "海南", country: "中国", count: 1 },
        { name: "湖南", country: "中国", count: 15 },
        { name: "广州", country: "中国", count: 10 },
        { name: "台湾", country: "中国", count: 1 },
        { name: "香港", country: "中国", count: 10 },

        { name: "大阪", country: "日本", count: 2 },
        { name: "京都", country: "日本", count: 2 },
        { name: "东京", country: "日本", count: 6 },

        { name: "首尔", country: "韩国", count: 4 },

        { name: "明尼苏达", country: "美国", count: 1 },
        { name: "纽约", country: "美国", count: 1 }, // 假设是纽约市
        { name: "波士顿", country: "美国", count: 1 },

        { name: "普吉岛", country: "泰国", count: 1 },
        { name: "曼谷", country: "泰国", count: 1 },

        { name: "凯恩斯", country: "澳大利亚", count: 2 },
        { name: "布里斯班", country: "澳大利亚", count: 2 },

        { name: "奥克兰", country: "新西兰", count: 1 }
    ];

    // 2. 补充地理坐标，因为原始数据中没有提供
    // 这是一个简化的示例，实际应用中可能需要更精确的地理编码服务
    const cityCoordinates = {
        "上海": [121.4737, 31.2304],
        "江苏": [119.7800, 32.9700], // 省会南京附近
        "浙江": [120.0667, 29.1833], // 省会杭州附近
        "青海": [96.2267, 35.8617], // 省会西宁附近
        "云南": [101.6000, 24.9667], // 省会昆明附近
        "海南": [109.7333, 19.1250], // 省会海口附近
        "湖南": [111.9900, 27.6100], // 省会长沙附近
        "广州": [113.2644, 23.1291],
        "台湾": [120.9605, 23.6978], // 台湾中心点
        "香港": [114.1694, 22.3193],

        "大阪": [135.5022, 34.6937],
        "京都": [135.7681, 35.0116],
        "东京": [139.6503, 35.6762],

        "首尔": [126.9780, 37.5665],

        "明尼苏达": [-94.6362, 46.3924], // 明尼苏达州中心点
        "纽约": [-74.0060, 40.7128], // 纽约市
        "波士顿": [-71.0589, 42.3601],

        "普吉岛": [98.3923, 7.8804],
        "曼谷": [100.5018, 13.7563],

        "凯恩斯": [145.7775, -16.9252],
        "布里斯班": [153.0251, -27.4698],

        "奥克兰": [174.7633, -36.8485]
    };

    // 3. 定义旅行地点类别及其颜色
    const categoryDefinitions = [
        { name: "常住和探亲", locations: ["上海", "江苏", "广州", "湖南"], color: "#3498db", className: "d3-map-category-resident" },
        { name: "学业目的", locations: ["香港", "明尼苏达", "纽约", "波士顿"], color: "#27ae60", className: "d3-map-category-academic" },
        { name: "旅游", locations: [], color: "#e67e22", className: "d3-map-category-tourism" } // 旅游地点将自动分配
    ];

    // 创建一个地点名称到类别对象的映射，方便查找
    const locationCategoryMap = new Map();
    categoryDefinitions.forEach(cat => {
        cat.locations.forEach(locName => {
            locationCategoryMap.set(locName, cat);
        });
    });

    // 4. 预处理数据：将每个地点的访问次数转换为独立的点对象，并分配类别
    const allVisits = [];
    visitDataRaw.forEach(location => {
        // 根据地点名称查找类别，如果未找到则默认为“旅游”
        let category = locationCategoryMap.get(location.name);
        if (!category) {
            category = categoryDefinitions.find(c => c.name === "旅游");
        }

        for (let i = 0; i < location.count; i++) {
            allVisits.push({
                name: location.name,
                country: location.country,
                coords: cityCoordinates[location.name], // 从 cityCoordinates 获取坐标
                category: category // 存储类别对象
            });
        }
    });

    // 5. 获取 SVG 容器并设置尺寸
    const container = d3.select("#vis-dotmap"); // 直接选择 #vis-dotmap

    // 检查容器是否存在
    if (container.empty()) {
        console.error("Error: #vis-dotmap element not found. Map cannot be rendered.");
        return; // 如果容器不存在，则停止执行
    }

    let containerWidth = container.node().getBoundingClientRect().width;
    let containerHeight = containerWidth / 2; // 保持 2:1 的宽高比

    // 检查容器宽度是否有效
    if (containerWidth <= 0) {
        console.warn("Warning: #vis-dotmap container has 0 or negative width. Map may not be visible. Using default fallback dimensions.");
        containerWidth = 960; // 默认宽度
        containerHeight = 480; // 默认高度
    }

    // 创建 SVG 元素并直接添加到 #vis-dotmap
    const svg = container.append("svg")
        .attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`) // 设置 viewBox 实现响应式
        .attr("preserveAspectRatio", "xMidYMid meet"); // 保持宽高比并居中

    // 6. 创建提示框 (Tooltip) 元素
    const tooltip = d3.select("body").append("div")
        .attr("class", "d3-map-tooltip") // 修改了类名
        .style("opacity", 0); // 初始隐藏

    // 7. 定义地图投影
    const projection = d3.geoMercator(); // 初始化投影，不设置 scale 和 translate，稍后用 fitSize 自动调整

    // 8. 定义地理路径生成器
    const path = d3.geoPath()
        .projection(projection);

    let worldData; // 用于存储加载的世界地图数据，以便在 resize 时重用

    // 9. 加载世界地图数据并绘制
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(world => {
        worldData = world; // 存储数据
        const countries = topojson.feature(world, world.objects.countries).features;

        // 使用 fitSize 自动调整投影的缩放和位置，使其适应 SVG 容器
        // 这比手动设置 scale 和 translate 更可靠
        projection.fitSize([containerWidth, containerHeight], topojson.feature(world, world.objects.countries));

        // 绘制国家
        svg.append("g")
            .attr("class", "d3-map-countries") // 修改了类名
            .selectAll("path")
            .data(countries)
            .enter().append("path")
            .attr("class", "d3-map-country") // 修改了类名
            .attr("d", path);

        // 10. 绘制点密度
        const dotGroup = svg.append("g")
            .attr("class", "d3-map-dots"); // 修改了类名

        dotGroup.selectAll(".d3-map-dot") // 修改了类名
            .data(allVisits)
            .enter().append("circle")
            .attr("class", d => `d3-map-dot ${d.category.className}`) // 修改了类名
            .attr("r", 1.5)
            .attr("cx", d => {
                if (!d.coords) {
                    console.warn(`Missing coordinates for ${d.name}. Dot not drawn.`);
                    return null;
                }
                const p = projection(d.coords);
                if (!p) {
                    // console.warn(`Projection returned null for ${d.name} (${d.coords}). Dot not drawn.`);
                    return null; // 如果投影失败，则不绘制此点
                }
                // 添加随机偏移量，使点更分散
                return p[0] + (Math.random() - 0.5) * 8;
            })
            .attr("cy", d => {
                if (!d.coords) return null;
                const p = projection(d.coords);
                if (!p) return null;
                // 添加随机偏移量，使点更分散
                return p[1] + (Math.random() - 0.5) * 8;
            })
            .filter(d => d.coords && projection(d.coords)) // 过滤掉无法投影的点
            .on("mouseover", function (event, d) {
                if (!d.coords || !projection(d.coords)) return; // 确保点有效才显示 tooltip
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`地点: ${d.name}<br/>国家: ${d.country}<br/>目的: ${d.category.name}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function (d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        // 11. 绘制图例
        const legendGroup = svg.append("g")
            .attr("class", "d3-map-legend-group"); // 修改了类名，用于应用背景和边框

        const legendItemHeight = 25;
        const legendXOffset = 20;
        const legendYOffset = 20;

        // 为了在 SVG <g> 元素上模拟背景和边框，我们需要一个背景矩形
        const legendBackground = legendGroup.append("rect")
            .attr("class", "d3-map-legend-background"); // 使用新的类名

        const updateLegendPosition = () => {
            // 计算图例内容的总高度和宽度
            const contentWidth = 120; // 估算内容宽度
            const contentHeight = categoryDefinitions.length * legendItemHeight + 30; // 加上说明文字的高度

            legendGroup.attr("transform", `translate(${containerWidth - contentWidth - legendXOffset}, ${legendYOffset})`);

            // 更新背景矩形的大小以适应内容
            legendBackground
                .attr("x", -8) // 对应 CSS padding
                .attr("y", -8) // 对应 CSS padding
                .attr("width", contentWidth + 16) // 16 = 8px padding * 2
                .attr("height", contentHeight + 16); // 16 = 8px padding * 2
        };
        updateLegendPosition(); // 初始设置位置

        // 添加图例项
        const legendItems = legendGroup.selectAll(".d3-map-legend-item") // 修改了类名
            .data(categoryDefinitions)
            .enter().append("g")
            .attr("class", "d3-map-legend-item") // 修改了类名
            .attr("transform", (d, i) => `translate(0, ${i * legendItemHeight})`);

        legendItems.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", d => d.color);

        legendItems.append("text")
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", "0.35em")
            .text(d => d.name);

        // 添加“一个点代表去过一次”的说明
        legendGroup.append("text")
            .attr("x", 0)
            .attr("y", categoryDefinitions.length * legendItemHeight + 10)
            .text("一个点代表去过一次")
            .style("font-size", "12px")
            .style("fill", "#333")
            .style("font-family", "sans-serif"); // 确保字体不受全局 * 影响

        // 12. 响应式调整大小功能
        function resize() {
            containerWidth = container.node().getBoundingClientRect().width;
            containerHeight = containerWidth / 2;

            if (containerWidth <= 0) { // 再次检查有效宽度
                console.warn("Warning: Container has 0 or negative width during resize. Skipping map resize.");
                return;
            }

            svg.attr("viewBox", `0 0 ${containerWidth} ${containerHeight}`);

            // 重新使用 fitSize 调整投影以适应新的容器尺寸
            projection.fitSize([containerWidth, containerHeight], topojson.feature(worldData, worldData.objects.countries));

            // 重新绘制国家路径
            svg.selectAll(".d3-map-country").attr("d", path); // 修改了类名

            // 重新定位点（需要重新计算随机偏移量，以避免所有点重叠）
            dotGroup.selectAll(".d3-map-dot") // 修改了类名
                .attr("cx", d => {
                    if (!d.coords) return null;
                    const p = projection(d.coords);
                    return p ? p[0] + (Math.random() - 0.5) * 8 : null;
                })
                .attr("cy", d => {
                    if (!d.coords) return null;
                    const p = projection(d.coords);
                    return p ? p[1] + (Math.random() - 0.5) * 8 : null;
                });

            // 重新定位图例
            updateLegendPosition();
        }

        // 监听窗口 resize 事件
        d3.select(window).on("resize", resize);

    }).catch(error => {
        // 错误处理
        console.error("加载地图数据时出错:", error);
        container.append("p").style("color", "red").text("无法加载地图数据。请检查网络连接或数据源。");
    });
});