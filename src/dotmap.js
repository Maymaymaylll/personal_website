(function () {
    const width = 960;
    const height = 600;

    // 在 #vis-dotmap 元素内创建 SVG 容器
    const svg = d3.select("#vis-dotmap")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`) // 设置 viewBox 实现响应式
        .attr("preserveAspectRatio", "xMidYMid meet"); // 保持宽高比

    // 定义 Mercator 投影，适合世界地图
    const projection = d3.geoMercator()
        .scale(150) // 调整地图的缩放比例
        .center([0, 20]) // 设置地图的中心点 [经度, 纬度]
        .translate([width / 2, height / 2]); // 将地图中心平移到 SVG 容器的中心

    // 定义路径生成器，用于将地理数据转换为 SVG 路径
    const path = d3.geoPath()
        .projection(projection);

    // 创建一个主组，所有地图元素（除了图例）都将添加到这个组中，以便进行缩放
    const mapGroup = svg.append("g")
        .attr("class", "map-elements");

    // 您去过的地方的数据
    const visitData = [
        // 常住和探亲 (Permanent residence and family visits)
        { name: "上海", coords: [121.47, 31.23], visits: 20, category: "Residence & relatives visiting" },
        { name: "江苏", coords: [118.76, 32.06], visits: 10, category: "Residence & relatives visiting" }, // 南京坐标
        { name: "广州", coords: [113.26, 23.13], visits: 10, category: "Residence & relatives visiting" },
        { name: "湖南", coords: [112.98, 28.19], visits: 15, category: "Residence & relatives visiting" }, // 长沙坐标

        // 学业目的 (Academic purposes)
        { name: "香港", coords: [114.17, 22.32], visits: 10, category: "Academic purposes" },
        { name: "明尼苏达", coords: [-93.27, 44.98], visits: 1, category: "Academic purposes" }, // 明尼阿波利斯坐标
        { name: "纽约", coords: [-74.01, 40.71], visits: 1, category: "Academic purposes" }, // 纽约市坐标
        { name: "波士顿", coords: [-71.06, 42.36], visits: 1, category: "Academic purposes" },

        // 旅游 (Tourism)
        { name: "浙江", coords: [120.15, 30.28], visits: 3, category: "Tourism" }, // 杭州坐标
        { name: "青海", coords: [101.77, 36.62], visits: 1, category: "Tourism" }, // 西宁坐标
        { name: "云南", coords: [102.71, 25.04], visits: 3, category: "Tourism" }, // 昆明坐标
        { name: "海南", coords: [110.35, 20.02], visits: 1, category: "Tourism" }, // 海口坐标
        { name: "台湾", coords: [121.56, 25.03], visits: 1, category: "Tourism" }, // 台北坐标
        { name: "日本大阪", coords: [135.50, 34.69], visits: 2, category: "Tourism" },
        { name: "日本京都", coords: [135.77, 35.01], visits: 2, category: "Tourism" },
        { name: "日本东京", coords: [139.69, 35.69], visits: 6, category: "Tourism" },
        { name: "韩国首尔", coords: [126.98, 37.57], visits: 4, category: "Tourism" },
        { name: "泰国普吉岛", coords: [98.34, 7.88], visits: 1, category: "Tourism" },
        { name: "泰国曼谷", coords: [100.50, 13.76], visits: 1, category: "Tourism" },
        { name: "澳大利亚凯恩斯", coords: [145.77, -16.93], visits: 2, category: "Tourism" },
        { name: "澳大利亚布里斯班", coords: [153.03, -27.47], visits: 2, category: "Tourism" },
        { name: "新西兰奥克兰", coords: [174.76, -36.85], visits: 1, category: "Tourism" },
    ];

    // 定义颜色比例尺，将不同的类别映射到不同的颜色
    const colorScale = d3.scaleOrdinal()
        .domain(["Residence & relatives visiting", "Academic purposes", "Tourism"])
        .range(["#e41a1c", "#377eb8", "#4daf4a"]); // 红色、蓝色、绿色

    // 加载世界地图数据 (TopoJSON 格式)
    // 使用 world-atlas CDN 提供的 110m 分辨率的世界地图数据
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(function (world) {
        // 绘制海洋背景
        mapGroup.append("rect") // 将海洋背景添加到 mapGroup
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "lightblue"); // 设置海洋背景为浅蓝色

        // 绘制国家
        mapGroup.append("g") // 将国家组添加到 mapGroup
            .attr("class", "countries")
            .selectAll("path")
            .data(topojson.feature(world, world.objects.countries).features) // 将 TopoJSON 转换为 GeoJSON
            .enter().append("path")
            .attr("d", path) // 使用路径生成器绘制国家
            .attr("fill", "#f3edcbff") // 设置陆地颜色
            .attr("class", "country");

        // 绘制国家边界
        mapGroup.append("path") // 将边界添加到 mapGroup
            .datum(topojson.mesh(world, world.objects.countries, (a, b) => a !== b)) // 绘制国家之间的共享边界
            .attr("class", "country-borders")
            .attr("d", path)
            .attr("stroke", "#777") // 边界颜色
            .attr("stroke-width", 0.2) // 边界宽度
            .attr("fill", "none"); // 不填充边界

        // 绘制圆点
        const dotGroup = mapGroup.append("g").attr("class", "dots"); // 将点组添加到 mapGroup
        const dotRadius = 2; // 略微减小圆点的半径，以便在密集区域有更好的分离度
        const offsetAmount = 300; // 增加圆点的随机偏移量（像素），使其更分散

        let totalVisitsExpected = 0;
        let totalDotsDrawn = 0;

        visitData.forEach(location => {
            totalVisitsExpected += location.visits;
            for (let i = 0; i < location.visits; i++) {
                const [lon, lat] = location.coords;
                // 为每个圆点添加一个更大的随机偏移，使其分散开来
                // 偏移量以像素为单位，然后转换为地理坐标的度数
                // 注意：这里将像素偏移转换为地理度数，以便在投影前应用
                const randomOffsetLon = (Math.random() - 0.5) * (offsetAmount / projection.scale());
                const randomOffsetLat = (Math.random() - 0.5) * (offsetAmount / projection.scale());

                const projectedCoords = projection([lon + randomOffsetLon, lat + randomOffsetLat]);

                if (projectedCoords) { // 确保坐标在地图投影范围内
                    dotGroup.append("circle")
                        .attr("cx", projectedCoords[0]) // 圆心X坐标
                        .attr("cy", projectedCoords[1]) // 圆心Y坐标
                        .attr("r", dotRadius) // 半径
                        .attr("fill", colorScale(location.category)) // 根据类别设置填充颜色
                        .attr("class", "dot");
                    totalDotsDrawn++;
                } else {
                    console.warn(`无法投影坐标: ${location.name} (原始经纬度: [${lon}, ${lat}], 偏移后: [${lon + randomOffsetLon}, ${lat + randomOffsetLat}])`);
                }
            }
        });

        console.log(`预期绘制的总点数 (所有访问次数之和): ${totalVisitsExpected}`);
        console.log(`实际绘制的总点数: ${totalDotsDrawn}`);

        // 添加图例
        // 图例不应随地图缩放，因此直接添加到 svg，而不是 mapGroup
        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${width - 190}, ${height - 120})`); // 图例的定位 (右下角)

        // 图例背景框
        legend.append("rect")
            .attr("class", "legend-box")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 180) // 框的宽度
            .attr("height", 100) // 框的高度
            .attr("rx", 5) // 圆角半径
            .attr("ry", 5);

        const legendData = colorScale.domain(); // 获取所有类别
        legend.selectAll(".legend-item")
            .data(legendData)
            .enter().append("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => `translate(10, ${20 + i * 20})`) // 每个图例项的位置
            .each(function (d) {
                d3.select(this).append("circle")
                    .attr("r", dotRadius)
                    .attr("cx", 0)
                    .attr("cy", 0)
                    .attr("fill", colorScale(d)); // 图例圆点颜色

                d3.select(this).append("text")
                    .attr("x", 10)
                    .attr("y", 3)
                    .text(d) // 图例文本
                    .attr("class", "legend-text");
            });

        // 添加“一个点代表去过一次”的说明
        legend.append("text")
            .attr("x", 10)
            .attr("y", 20 + legendData.length * 20) // 放置在类别下方
            .text("1 Dot = 1 Visit")
            .attr("class", "legend-text");

        // --- 缩放功能 ---
        const zoom = d3.zoom()
            .scaleExtent([1, 8]) // 缩放范围：最小1倍（初始大小），最大8倍
            .on("zoom", zoomed); // 绑定缩放事件处理器

        svg.call(zoom); // 将缩放行为应用到 SVG 容器

        // 缩放事件处理器
        function zoomed(event) {
            // 将当前的缩放变换应用到 mapGroup
            mapGroup.attr("transform", event.transform);
        }

    }).catch(function (error) {
        console.error("加载地图数据时发生错误:", error);
    });
})();