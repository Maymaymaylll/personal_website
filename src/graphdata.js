document.addEventListener('DOMContentLoaded', function () {

    // 1. 定义图数据 (Nodes and Links)
    // 节点数据：id, name (显示名称), color (匹配图片颜色)
    const graphData = {
        nodes: [
            // 主要类别 (Group 1 - 较大圆圈，特定颜色，深色边框)
            { id: "Animation", label: "Animation", group: 1, color: "rgb(255, 255, 102)" }, // 黄色
            { id: "Video editing", label: "Video editing", group: 1, color: "rgba(232, 192, 82, 1)" }, // 橙棕色
            { id: "Painting", label: "Painting", group: 1, color: "rgb(247, 163, 92)" }, // 浅橙色
            { id: "Visual designing", label: "Visual designing", group: 1, color: "rgb(240, 128, 128)" }, // 浅珊瑚色
            { id: "Game developing", label: "Game developing", group: 1, color: "rgb(221, 160, 221)" }, // 浅紫色
            { id: "Programming", label: "Programming", group: 1, color: "rgba(240, 120, 158, 1)" }, // 浅紫色

            // 工具/软件 (Group 2 - 较小圆圈，浅色，较浅边框)
            { id: "P5.js", label: "P5.js", group: 2, color: "rgb(255, 255, 224)" }, // 极浅黄色
            { id: "processing", label: "processing", group: 2, color: "rgba(247, 230, 250, 1)" }, // 薰衣草淡紫色 (处理多行文本)
            { id: "AE", label: "AE", group: 2, color: "rgba(252, 247, 201, 1)" },
            { id: "PR", label: "PR", group: 2, color: "rgba(255, 250, 224, 1)" },
            { id: "cap cut", label: "capcut", group: 2, color: "rgba(252, 240, 184, 1)" }, // 极浅黄色 (处理多行文本)
            { id: "SAI", label: "SAI", group: 2, color: "rgb(255, 218, 185)" }, // 桃色
            { id: "PS", label: "PS", group: 2, color: "rgba(251, 222, 229, 1)" },
            { id: "UE5", label: "UE5", group: 2, color: "rgba(249, 222, 220, 1)" },
            { id: "Python", label: "Python", group: 2, color: "rgba(249, 220, 237, 1)" },
        ],
        links: [
            { source: "P5.js", target: "Animation" },
            { source: "processing", target: "Animation" },
            { source: "processing", target: "Game developing" },
            { source: "processing", target: "Programming" },
            { source: "AE", target: "Animation" },
            { source: "AE", target: "Video editing" },
            { source: "PR", target: "Video editing" },
            { source: "cap cut", target: "Video editing" },
            { source: "Animation", target: "Video editing" },
            { source: "Animation", target: "Painting" },
            { source: "Animation", target: "Programming" },
            { source: "Video editing", target: "Painting" },
            { source: "Video editing", target: "Visual designing" },
            { source: "Painting", target: "Visual designing" },
            { source: "Painting", target: "SAI" },
            { source: "Visual designing", target: "SAI" },
            { source: "Visual designing", target: "PS" },
            { source: "Painting", target: "PS" },
            { source: "Game developing", target: "PS" },
            { source: "Game developing", target: "UE5" },
            { source: "Game developing", target: "Programming" },
            { source: "P5.js", target: "Programming" },
            { source: "Python", target: "Programming" }
        ]
    };

    // 获取容器元素
    const container = d3.select("#vis-graphdata");

    // 定义SVG的边距，这些边距将应用于实际绘制区域
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };

    // 辅助函数：获取当前SVG的实际尺寸和内部绘制区域尺寸
    function getDrawingDimensions() {
        const svgElement = container.select("svg").node();
        // 如果SVG元素还未创建，则从容器获取尺寸
        const currentSvgWidth = svgElement ? svgElement.getBoundingClientRect().width : container.node().getBoundingClientRect().width;
        const currentSvgHeight = svgElement ? svgElement.getBoundingClientRect().height : container.node().getBoundingClientRect().height;

        return {
            svgWidth: currentSvgWidth,
            svgHeight: currentSvgHeight,
            drawingWidth: currentSvgWidth - margin.left - margin.right,
            drawingHeight: currentSvgHeight - margin.top - margin.bottom
        };
    }

    let { svgWidth, svgHeight, drawingWidth, drawingHeight } = getDrawingDimensions();

    // 创建 SVG 元素并添加到容器中
    const svg = container.append("svg")
        .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`) // 设置 viewBox 以实现响应式
        .attr("preserveAspectRatio", "xMidYMid meet") // 保持宽高比
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`); // 应用边距到g元素

    // 根据节点组定义节点半径和边框颜色
    const nodeRadius = (d) => d.group === 1 ? 60 : 30; // 主要类别半径大，工具半径小
    const nodeStroke = (d) => d.group === 1 ? "rgb(50, 50, 50)" : "rgb(80, 80, 80)"; // 主要类别边框深，工具边框浅
    const defaultLinkStrokeWidth = "2px"; // 默认链接线宽
    const highlightedLinkStrokeWidth = "4px"; // 突出显示链接线宽
    const highlightedLinkStrokeColor = "rgb(0,0,0)"; // 突出显示链接颜色为纯黑色
    const defaultLinkStrokeColor = "#999"; // 默认链接颜色


    // 创建力模拟器
    const simulation = d3.forceSimulation(graphData.nodes)
        .force("link", d3.forceLink(graphData.links).id(d => d.id).distance(150)) // 链接力，设置链接距离
        .force("charge", d3.forceManyBody().strength(-400)) // 斥力，使节点相互排斥
        .force("center", d3.forceCenter(drawingWidth / 2, drawingHeight / 2)) // 向心力，使图表居中于绘制区域
        .force("collide", d3.forceCollide().radius(d => nodeRadius(d) + 15)); // 碰撞力，防止节点重叠，增加额外填充

    // 绘制链接 (线)
    const link = svg.append("g")
        .attr("class", "d3-graph-links-group")
        .selectAll("line")
        .data(graphData.links)
        .enter().append("line")
        .attr("class", "d3-graph-link");

    // 绘制节点 (圆圈和文本)
    const node = svg.append("g")
        .attr("class", "d3-graph-nodes-group")
        .selectAll("g")
        .data(graphData.nodes)
        .enter().append("g")
        .attr("class", "d3-graph-node")
        .call(d3.drag() // 添加拖动行为
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))
        .on("mouseover", handleMouseOver) // 添加鼠标悬停事件
        .on("mouseout", handleMouseOut);   // 添加鼠标移开事件

    // 为每个节点添加圆圈
    node.append("circle")
        .attr("r", nodeRadius) // 设置半径
        .attr("fill", d => d.color) // 填充颜色
        .attr("stroke", nodeStroke); // 边框颜色

    // 为每个节点添加文本标签，处理多行文本
    node.each(function (d) {
        const nodeGroup = d3.select(this);
        const labelLines = d.label.split('\n'); // 按换行符分割文本
        const radius = nodeRadius(d);

        // 根据半径和行数动态计算字体大小
        let fontSize = radius * 0.4; // 基础字体大小因子
        if (labelLines.length > 1) {
            fontSize = radius * 0.3; // 多行文本时字体稍微小一点
        }
        // 确保字体大小不会过小或过大
        fontSize = Math.max(12, Math.min(fontSize, 30));

        const lineHeight = fontSize * 1.2; // 行高
        const totalTextHeight = labelLines.length * lineHeight;
        const startY = -totalTextHeight / 2 + lineHeight / 2; // 垂直居中多行文本块

        labelLines.forEach((line, i) => {
            nodeGroup.append("text")
                .attr("y", startY + i * lineHeight) // 每行文本的y坐标
                .attr("font-size", `${fontSize}px`) // 设置字体大小
                .text(line); // 设置文本内容
        });
    });


    // 模拟器每次“tick”时更新元素位置
    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node.attr("transform", d => {
            const radius = nodeRadius(d);
            // 边界检查：将节点中心限制在 (radius, drawingWidth - radius) 和 (radius, drawingHeight - radius) 之间
            d.x = Math.max(radius, Math.min(drawingWidth - radius, d.x));
            d.y = Math.max(radius, Math.min(drawingHeight - radius, d.y));
            return `translate(${d.x},${d.y})`;
        });
    });

    // 拖动开始事件处理函数
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart(); // 激活模拟器
        d.fx = d.x; // 固定节点位置
        d.fy = d.y;
    }

    // 拖动中事件处理函数
    function dragged(event, d) {
        const radius = nodeRadius(d);
        // 边界检查：将拖动事件的坐标限制在绘制区域内
        d.fx = Math.max(radius, Math.min(drawingWidth - radius, event.x));
        d.fy = Math.max(radius, Math.min(drawingHeight - radius, event.y));
    }

    // 拖动结束事件处理函数
    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0); // 停止激活模拟器
        d.fx = null; // 解除节点固定
        d.fy = null;
    }

    // 鼠标悬停事件处理函数
    function handleMouseOver(event, d) {
        // 将当前悬停的节点提到最前面，防止被其他元素遮挡
        d3.select(this).raise();

        // 突出显示与当前节点连接的线条
        link.attr("stroke-width", l => {
            if (l.source.id === d.id || l.target.id === d.id) {
                return highlightedLinkStrokeWidth; // 加粗
            } else {
                return defaultLinkStrokeWidth; // 保持默认
            }
        })
            .attr("stroke", l => {
                if (l.source.id === d.id || l.target.id === d.id) {
                    return highlightedLinkStrokeColor; // 改变颜色为纯黑色
                } else {
                    return defaultLinkStrokeColor; // 保持默认
                }
            });
    }

    // 鼠标移开事件处理函数
    function handleMouseOut(event, d) {
        // 恢复所有线条的默认样式
        link.attr("stroke-width", defaultLinkStrokeWidth)
            .attr("stroke", defaultLinkStrokeColor);
    }


    // 窗口大小调整事件处理函数，实现响应式
    window.addEventListener('resize', () => {
        // 重新获取最新的尺寸
        ({ svgWidth, svgHeight, drawingWidth, drawingHeight } = getDrawingDimensions());

        // 更新SVG的viewBox
        container.select("svg").attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`);

        // 更新力模拟器的中心点
        simulation.force("center", d3.forceCenter(drawingWidth / 2, drawingHeight / 2));
        simulation.alpha(0.3).restart(); // 重新启动模拟器以适应新尺寸
    });

    // 初始启动模拟器，使其布局快速稳定
    simulation.alpha(1).restart();
    console.log("生成的图数据集:", graphData);
});