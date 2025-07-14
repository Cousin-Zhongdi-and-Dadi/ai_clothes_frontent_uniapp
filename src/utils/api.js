// 在这里统一管理你的API域名
const BASE_URL = 'http://8.134.151.199:8800'; // 测试用url
// const BASE_URL = 'https://m1.apifoxmock.com/m1/6328147-6023520-default'; // Mock url

// 新增：Mock模式开关，开发时设为true，打包发布前设为false
const MOCK_MODE_ENABLED = false;

export default {
    BASE_URL,
    MOCK_MODE_ENABLED // 导出这个开关
};