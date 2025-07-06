import App from './App'
import Vue from 'vue'

// 1. 导入你的api配置
import apiConfig from '@/utils/api.js'

Vue.config.productionTip = false
App.mpType = 'app'

// 2. 添加全局请求拦截器 (修正版)
// 定义一个变量来暂存当前请求的URL
let currentRequestUrl = '';

uni.addInterceptor('request', {
    // 请求发起前调用
    invoke(args) {
        // 在请求发起前，将URL存起来
        currentRequestUrl = args.url;
    },
    // 响应成功后调用
    success(res) {
        // 检查是否开启了Mock模式，并且请求的是Apifox的Mock地址
        if (apiConfig.MOCK_MODE_ENABLED && currentRequestUrl.includes('mock.apifox.cn')) {
            // 检查返回的数据中是否存在 code 字段
            // 注意：uni.uploadFile 的返回数据 res.data 是字符串，需要解析
            let responseData = res.data;
            if (typeof responseData === 'string') {
                try {
                    responseData = JSON.parse(responseData);
                } catch (e) {
                    // 解析失败，说明不是JSON字符串，直接返回
                }
            }

            if (responseData && typeof responseData.code !== 'undefined') {
                console.log(`[Mock Interceptor] Rewriting code for ${currentRequestUrl}. Original: ${responseData.code}, New: 200`);
                // 强制将 code 修改为 200
                responseData.code = 200;

                // 如果原始数据是字符串，需要再转换回去
                if (typeof res.data === 'string') {
                    res.data = JSON.stringify(responseData);
                }
            }
        }
    },
    fail(err) {
        console.error('[Request Interceptor] Request Failed:', err);
    },
    // 请求完成后调用
    complete() {
        // 清空暂存的URL，避免影响下一次请求
        currentRequestUrl = '';
    }
});


const app = new Vue({
    ...App
})
app.$mount()
