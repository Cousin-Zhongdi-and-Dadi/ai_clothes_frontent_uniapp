/**
 * 检查用户是否登录，如果未登录则提示并跳转到登录页。
 * @param {Function} [action] - 如果用户已登录，则执行此回调函数。如果未提供，则检查通过时返回 true。
 * @returns {boolean} - 如果用户已登录且没有提供 action，则返回 true，否则返回 false。
 */
export function checkLoginAndProceed(action) {
    const token = uni.getStorageSync('token');

    if (!token) {
        uni.showToast({
            title: '请先登录',
            icon: 'none'
        });

        setTimeout(() => {
            uni.navigateTo({
                url: '/pages/LoginSelection/LoginSelection'
            });
        }, 1500);

        return false;
    }

    if (action && typeof action === 'function') {
        action();
    }

    return true;
}