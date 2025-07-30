/**
 * Check if user is logged in. If not, show toast and redirect to login page.
 * @param {Function} [action] - Callback to execute if user is logged in.
 * @returns {boolean} True if logged in and no action provided, otherwise false.
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
                url: '/subpackages/user/LoginSelection/LoginSelection'
            });
        }, 1500);
        return false;
    }
    if (action && typeof action === 'function') {
        action();
    }
    return true;
}