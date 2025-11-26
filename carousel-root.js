(function () {
    const imageData = [
        { src: 'lsm.jpg', alt: 'LSM Painting' },
        { src: '牙牙乐1.jpg', alt: 'Yaya Le' },
        { src: '亚比怜怜.jpg', alt: 'Yabi Lian Lian' },
        { src: 'rukawa.jpg', alt: 'Rukawa Kaede' },
        { src: 'Autumn.jpg', alt: 'Boardgame Night' },
        { src: 'mill.jpg', alt: 'Windmill Scene' },
        { src: '小及生日.jpg', alt: 'oigawa' },
        { src: 'mitsui.jpg' },
    ];


    let imagesToShow = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--images-to-show'));
    let imageWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--image-width'));
    let imageSpacing = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--image-spacing'));
    let currentIndex = 0; 

    const carouselViewport = d3.select("#carousel-viewport");
    const imagesWrapper = d3.select("#carousel-images-wrapper");
    const prevBtn = d3.select("#prev-btn");
    const nextBtn = d3.select("#next-btn");
    const largeImageOverlay = d3.select("#large-image-overlay");
    const largeImage = d3.select("#large-image");
    const closeLargeImage = d3.select("#close-large-image");

    /**
     * 更新轮播视口的宽度，以适应当前显示的图片数量和间距。
     * 这是一个响应式处理的一部分，当 CSS 变量变化时需要调用。
     */
    function updateViewportWidth() {
        imagesToShow = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--images-to-show'));
        imageWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--image-width'));
        imageSpacing = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--image-spacing'));

        // 视口宽度 = 显示图片数量 * 图片宽度 + (显示图片数量 - 1) * 图片间隔
        // 使用 gap 属性后，这个计算是正确的，因为它只计算图片和它们之间的间距
        const viewportWidth = imagesToShow * imageWidth + (imagesToShow - 1) * imageSpacing;
        carouselViewport.style("width", `${viewportWidth}px`);

        // 同时更新外部容器的 max-width
        const carouselContainer = d3.select("#image-carousel-container");
        const arrowWidth = 50; // 根据 CSS 中的 .carousel-arrow width
        const arrowMargin = 10; // 根据 CSS 中的 .carousel-arrow margin
        const containerMaxWidth = viewportWidth + (2 * arrowWidth) + (2 * arrowMargin);
        carouselContainer.style("max-width", `${containerMaxWidth}px`);
    }

    // 初始设置视口宽度
    updateViewportWidth();

    // 渲染图片
    const images = imagesWrapper.selectAll(".carousel-image")
        .data(imageData)
        .enter()
        .append("img")
        .attr("class", "carousel-image")
        .attr("src", d => d.src)
        .attr("alt", d => d.alt)
        .on("click", showLargeImage); // 绑定点击事件显示大图

    /**
     * 更新轮播位置和按钮状态。
     * 根据 currentIndex 移动 imagesWrapper。
     */
    function updateCarousel() {
        // 计算需要移动的距离
        // 每移动一张图片，需要移动的距离是“一张图片的宽度”加上“它右边的间距”
        const offset = -currentIndex * (imageWidth + imageSpacing);
        // 使用 D3 的 style 方法和 CSS transform 实现平滑滚动
        imagesWrapper.style("transform", `translateX(${offset}px)`);

        // 根据当前索引禁用/启用导航按钮
        prevBtn.attr("disabled", currentIndex === 0 ? true : null);
        // 当剩余图片不足以填满视口时，禁用 next 按钮
        nextBtn.attr("disabled", currentIndex >= imageData.length - imagesToShow ? true : null);
    }

    // 导航按钮点击事件监听器
    prevBtn.on("click", () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });

    nextBtn.on("click", () => {
        // 确保不会滚动到图片列表的末尾之外
        if (currentIndex < imageData.length - imagesToShow) {
            currentIndex++;
            updateCarousel();
        }
    });

    /**
     * 显示大图覆盖层。
     * @param {Event} event - 点击事件对象。
     * @param {Object} d - 绑定的图片数据。
     */
    function showLargeImage(event, d) {
        largeImage.attr("src", d.src);
        largeImage.attr("alt", d.alt);
        largeImageOverlay.classed("visible", true); // 添加 visible 类来显示
    }

    /**
     * 隐藏大图覆盖层。
     */
    function hideLargeImage() {
        largeImageOverlay.classed("visible", false); // 移除 visible 类来隐藏
    }

    // 大图覆盖层和关闭按钮的点击事件
    closeLargeImage.on("click", hideLargeImage);
    largeImageOverlay.on("click", (event) => {
        // 只有当点击的是覆盖层本身（而不是内部的图片）时才关闭
        if (event.target.id === "large-image-overlay") {
            hideLargeImage();
        }
    });

    // 监听窗口大小变化，重新计算视口宽度和更新轮播位置
    window.addEventListener('resize', () => {
        updateViewportWidth(); // 重新计算视口宽度和容器宽度
        // 调整 currentIndex，确保在新的 imagesToShow 下不会越界
        if (currentIndex > imageData.length - imagesToShow) {
            currentIndex = Math.max(0, imageData.length - imagesToShow);
        }
        updateCarousel(); // 更新轮播位置
    });

    // 页面加载后首次渲染轮播
    updateCarousel();
})();