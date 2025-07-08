import apiConfig from './api.js';

/**
 * 封装的全局请求函数 (终极版)
 * @param {object} options - uni.request 的原始参数
 * @returns {Promise<object>} - 返回一个Promise，resolve时返回后端原始的data对象
 */
function request(options) {
    return new Promise((resolve, reject) => {
        const token = uni.getStorageSync('token');

        // 1. 自动添加请求头
        const header = {
            ...options.header,
        };
        if (token) {
            header['Authorization'] = `Bearer ${token}`;
        }

        uni.request({
            ...options,
            header,
            success: (res) => {
                // 2. HTTP状态码为2xx，进入业务逻辑判断
                const responseData = res.data;

                // 新增：在Mock模式下，强制重写业务code为200
                if (apiConfig.MOCK_MODE_ENABLED && options.url.includes('apifoxmock.com') && responseData) {
                    console.warn(`[Mock Override] Forcing response code to 200 for URL: ${options.url}`);
                    responseData.code = 200;
                }

                // 成功的业务码，你可以根据后端定义修改，例如 200
                const successCodes = [200];

                if (responseData && successCodes.includes(responseData.code)) {
                    // 业务成功，直接返回 data 部分
                    resolve(responseData.data);
                } else {
                    // 业务失败（如code:401, 403等），统一处理错误
                    const errorMessage = (responseData && responseData.message) || '业务处理失败';
                    uni.showToast({ title: errorMessage, icon: 'none' });
                    reject(new Error(errorMessage));
                }
            },
            fail: (err) => {
                // 3. HTTP层面失败（如404, 500, 网络错误）
                console.error(`Request Failed for ${options.url}:`, err);

                // 智能Mock拯救：仅在Mock模式下，且后端返回了数据体时
                if (apiConfig.MOCK_MODE_ENABLED && options.url.includes('apifoxmock.com') && err.data) {
                    console.warn(`[Mock Rescue] Rescuing a failed HTTP request. Status: ${err.statusCode}`);
                    // 即使HTTP失败，我们也把它当成一次业务失败来处理，而不是让程序崩溃
                    const errorMessage = (err.data && err.data.message) || '服务器开小差了 (Mock)';
                    uni.showToast({ title: errorMessage, icon: 'none' });
                    reject(new Error(errorMessage));
                    return;
                }

                // 真实环境下的网络错误
                uni.showToast({ title: '网络请求异常，请稍后重试', icon: 'none' });
                reject(err);
            }
        });
    });
}

/**
 * 封装的全局文件上传函数
 * @param {object} options - uni.uploadFile 的原始参数
 * @returns {Promise<object>} - 返回一个Promise，resolve时返回后端原始的data对象
 */
export function uploadFile(options) {
    return new Promise((resolve, reject) => {
        const token = uni.getStorageSync('token');

        // 1. 自动添加请求头
        const header = {
            ...options.header,
        };
        if (token) {
            header['Authorization'] = `Bearer ${token}`;
        }

        uni.uploadFile({
            ...options,
            header,
            success: (uploadRes) => {
                // 2. 健壮性检查：确保服务器返回了可解析的数据
                if (!uploadRes.data || typeof uploadRes.data !== 'string') {
                    const errorMsg = '服务器返回无效数据';
                    uni.showToast({ title: errorMsg, icon: 'none' });
                    return reject(new Error(errorMsg));
                }

                let responseData;
                try {
                    responseData = JSON.parse(uploadRes.data);
                } catch (e) {
                    const errorMsg = '服务器响应解析失败';
                    uni.showToast({ title: errorMsg, icon: 'none' });
                    return reject(new Error(errorMsg));
                }

                // --- 开始修改 ---
                // 新增：在Mock模式下，强制重写业务code为200，与request函数保持一致
                if (apiConfig.MOCK_MODE_ENABLED && options.url.includes('apifoxmock.com') && responseData) {
                    console.warn(`[Mock Override] Forcing upload response code to 200 for URL: ${options.url}`);
                    responseData.code = 200;
                }
                // --- 结束修改 ---

                // 3. 业务逻辑判断 (与 request 函数保持一致)
                const successCodes = [200];
                if (responseData && successCodes.includes(responseData.code)) {
                    // 业务成功，直接返回 data 部分
                    resolve(responseData.data);
                } else {
                    // 业务失败，统一处理错误
                    const errorMessage = (responseData && responseData.message) || '上传失败';
                    uni.showToast({ title: errorMessage, icon: 'none' });
                    reject(new Error(errorMessage));
                }
            },
            fail: (err) => {
                // 4. HTTP层面失败
                console.error(`Upload Failed for ${options.url}:`, err);
                uni.showToast({ title: '网络请求异常，请稍后重试', icon: 'none' });
                reject(err);
            }
        });
    });
}

// 修改默认导出，同时导出两个函数
export default request;