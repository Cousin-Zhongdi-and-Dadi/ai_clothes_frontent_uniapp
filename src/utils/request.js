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
export function uploadFile(options) {
    return new Promise((resolve, reject) => {
        const token = uni.getStorageSync('token');

        const headers = {
            ...(options.header || {}),
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        let timeoutTimer = null;
        const timeout = options.timeout || 20000;
        if (timeout) {
            timeoutTimer = setTimeout(() => {
                uni.hideLoading();
                uni.showToast({
                    title: '上传超时，请重试',
                    icon: 'none',
                    duration: 3000
                });
                reject(new Error('上传超时'));
            }, timeout);
        }

        let finalFilePath = options.filePath;
        if (finalFilePath && finalFilePath.startsWith('http://tmp/')) {
            console.warn(`检测到临时文件路径: ${finalFilePath}`);
        }



        const uploadTask = uni.uploadFile({
            ...options,
            filePath: finalFilePath,
            header: headers, success: (uploadRes) => {
                if (timeoutTimer) clearTimeout(timeoutTimer);

                if (uploadRes.statusCode < 200 || uploadRes.statusCode >= 300) {
                    const errorMsg = `服务器返回错误状态码: ${uploadRes.statusCode}`;
                    console.error(errorMsg, uploadRes);
                    uni.showToast({
                        title: '服务器处理失败',
                        icon: 'none',
                        duration: 3000
                    });
                    return reject(new Error(errorMsg));
                }

                if (!uploadRes.data || typeof uploadRes.data !== 'string') {
                    const errorMsg = '服务器返回无效数据';
                    uni.showToast({
                        title: errorMsg,
                        icon: 'none',
                        duration: 3000
                    });
                    return reject(new Error(errorMsg));
                }

                let responseData;
                try {
                    responseData = JSON.parse(uploadRes.data);
                } catch (e) {
                    const errorMsg = '服务器响应解析失败';
                    uni.showToast({
                        title: errorMsg,
                        icon: 'none',
                        duration: 3000
                    });
                    return reject(new Error(errorMsg));
                }

                if (apiConfig.MOCK_MODE_ENABLED && options.url.includes('apifoxmock.com') && responseData) {
                    console.warn(`[Mock Override] Forcing upload response code to 200 for URL: ${options.url}`);
                    responseData.code = 200;
                }

                const successCodes = [200];
                if (responseData && successCodes.includes(responseData.code)) {
                    resolve(responseData.data);
                } else {
                    const errorMessage = (responseData && responseData.message) || '上传失败';
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

                console.error(`Upload Failed for ${options.url}:`, err);

                let errorMessage = '网络请求异常，请稍后重试';

                if (err.errno) {
                    switch (err.errno) {
                        case 2: errorMessage = '网络连接失败，请检查网络';
                            break;
                        case 3: errorMessage = '上传超时，请重试';
                            break;
                        case 4: errorMessage = '服务器请求失败';
                            break;
                        case 5: errorMessage = '请求被阻止，请检查配置';
                            break;
                        case 6: errorMessage = '上传被中断';
                            break;
                        default:
                            break;
                    }
                }
                else if (err.errMsg) {
                    if (err.errMsg.includes('timeout')) {
                        errorMessage = '上传超时，请重试';
                    } else if (err.errMsg.includes('fail')) {
                        if (err.errMsg.includes('request:fail')) {
                            errorMessage = '服务器连接失败';
                        } else if (err.errMsg.includes('uploadFile:fail')) {
                            errorMessage = '文件上传失败';
                        }
                    } else if (err.errMsg.includes('abort')) {
                        errorMessage = '上传已取消';
                    }
                }

                uni.showToast({
                    title: errorMessage,
                    icon: 'none',
                    duration: 3000
                });

                const errorInfo = {
                    code: err.errno || -1,
                    message: errorMessage,
                    type: 'upload',
                    originalError: err
                };
                reject(errorInfo);
            }
        });

        uploadTask.onProgressUpdate((res) => {

            if (typeof options.onProgress === 'function') {
                options.onProgress(res);
            }
        });
    });
}

export default request;