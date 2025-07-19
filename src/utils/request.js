import apiConfig from './api.js';

/**
 * 封装的全局请求函数
 * @param {object} options - uni.request 的原始参数
 * @returns {Promise<object>} - 返回一个Promise，resolve时返回后端原始的data对象
 */
function request(options) {
    return new Promise((resolve, reject) => {
        const token = uni.getStorageSync('token');

        // 1. 自动添加请求头 (使用headers变量名避免冲突)
        const headers = {
            ...(options.header || {}),
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // 添加请求超时处理
        let timeoutTimer = null;
        const timeout = options.timeout || 15000; // 默认15秒超时

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

        // 调试日志
        console.log(`[Request] Sending to: ${options.url}`);
        console.log(`[Request] Headers:`, headers);
        console.log(`[Request] Method: ${options.method || 'GET'}`);
        if (options.data && typeof options.data === 'object') {
            console.log(`[Request] Data type: JSON object`);
            // 不要打印大文件内容
        } else {
            console.log(`[Request] Data:`, options.data);
        }

        uni.request({
            ...options,
            header: headers, // 使用新的headers变量
            success: (res) => {
                if (timeoutTimer) clearTimeout(timeoutTimer);

                // 调试日志
                console.log(`[Response] Received for ${options.url}:`, res);

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

                // 3. HTTP层面失败（如404, 500, 网络错误）
                console.error(`Request Failed for ${options.url}:`, err);

                // 智能Mock拯救：仅在Mock模式下，且后端返回了数据体时
                if (apiConfig.MOCK_MODE_ENABLED && options.url.includes('apifoxmock.com') && err.data) {
                    console.warn(`[Mock Rescue] Rescuing a failed HTTP request. Status: ${err.statusCode}`);
                    // 即使HTTP失败，我们也把它当成一次业务失败来处理，而不是让程序崩溃
                    const errorMessage = (err.data && err.data.message) || '服务器开小差了 (Mock)';
                    uni.showToast({
                        title: errorMessage,
                        icon: 'none',
                        duration: 3000
                    });
                    reject(new Error(errorMessage));
                    return;
                }

                // 详细错误分类处理
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
 * 封装的全局文件上传函数（增强版）
 * @param {object} options - uni.uploadFile 的原始参数
 * @returns {Promise<object>} - 返回一个Promise，resolve时返回后端原始的data对象
 */
export function uploadFile(options) {
    return new Promise((resolve, reject) => {
        const token = uni.getStorageSync('token');

        // 1. 自动添加请求头 (使用headers变量名避免冲突)
        const headers = {
            ...(options.header || {}),
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // 添加超时处理
        let timeoutTimer = null;
        const timeout = options.timeout || 20000; // 上传默认20秒超时

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

        // 临时文件路径处理
        let finalFilePath = options.filePath;
        if (finalFilePath && finalFilePath.startsWith('http://tmp/')) {
            console.warn(`检测到临时文件路径: ${finalFilePath}`);
            // 保持原样不做任何修改
        }

        // 调试日志
        console.log(`[Upload] Sending to: ${options.url}`);
        console.log(`[Upload] Headers:`, headers);
        console.log(`[Upload] File path: ${finalFilePath}`);

        const uploadTask = uni.uploadFile({
            ...options,
            filePath: finalFilePath,
            header: headers, // 使用新的headers变量
            success: (uploadRes) => {
                if (timeoutTimer) clearTimeout(timeoutTimer);

                // 调试日志
                console.log(`[Upload Response] Received for ${options.url}:`, uploadRes);

                // 关键改进：检查HTTP状态码
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

                // 2. 健壮性检查：确保服务器返回了可解析的数据
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

                // 新增：在Mock模式下，强制重写业务code为200
                if (apiConfig.MOCK_MODE_ENABLED && options.url.includes('apifoxmock.com') && responseData) {
                    console.warn(`[Mock Override] Forcing upload response code to 200 for URL: ${options.url}`);
                    responseData.code = 200;
                }

                // 3. 业务逻辑判断 (与 request 函数保持一致)
                const successCodes = [200];
                if (responseData && successCodes.includes(responseData.code)) {
                    // 业务成功，直接返回 data 部分
                    resolve(responseData.data);
                } else {
                    // 业务失败，统一处理错误
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

                // 4. HTTP层面失败
                console.error(`Upload Failed for ${options.url}:`, err);

                // 详细错误分类处理
                let errorMessage = '网络请求异常，请稍后重试';

                // 处理微信特定错误码
                if (err.errno) {
                    switch (err.errno) {
                        case 2: // 网络错误
                            errorMessage = '网络连接失败，请检查网络';
                            break;
                        case 3: // 超时
                            errorMessage = '上传超时，请重试';
                            break;
                        case 4: // 请求失败
                            errorMessage = '服务器请求失败';
                            break;
                        case 5: // 请求被阻止
                            errorMessage = '请求被阻止，请检查配置';
                            break;
                        case 6: // 请求中断
                            errorMessage = '上传被中断';
                            break;
                        default:
                            break;
                    }
                }
                // 处理通用错误消息
                else if (err.errMsg) {
                    if (err.errMsg.includes('timeout')) {
                        errorMessage = '上传超时，请重试';
                    } else if (err.errMsg.includes('fail')) {
                        // 关键改进：区分不同类型的失败
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

                // 返回更详细的错误对象
                const errorInfo = {
                    code: err.errno || -1,
                    message: errorMessage,
                    type: 'upload',
                    originalError: err
                };
                reject(errorInfo);
            }
        });

        // 添加上传进度监控
        uploadTask.onProgressUpdate((res) => {
            console.log(`上传进度: ${res.progress}%`);
            if (typeof options.onProgress === 'function') {
                options.onProgress(res);
            }
        });
    });
}

// 修改默认导出，同时导出两个函数
export default request;