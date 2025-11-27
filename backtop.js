(function () {
    // 使用 D3.js v7 选择“回到顶部”按钮
    const backToTopBtn = d3.select("#backToTopBtn");

    // 使用 D3.js 选择作为滚动阈值的 div.sub_content1
    const subContent1 = d3.select(".sub_content");

    let subContent1OffsetTop = 0;

    // 确保 subContent1 元素存在，并获取其 offsetTop
    // .node() 方法用于从 D3 选择集中获取底层的 DOM 元素
    if (subContent1.node()) {
        subContent1OffsetTop = subContent1.node().offsetTop;
        // 可以根据需要调整触发点，例如在 sub_content1 顶部以上或以下一些像素
        // subContent1OffsetTop -= 100; // 提前100px显示
    } else {
        console.warn("Element with class 'sub_content1' not found. Back to top button might not behave as expected.");
        // 如果找不到 sub_content1，可以设置一个默认的触发高度，或者让按钮始终隐藏/显示
        subContent1OffsetTop = window.innerHeight * 0.5; // 默认在页面高度一半时显示
    }


    // 滚动事件处理函数
    function handleScroll() {
        // 获取当前滚动位置
        const scrollY = window.scrollY || document.documentElement.scrollTop;

        // 检查滚动位置是否达到或超过 sub_content1 的顶部
        if (scrollY >= subContent1OffsetTop) {
            // 如果滚动到指定位置，则显示按钮
            backToTopBtn.classed("show", true);
        } else {
            // 否则隐藏按钮
            backToTopBtn.classed("show", false);
        }
    }

    // 使用 D3.js 为 window 添加滚动事件监听器
    d3.select(window).on("scroll", handleScroll);

    // 使用 D3.js 为“回到顶部”按钮添加点击事件监听器
    backToTopBtn.on("click", () => {
        // 平滑滚动到页面顶部
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    // 页面加载时执行一次检查，以防页面初始加载时就已滚动到指定位置
    handleScroll();

    // 监听窗口大小变化，重新计算 subContent1OffsetTop，以应对响应式布局变化
    d3.select(window).on("resize", () => {
        if (subContent1.node()) {
            subContent1OffsetTop = subContent1.node().offsetTop;
        }
        handleScroll(); // 重新检查按钮显示状态
    });
})();
