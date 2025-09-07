import apiConfig from './api.js';

/**
 * Global request utility for uni-app.
 * Handles token, timeout, error toast, and mock mode.
 * @param {object} options - Parameters for uni.request
 * @returns {Promise<object>} Resolves with backend data field
 */
function request(options) {
    return new Promise((resolve, reject) => {
        const token = uni.getStorageSync('token');
        const headers = {
            ...(options.header || {}),
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        let timeoutTimer = null;
        const timeout = options.timeout || 15000;
        if (timeout) {
            timeoutTimer = setTimeout(() => {
                uni.hideLoading();
                uni.showToast({
                    title: '请求超时，请重试',
                    icon: 'none',
                    duration: 3000
                });
                reject(new Error('请求超时'));
            }, timeout);
        }
        uni.request({
            ...options,
            header: headers,
            success: (res) => {
                if (timeoutTimer) clearTimeout(timeoutTimer);
                const responseData = res.data;

                if (apiConfig.MOCK_MODE_ENABLED && options.url.includes('apifoxmock.com') && responseData) {
                    console.warn(`[Mock Override] Forcing response code to 200 for URL: ${options.url}`);
                    responseData.code = 200;
                }

                const successCodes = [200];

                if (responseData && successCodes.includes(responseData.code)) {
                    resolve(responseData.data);
                } else {
                    const errorMessage = (responseData && responseData.message) || '业务处理失败';
                    uni.showToast({
                        title: errorMessage,
                        icon: 'none',
                        duration: 3000
                    });
                    reject(new Error(errorMessage));
                }
            },
            fail: (err) => {
                if (timeoutTimer) clearTimeout(timeoutTimer);

                console.error(`Request Failed for ${options.url}:`, err);

                if (apiConfig.MOCK_MODE_ENABLED && options.url.includes('apifoxmock.com') && err.data) {
                    console.warn(`[Mock Rescue] Rescuing a failed HTTP request. Status: ${err.statusCode}`);
                    const errorMessage = (err.data && err.data.message) || '服务器开小差了 (Mock)';
                    uni.showToast({
                        title: errorMessage,
                        icon: 'none',
                        duration: 3000
                    });
                    reject(new Error(errorMessage));
                    return;
                }

                let errorMessage = '网络请求异常，请稍后重试';
                if (err.errMsg.includes('timeout')) {
                    errorMessage = '请求超时，请检查网络连接';
                } else if (err.errMsg.includes('fail') && err.statusCode) {
                    errorMessage = `服务器错误 (${err.statusCode})`;
                } else if (err.errMsg.includes('abort')) {
                    errorMessage = '请求被取消';
                }

                uni.showToast({
                    title: errorMessage,
                    icon: 'none',
                    duration: 3000
                });
                reject(err);
            }
        });
    });
}

/**
 * File upload utility for uni-app.
 * Handles token, timeout, error toast, and mock mode.
 * @param {object} options - Parameters for uni.uploadFile
 * @returns {Promise<object>} Resolves with backend data field
 */
// uploadFile 已拆分为独立模块 `utils/upload.js`

export default request;