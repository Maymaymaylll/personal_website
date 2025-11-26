document.addEventListener('DOMContentLoaded', function () {
    // 选取用于渲染地图的 section 元素
    const section = d3.select("#vis-symbolmap");

    // 获取 section 的初始宽度，并计算高度以保持地图的宽高比
    const sectionNode = section.node();
    let currentWidth = sectionNode.getBoundingClientRect().width;
    let currentHeight = currentWidth * 0.6; // 保持 16:9 左右的宽高比

    // 在 section 中添加 SVG 元素，用于绘制地图
    const svg = section.append("svg")
        .attr("width", "100%") // SVG 宽度自适应容器
        .attr("height", currentHeight) // 初始高度
        .attr("viewBox", `0 0 ${currentWidth} ${currentHeight}`) // 设置 viewBox 以实现响应式缩放
        .attr("preserveAspectRatio", "xMidYMid meet"); // 保持宽高比并居中

    // 定义 Mercator 地图投影
    const projection = d3.geoMercator()
        .scale(currentWidth / (2 * Math.PI)) // 根据 SVG 宽度调整缩放比例
        .translate([currentWidth / 2, currentHeight / 1.5]); // 将地图中心点平移到 SVG 中央偏下

    // 定义地理路径生成器，将 GeoJSON 几何体转换为 SVG 路径
    const path = d3.geoPath()
        .projection(projection);

    // 在 SVG 中创建一个组 (g) 元素，用于容纳地图的所有元素，便于管理
    const g = svg.append("g");

    // 存储当前活跃访客数据的数组
    let visitors = [];
    let visitorIdCounter = 0; // 用于为每个访客分配唯一的 ID

    // 实时模拟的常量
    const VISITOR_LIFESPAN = 15000; // 访客点在地图上停留的时间 (毫秒)，15秒
    const UPDATE_INTERVAL = 2000;   // 每隔多久生成一个新的访客点 (毫秒)，2秒

    /**
     * 生成一个随机的虚拟访客数据。
     * 坐标是随机生成的，不保证落在陆地上。
     * @returns {object} 包含访客ID、经纬度、时间戳的对象。
     */
    function generateRandomVisitor() {
        // 随机生成经纬度
        const lat = Math.random() * 170 - 85; // 纬度范围 -85 到 85 (避免极点附近 Mercator 投影的极端变形)
        const lon = Math.random() * 360 - 180; // 经度范围 -180 到 180

        return {
            id: visitorIdCounter++,       // 唯一访客 ID
            lat: lat,                     // 纬度
            lon: lon,                     // 经度
            timestamp: Date.now()         // 生成时间戳
        };
    }

    // 加载世界地图数据 (TopoJSON 格式)
    // 使用 world-atlas 提供的 110m 比例的世界地图数据，文件较小，加载快
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json").then(world => {
        // 将 TopoJSON 数据转换为 GeoJSON 格式，以便 D3.js 处理
        const countries = topojson.feature(world, world.objects.countries);

        // 绘制国家/地区
        g.selectAll("path")
            .data(countries.features) // 绑定 GeoJSON 特征数据
            .enter().append("path")   // 为每个国家添加一个 path 元素
            .attr("class", "scountry") // 添加 CSS 类
            .attr("d", path);         // 使用 path 生成器计算路径数据

        // 初始生成一些访客点，使地图一开始不为空



        /**
         * 更新地图上的访客点。
         * 包括添加新访客、移除过期访客以及更新现有访客的视觉表现。
         */
        function updateVisitors() {
            // 添加一个新的虚拟访客
            visitors.push(generateRandomVisitor());

            // 过滤掉超过生命周期的访客点
            visitors = visitors.filter(d => Date.now() - d.timestamp < VISITOR_LIFESPAN);

            // 数据绑定：将访客数据绑定到 SVG circle 元素
            const visitorPoints = g.selectAll(".visitor-point")
                .data(visitors, d => d.id); // 使用访客 ID 作为键，确保数据更新时元素的稳定性

            // Enter selection (进入选择集): 处理新加入的访客点
            visitorPoints.enter().append("circle")
                .attr("class", "visitor-point new") // 添加 'new' 类，用于新访客的动画和高亮
                .attr("cx", d => projection([d.lon, d.lat])[0]) // 设置圆心 X 坐标
                .attr("cy", d => projection([d.lon, d.lat])[1]) // 设置圆心 Y 坐标
                .attr("r", 0) // 初始半径为 0，用于动画效果
                .transition() // 开始过渡动画
                .duration(500) // 动画持续 500 毫秒
                .attr("r", 5) // 动画结束时半径变为 5
                .on("end", function () {
                    // 动画结束后移除 'new' 类，恢复默认样式
                    d3.select(this).classed("new", false);
                });

            // Update selection (更新选择集): 处理已存在的访客点
            // 对于符号地图，访客点位置固定，此处主要确保数据绑定正确
            visitorPoints
                .attr("cx", d => projection([d.lon, d.lat])[0])
                .attr("cy", d => projection([d.lon, d.lat])[1]);

            // Exit selection (退出选择集): 处理被移除的访客点
            visitorPoints.exit()
                .transition() // 开始过渡动画
                .duration(1000) // 动画持续 1000 毫秒 (1秒)
                .attr("r", 0) // 半径缩小到 0
                .style("opacity", 0) // 透明度渐变为 0
                .remove(); // 动画结束后从 DOM 中移除元素
        }

        // 启动实时更新循环，每隔 UPDATE_INTERVAL 毫秒调用 updateVisitors 函数
        setInterval(updateVisitors, UPDATE_INTERVAL);

        // 首次调用 updateVisitors，显示初始的访客点
        updateVisitors();

    }).catch(error => {
        // 处理地图数据加载失败的错误
        console.error("Error loading the world map data:", error);
        section.append("p").style("color", "red").text("无法加载地图数据。请检查网络连接或数据源。");
    });

    // 使用 ResizeObserver 监听 section 容器的大小变化，实现地图的响应式布局
    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            if (entry.target.id === "vis-symbolmap") {
                // 获取新的容器宽度
                const newWidth = entry.contentRect.width;
                const newHeight = newWidth * 0.6; // 重新计算高度

                // 更新 SVG 的 viewBox 和 height 属性
                svg.attr("height", newHeight)
                    .attr("viewBox", `0 0 ${newWidth} ${newHeight}`);

                // 根据新的宽度重新配置地图投影的缩放和平移
                projection.scale(newWidth / (2 * Math.PI))
                    .translate([newWidth / 2, newHeight / 1.5]);

                // 重新绘制国家/地区路径，使其适应新的投影
                g.selectAll("path.scountry").attr("d", path);

                // 更新所有访客点的位置，使其适应新的投影
                g.selectAll(".visitor-point")
                    .attr("cx", d => projection([d.lon, d.lat])[0])
                    .attr("cy", d => projection([d.lon, d.lat])[1]);
            }
        }
    });

    // 观察目标 section 元素
    resizeObserver.observe(section.node());
});