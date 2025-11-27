(function () {
    const timelineData = [
        {
            year: 2024,
            companyRole: "Company: Shanghai Runmi Cultural Media Co.\nPosition: New Media Operations Assistant",
            description: "Responsible for content planning, scriptwriting, and video editing for the company's book marketing video channel. Independently managed the entire production process, from material selection to final video output. The average view count of the produced videos ranged from 1k to 3k, and each video contributed to the sale of 5 to 10 copies of the associated books.",
            image: "run.jpg",
            yearPosition: "above", // 'below' means below the timeline line
            companyRolePosition: "above", // 'below' means below the year label
            descriptionPosition: "blow", // 'above' means above the timeline line
            imagePosition: "above" // 'above' means above the description
        },
        {
            year: 2025,
            companyRole: "Company: Shanghai Media Group\nPosition: Visual editor",
            description: "Assisted in coordinating a cultural tourism campaign in collaboration with the Dunhuang Academy. Mainly responsible for the visual design and procurement negotiation works, contributing creative ideas to facilitate project advancement. This experience provided comprehensive insight into processes and execution patterns of project planning, significantly enhancing my professional expertise and related skills.",
            image: "smg.jpg",
            yearPosition: "above",
            companyRolePosition: "above",
            descriptionPosition: "below",
            imagePosition: "above"
        }
    ];

    // 2. SVG 尺寸和边距设置
    const containerWidth = document.getElementById('timeline-chart').clientWidth;
    const margin = { top: 130, right: 60, bottom: 90, left: 60 }; // Increased top/bottom margin for content

    // 计算 SVG 的总宽度和高度
    // SVG 宽度至少为 600px，或容器宽度，取较大值
    const svgWidth = Math.max(600, containerWidth);
    const svgHeight = 700; // 固定 SVG 高度

    // 计算实际绘图区域的宽度和高度 (减去边距)
    const chartWidth = svgWidth - margin.left - margin.right;
    const chartHeight = svgHeight - margin.top - margin.bottom;

    // 定义时间点距离时间轴两端的距离
    const pointPadding = 250; // 调整此值以改变距离

    // 3. 创建 SVG 容器
    const svg = d3.select("#timeline-chart")
        .append("svg")
        .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`) // 使用 svgWidth 和 svgHeight 作为 viewBox
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`); // 将整个图表内容平移到边距内部

    // 4. 定义比例尺
    const xScale = d3.scaleLinear()
        .domain(d3.extent(timelineData, d => d.year)) // 从最小年份到最大年份
        // 修改 range 以在两端添加 padding
        .range([pointPadding, chartWidth - pointPadding]);

    // 5. 绘制时间轴线
    const timelineY = chartHeight / 2; // 主时间轴线的 Y 坐标，相对于 chartHeight

    svg.append("line")
        .attr("class", "timeline-line")
        .attr("x1", 0) // 时间轴线从绘图区域的左侧开始
        .attr("y1", timelineY)
        .attr("x2", chartWidth + 20) // 时间轴线延伸到绘图区域右侧并留出箭头空间
        .attr("y2", timelineY);

    // 6. 添加箭头定义 (Marker)
    svg.append("defs").append("marker")
        .attr("id", "arrowhead")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 5) // 箭头尖端的位置
        .attr("refY", 0)
        .attr("markerWidth", 8)
        .attr("markerHeight", 8)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("class", "arrowhead");

    // 应用箭头到时间轴线
    d3.select(".timeline-line")
        .attr("marker-end", "url(#arrowhead)");

    // 7. 绘制时间点和相关内容
    const points = svg.selectAll(".timeline-point-group")
        .data(timelineData)
        .enter()
        .append("g")
        .attr("class", "timeline-point-group")
        // 每个点的 x 坐标由 xScale 决定，y 坐标为时间轴线的高度
        .attr("transform", d => `translate(${xScale(d.year)}, ${timelineY})`);

    // 绘制时间点 (圆圈)
    points.append("circle")
        .attr("class", "timeline-point")
        .attr("r", 8);

    // 绘制年份文字
    points.append("text")
        .attr("class", "timeline-year")
        .attr("x", 0)
        .attr("y", d => d.yearPosition === "below" ? 35 : -20) // 根据 yearPosition 放置在点下方或上方
        .text(d => d.year);

    // 绘制公司/角色文字 (使用 foreignObject 和 HTML div)
    const companyRoleFO_width = 410; // 对应 wrapText 之前的宽度
    const companyRoleFO_height = 80; // 估算高度，确保能容纳两行文本
    points.append("foreignObject")
        .attr("x", -companyRoleFO_width / 2) // 居中 foreignObject
        .attr("y", d => {
            // 如果年份在下方 (y=25)，公司/角色在年份下方，留出间距
            // 如果年份在上方 (y=-15)，公司/角色在年份上方，留出间距，并考虑自身高度
            return d.yearPosition === "below" ? (10 + 15) : (-20 - 15 - companyRoleFO_height);
        })
        .attr("width", companyRoleFO_width)
        .attr("height", companyRoleFO_height)
        .append("xhtml:div") // 使用 xhtml:div 命名空间
        .attr("class", "timeline-company-role-content")
        .html(d => d.companyRole.replace(/\n/g, '<br>')); // 将数据中的换行符转换为 HTML <br>

    // 绘制描述文字 (使用 foreignObject 和 HTML div)
    const descriptionFO_width = 400; // 对应 wrapText 之前的宽度
    const descriptionFO_height = 200; // 估算高度，确保能容纳描述文本
    points.append("foreignObject")
        .attr("x", -descriptionFO_width / 2) // 居中 foreignObject
        .attr("y", d => {
            // 如果描述在上方，则在时间轴线上方，考虑自身高度
            // 如果描述在下方，则在时间轴线下方
            return d.descriptionPosition === "above" ? (-descriptionFO_height - 20) : 10; // 20px 间距
        })
        .attr("width", descriptionFO_width)
        .attr("height", descriptionFO_height)
        .append("xhtml:div") // 使用 xhtml:div 命名空间
        .attr("class", "timeline-description-content")
        .html(d => d.description.replace(/\n/g, '<br>')); // 将数据中的换行符转换为 HTML <br>

    // 绘制图片
    const image_width = 300;
    const image_height = 100;
    points.append("image")
        .attr("class", "timeline-image")
        .attr("xlink:href", d => d.image)
        .attr("width", image_width)
        .attr("height", image_height)
        .attr("x", -image_width / 2) // 水平居中图片
        .attr("y", d => {
            // 如果图片在上方，则在描述上方，考虑描述 foreignObject 的高度和图片自身高度
            // 如果图片在下方，则在描述下方，考虑描述 foreignObject 的高度
            if (d.imagePosition === "above") {
                // 描述 foreignObject 的 y 坐标是 (-descriptionFO_height - 20)
                // 图片的 y 坐标应该在此之上，再减去图片高度和间距
                return (-descriptionFO_height + 80) - image_height - 100; // 10px 间距
            } else { // imagePosition === "below"
                // 描述 foreignObject 的 y 坐标是 20，高度是 descriptionFO_height
                // 图片的 y 坐标应该在其下方，加上间距
                return (-95 + descriptionFO_height) + 10; // 10px 间距
            }
        });

})();