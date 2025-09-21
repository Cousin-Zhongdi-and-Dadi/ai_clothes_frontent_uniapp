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
        // 统一超时与竞态保护
        let timeoutTimer = null;
        const timeout = options.timeout ?? 60000; // 默认 60s，更适合需要推理时间的接口
        let settled = false; // 防止超时与 success/fail 同时触发造成重复提示
        let abortedByTimeout = false;

        const finalize = (type, payload) => {
            if (settled) return; // 已处理则忽略重复回调
            settled = true;
            if (timeoutTimer) clearTimeout(timeoutTimer);
            if (type === 'success') {
                resolve(payload);
            } else {
                reject(payload);
            }
        };

        // 发起请求，并保留任务句柄以便超时中断
        const requestTask = uni.request({
            ...options,
            header: headers,
            success: (res) => {
                if (settled) return; // 已经因超时/失败结束
                if (timeoutTimer) clearTimeout(timeoutTimer);
                const responseData = res.data;

                if (apiConfig.MOCK_MODE_ENABLED && options.url.includes('apifoxmock.com') && responseData) {
                    console.warn(`[Mock Override] Forcing response code to 200 for URL: ${options.url}`);
                    responseData.code = 200;
                }

                const successCodes = [200];

                if (responseData && successCodes.includes(responseData.code)) {
                    finalize('success', responseData.data);
                } else {
                    const errorMessage = (responseData && responseData.message) || '业务处理失败';
                    uni.showToast({
                        title: errorMessage,
                        icon: 'none',
                        duration: 3000
                    });
                    finalize('fail', new Error(errorMessage));
                }
            },
            fail: (err) => {
                if (settled) return; // 可能已经被超时流程处理
                if (timeoutTimer) clearTimeout(timeoutTimer);

                console.error(`Request Failed for ${options.url}:`, err);

                // Mock 场景容错
                if (apiConfig.MOCK_MODE_ENABLED && options.url.includes('apifoxmock.com') && err && err.data) {
                    console.warn(`[Mock Rescue] Rescuing a failed HTTP request. Status: ${err.statusCode}`);
                    const errorMessage = (err.data && err.data.message) || '服务器开小差了 (Mock)';
                    uni.showToast({
                        title: errorMessage,
                        icon: 'none',
                        duration: 3000
                    });
                    finalize('fail', new Error(errorMessage));
                    return;
                }

                const errMsg = (err && err.errMsg) || '';
                let errorMessage = '网络请求异常，请稍后重试';
                if (abortedByTimeout || errMsg.includes('timeout')) {
                    errorMessage = '请求超时，请检查网络连接';
                } else if (errMsg.includes('fail') && err && err.statusCode) {
                    errorMessage = `服务器错误 (${err.statusCode})`;
                } else if (errMsg.includes('abort')) {
                    errorMessage = '请求被取消';
                }

                uni.showToast({
                    title: errorMessage,
                    icon: 'none',
                    duration: 3000
                });
                finalize('fail', err || new Error(errorMessage));
            }
        });

        // 设置超时：到点则主动中断请求并提示
        if (timeout && Number(timeout) > 0) {
            timeoutTimer = setTimeout(() => {
                if (settled) return;
                abortedByTimeout = true;
                try {
                    if (requestTask && typeof requestTask.abort === 'function') {
                        requestTask.abort();
                    }
                } catch (e) {
                    // 忽略 abort 兼容性异常
                }
                uni.hideLoading();
                uni.showToast({
                    title: '请求超时，请重试',
                    icon: 'none',
                    duration: 3000
                });
                finalize('fail', new Error('请求超时'));
            }, Number(timeout));
        }
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