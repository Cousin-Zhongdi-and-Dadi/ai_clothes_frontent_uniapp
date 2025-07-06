// 在这里统一管理你的API域名
const BASE_URL = 'https://m1.apifoxmock.com/m1/6328147-6023520-default'; // 你的 Apifox Mock 地址

// 新增：Mock模式开关，开发时设为true，打包发布前设为false
const MOCK_MODE_ENABLED = true;

export default {
    BASE_URL,
    MOCK_MODE_ENABLED // 导出这个开关
};