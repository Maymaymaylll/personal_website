(function () {
    const navItems = document.querySelectorAll('.nav-item');
    // 注意：这里的ID需要与导航项的href匹配
    const sections = document.querySelectorAll('div[id]');
    const floatingNav = document.getElementById('floating-nav');

    // 函数：根据滚动位置高亮导航项
    function highlightNavItem() {
        let currentActiveSectionId = '';
        // 定义一个触发点，当区域顶部到达这个位置时，就算作是当前激活区域
        // 比如，当区域顶部距离视口顶部100px以内时
        const triggerOffset = 100;

        sections.forEach(section => {
            const rect = section.getBoundingClientRect(); // 获取元素相对于视口的位置信息

            // 判断区域是否在触发点上方（或刚好在触发点）且区域底部尚未离开触发点
            if (rect.top <= triggerOffset && rect.bottom > triggerOffset) {
                currentActiveSectionId = section.id;
            }
        });

        // 特殊处理：如果滚动到页面顶部，且没有其他区域被激活，则激活"Home"
        if (currentActiveSectionId === '' && window.scrollY === 0) {
            currentActiveSectionId = 'home-section';
        }

        // 移除所有导航项的active类，然后为当前激活的导航项添加active类
        navItems.forEach(item => {
            const targetId = item.getAttribute('href').substring(1); // 从href中提取ID (例如：#home-section -> home-section)
            if (targetId === currentActiveSectionId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // 给导航栏添加或移除 'scrolled' 类，用于改变导航栏背景
        if (window.scrollY > 50) { // 当滚动超过50px时
            floatingNav.classList.add('scrolled');
        } else {
            floatingNav.classList.remove('scrolled');
        }
    }

    // 监听滚动事件
    window.addEventListener('scroll', highlightNavItem);

    // 页面加载完成后立即执行一次，以确保初始状态正确
    document.addEventListener('DOMContentLoaded', highlightNavItem);

    // 为导航项添加点击平滑滚动效果
    navItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault(); // 阻止默认的跳转行为
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                // 使用scrollIntoView平滑滚动到目标区域
                // behavior: 'smooth' 提供平滑动画
                // block: 'start' 将元素顶部与视口顶部对齐
                // offsetTop 属性是元素相对于其 offsetParent 的顶部距离。
                // 我们可以计算出需要滚动到的位置，并减去导航栏的高度，以确保目标内容不会被导航栏遮挡。
                const navHeight = floatingNav.offsetHeight; // 获取导航栏高度
                const targetPosition = targetSection.offsetTop; // 减去导航栏高度和一些额外边距

                window.scrollTo({
                    top: targetPosition < 0 ? 0 : targetPosition, // 确保不会滚动到负值
                    behavior: 'smooth'
                });

                // 滚动结束后，手动触发一次高亮更新，确保点击后立即高亮
                // (虽然滚动事件会触发，但为了即时反馈，可以手动调用)
                setTimeout(highlightNavItem, 400); // 稍微延迟，等待平滑滚动完成
            }
        });
    });
})();