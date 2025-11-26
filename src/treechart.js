(function () {
    const treeData = {
        "name": "Personal skill",
        "children": [
            {
                "name": "Painting & designing",
                "children": [
                    { "name": "Learning from childhood" },
                    { "name": "Able to use software such as Photoshop and SAI" },
                    { "name": "Once designed the cover for the Korean magazine WEHONG" }
                ]
            },
            {
                "name": "Video editing",
                "children": [
                    { "name": "Able to use Premiere Rush and After Effect" },
                    { "name": "Operating a bilibili account" },
                    { "name": "Have internship experience in video account operation" }
                ]
            },
            {
                "name": "Writing",
                "children": [
                    { "name": "Good at narrative writing" },
                    { "name": "Publish fan fiction on the online platform" }
                ]
            },
            {
                "name": "Project planning",
                "children": [
                    { "name": "Studied relevant knowledge in college" },
                    { "name": "Have participated in several planning works" }
                ]
            }
        ]
    };
    const colors = ["#9467bd","#1f77b4", "#2ca02c","#ff7f0e", "#d62728", ];
    const colorScale = d3.scaleOrdinal(colors);

    // 1. 定义深度缩放因子，用于压缩横向距离
    // 原始值是 1.0，设置为 0.4 将横向距离缩小 60%
    const depthScaleFactor = 0.4;

    // 2. 设置布局尺寸和边距
    const margin = { top: 30, right: 120, bottom: 30, left: 120 };

    // 假设图表需要足够宽来容纳长文本，并根据节点数量设置高度
    const width = 1000 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // 3. 创建 SVG 容器
    // 注意：如果您是在一个完整的HTML文件中运行，请确保 #vis-treechart 元素存在
    const svg = d3.select("#vis-treechart")
        .append("svg")
        // 设置实际的 SVG 尺寸，使其包含边距
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // 4. 定义树状布局
    const treemap = d3.tree().size([height, width]);

    // 5. 准备数据
    let root = d3.hierarchy(treeData, d => d.children);

    // 6. 计算节点位置
    root = treemap(root);

    // 7. 绘制连接线 (Links)
    const link = svg.selectAll(".link")
        .data(root.links())
        .enter().append("path")
        .attr("class", "link")
        // ****** 关键修改点：设置连线颜色 ******
        // 连线的颜色由其源节点 (source) 的深度决定
        .style("stroke", d => colorScale(d.source.depth))
        .attr("d", d3.linkHorizontal()
            .x(d => d.y * depthScaleFactor)
            .y(d => d.x)
        );

    // 8. 绘制节点 (Nodes)
    const node = svg.selectAll(".node")
        .data(root.descendants())
        .enter().append("g")
        .attr("class", d => `node level-${d.depth}` + (d.children ? " node--internal" : " node--leaf"))
        // **修改点：应用缩放因子到横坐标 (d.y)**
        .attr("transform", d => `translate(${d.y * depthScaleFactor},${d.x})`);

    // 添加圆圈
    node.append("circle")
        .attr("r", 6)
        // ****** 关键修改点：设置圆圈颜色 ******
        // 圆圈的颜色由其自身的深度决定
        .style("fill", d => colorScale(d.depth))
        // 确保圆圈的描边颜色也与层级颜色一致 (可选，但通常有助于美观)


    // 添加文本标签
    node.append("text")
        // 根据节点深度调整文本位置和对齐方式
        .attr("dy", ".35em")
        .attr("x", d => d.children ? -13 : 13) // 如果有子节点，文本在左侧；否则在右侧
        .style("text-anchor", d => d.children ? "end" : "start")
        .text(d => d.data.name)
        // 确保长文本不会被截断
        .call(wrap, 200); // 调用 wrap 函数处理文本换行


    // 9. 文本换行函数 (可选，用于处理长文本标签)
    function wrap(text, width) {
        text.each(function () {
            const text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                lineHeight = 1.1, // ems
                x = text.attr("x"),
                y = text.attr("y"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

            let word, line = [], lineNumber = 0;

            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));

                // 检查文本宽度是否超出限制

            }
        });
    }
})();