document.addEventListener('DOMContentLoaded', function () {

    // 1. 定义图数据 (Nodes and Links)
    // 节点数据：id, name (显示名称), color (匹配图片颜色)
    const nodes = [
        { id: "SM2706", name: "SM2706", color: "#FF8C00" }, // Orange
        { id: "SM2702", name: "SM2702", color: "#4682B4" }, // SteelBlue (接近图片中的蓝色)
        { id: "SM2105", name: "SM2105", color: "#FFD700" }, // Gold (接近图片中的黄色)
        { id: "GE2413", name: "GE2413", color: "#87CEEB" }, // SkyBlue (接近图片中的浅蓝色)
        { id: "SM3612_G", name: "SM3612", color: "#32CD32" }, // LimeGreen (图片中的绿色SM3612)
        { id: "SM3601_P", name: "SM3601", color: "#c79eedff" }  // BlueViolet (图片中的紫色SM3612)
    ];

    // 链接数据：source (源节点ID), target (目标节点ID), label (链接文本标签，支持数组表示多行)
    const links = [
        { source: "SM2702", target: "SM2706", label: ["Advance"] },
        // 修改此处：为 SM2702 -> SM2105 的链接添加标签
        { source: "SM2702", target: "SM2105", label: ["Theory to practice"] },
        { source: "SM2702", target: "GE2413", label: ["Provide similar", "experiences"] },
        { source: "SM2105", target: "SM3612_G", label: ["Theoretical basis", "and inspiration"] },
        { source: "SM3601_P", target: "SM3612_G", label: ["Experience of game", "designing"] }
    ];

    const graphData = { nodes, links };

    // 2. 设置 SVG 尺寸
    // 直接选择 #vis-graphdata 作为容器
    const container = d3.select("#vis-graphdata");
    const containerWidth = container.node().getBoundingClientRect().width;
    const graphWidth = Math.min(containerWidth, 800); // 最大宽度800px，但不超过容器宽度
    const graphHeight = 600;

    // 创建 SVG 元素，直接追加到 #vis-graphdata
    const svg = container.append("svg")
        .attr("viewBox", `0 0 ${graphWidth} ${graphHeight}`) // 使用 viewBox 实现响应式
        .attr("preserveAspectRatio", "xMinYMin meet"); // 保持宽高比

    // 3. 定义箭头标记 (Arrowhead Marker)
    svg.append("defs").append("marker")
        .attr("id", "arrowhead")
        .attr("viewBox", "0 -5 10 10") // 箭头视图框
        .attr("refX", 20) // 箭头尖端距离目标节点的偏移量 (节点半径 + 10)
        .attr("refY", 0)
        .attr("orient", "auto")
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("xoverflow", "visible")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5") // 箭头路径
        .attr("fill", "#666")
        .attr("stroke", "none");

    // 4. 创建力模拟器
    const simulation = d3.forceSimulation(graphData.nodes)
        .force("link", d3.forceLink(graphData.links).id(d => d.id).distance(150)) // 链接力，根据ID连接节点，设置链接长度
        .force("charge", d3.forceManyBody().strength(-400)) // 节点之间的排斥力
        .force("center", d3.forceCenter(graphWidth / 2, graphHeight / 2)); // 将所有节点拉向中心

    // 5. 绘制链接
    const link = svg.append("g")
        .attr("class", "d3-links-group") // 修改为更具体的类名
        .selectAll("line")
        .data(graphData.links)
        .enter().append("line")
        .attr("class", "d3-link") // 修改为更具体的类名
        .attr("marker-end", "url(#arrowhead)"); // 应用箭头标记

    // 6. 绘制链接标签 (文本)
    const linkLabels = svg.append("g")
        .attr("class", "d3-link-labels-group") // 修改为更具体的类名
        .selectAll("g.link-label")
        .data(graphData.links.filter(l => l.label && l.label.length > 0)) // 过滤掉没有标签的链接
        .enter().append("g")
        .attr("class", "link-label"); // 这个类名在我的CSS中是唯一的，可以保留

    linkLabels.each(function (d) {
        const textElement = d3.select(this).append("text");
        const lineHeight = 1.2; // em

        d.label.forEach((lineText, i) => {
            textElement.append("tspan")
                .attr("x", 0) // 相对于父text元素的x坐标
                .attr("dy", i === 0 ? "-0.6em" : `${lineHeight}em`) // 第一行上移，后续行根据行高排列
                .text(lineText);
        });
    });


    // 7. 绘制节点（包含圆形和文本）
    const node = svg.append("g")
        .attr("class", "d3-nodes-group") // 修改为更具体的类名
        .selectAll(".d3-node") // 修改选择器以匹配新的类名
        .data(graphData.nodes)
        .enter().append("g")
        .attr("class", "d3-node") // 修改为更具体的类名
        .call(d3.drag() // 添加拖拽行为
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    node.append("circle")
        .attr("r", 15) // 节点半径
        .attr("fill", d => d.color) // 根据数据中的颜色属性填充
        .append("title") // 添加 tooltip
        .text(d => d.name);

    node.append("text")
        .attr("dx", 20) // 文本相对于圆心的水平偏移
        .attr("dy", ".35em") // 文本相对于圆心的垂直偏移
        .text(d => d.name);

    // 8. 定义拖拽函数
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart(); // 启动模拟器
        d.fx = d.x; // 固定节点的x坐标
        d.fy = d.y; // 固定节点的y坐标
    }

    function dragged(event, d) {
        d.fx = event.x; // 更新节点的x坐标
        d.fy = event.y; // 更新节点的y坐标
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0); // 停止模拟器
        d.fx = null; // 释放节点的x坐标，使其再次受力影响
        d.fy = null; // 释放节点的y坐标，使其再次受力影响
    }

    // 9. 监听模拟器的 "tick" 事件，更新节点和链接的位置
    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("transform", d => `translate(${d.x},${d.y})`);

        // 更新链接标签的位置和旋转
        linkLabels.attr("transform", function (d) {
            const x = (d.source.x + d.target.x) / 2;
            const y = (d.source.y + d.target.y) / 2;
            let angle = Math.atan2(d.target.y - d.source.y, d.target.x - d.source.x) * 180 / Math.PI;

            // 调整角度以确保文本不会倒置
            if (angle > 90 || angle < -90) {
                angle += 180;
            }

            return `translate(${x},${y}) rotate(${angle})`;
        });
    });

    console.log("生成的图数据集:", graphData);
});