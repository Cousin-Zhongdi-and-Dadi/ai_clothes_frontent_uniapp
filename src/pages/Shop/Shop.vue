<!-- 素材库 -->

<!-- 在页面最顶部添加 meta 标签 -->
<meta name="referrer" content="no-referrer" />

<template>
  <view class="shop-page">
    <view class="shop-tabs">
      <text
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab', { active: activeTabId === tab.id }]"
        @click="changeTab(tab)"
      >
        {{ tab.name }}
      </text>
    </view>
    <!-- 商品流式两列布局 -->
    <view class="goods-list">
      <view
        class="goods-item"
        v-for="item in goods"
        :key="item.id"
        @click="goToDetail(item.id)"
      >
        <image
          :src="testImageUrl"
          class="goods-image"
          mode="aspectFill"
          referrer="no-referrer|origin|unsafe-url"
        />
        <view class="goods-info">
          <text class="goods-name">{{ item.name }}</text>
          <text class="goods-desc">{{ item.desc }}</text>
        </view>
        <text class="goods-price">￥{{ item.price }}</text>
      </view>
    </view>
    <view
      class="bottom-status"
      v-if="!isLoading && (goods.length === 0 || !hasMore)"
    >
      <text class="bottom-status-text">到底了</text>
    </view>
  </view>
</template>

<script>
// 1. 导入封装的 request 函数和 apiConfig
import request from '@/utils/request.js';
import apiConfig from '@/utils/api.js';

export default {
  name: 'ShopPage',
  data() {
    return {
      tabs: [],
      activeTabId: null,
      goods: [],
      page: 0,
      pageSize: 10,
      hasMore: true,
      isLoading: false,
      testImageUrl: 'https://dabang-1301469943.cos.ap-guangzhou.myqcloud.com/mall/products/LOOK%2001_1.png?q-sign-algorithm=sha1&q-ak=AKIDgIW5GCGNb_eZfIScO7zLefu4aJRM-_z-XalWeM9HypjUM-kz-HPOIgW2_A2U1GTL&q-sign-time=1752686646;1752690246&q-key-time=1752686646;1752690246&q-header-list=host&q-url-param-list=&q-signature=58a17e03ab35beadea7a0a39dd036d8fa5008a4c&x-cos-security-token=kfEeYbYtCpQY1wakBGCSqkFooB2RIr9a162ad5890902f565913ff768322f9514bpwsZD55MYaPl2VRe3ylGustceUsnx7bZ52cv_zmiPbfo3mjH7HgSQg2A0mGr34n_UwM3kwDky2S8cqKRQ6HqfRw90xPl-FKmCGlvP-XXy1QCDASsSJJyKc-bvYrcWqKEg1WZgwC4yepGVKhKmy-FblPYz8uKxDt16vmvW8s91giHjH5o37CkwRnIIR1fCzYCCNCTjNdIXQSc-FQV8t7cc9LlthD4osdvBe9H09EIsT19I-VFNhqdlZQBkk_ByKHOjDXJu1nn5KAyMn6CiCVDii8pxDVOEk_NPen-IT1bO0iKgGD5S0ysodVaQWB_kauOqPj9_bRRrF0QWprelhe8G7SWFEi8CCTA3UpqfIe5d6DCn0DqGIaR5i3Yy0fRp70pkrghkFFllG5v-hLWqjbdUKTMf5z_9TsUPApubGdTVGd2vJ_8wyH6mcShy2HLQT0e27DttEM0jn-3tgnT1XrUcLmdJ7gtVtzB9UClkQfg6pkvshuleLbH9pcYWeHUFYAb0ZNebENrtnUqXmDFm-Z36cV4r2LdJL6cRD3dU05aGSbssLPyX1Vl2ZWZ7CMO-eEkBeDc-_rpZkSAH3fvCNmi1Rv64A0tMlQZ9A-NqEpoUYDxhKkQNs17_VmJ0Zwt0C1mydkOJbstC3pTPI7FWHxzRhzieIax1WOIzUDXduN2djqh2yjc4eTeQq1KXJnKG0Kzubh9zdlt7asenHiIRjhk6_qgG5RtUTU72osOVDSEZNsk2i-N_M5qfZpJk5yVFg2sXrVqs12OWaqtBahcrHimNrm7oL0aNVBy1LGxxvYH_RS7_0pBL7zWUmu9-lYXL86ZAkkra3XiZcqQoEHFyJFGPxcsxPuNr8HnkaZpKtv39ISOCnprtfTfBVNQSPVc1mHHN-eUARBccAv4Kb3vrEPCK7cjSMuJMtTuGA3iMW5B0-Sm9NqalcW5yMQo-tu9fWe-cQJLMWnYr0T3plgFs8scCNjHQbB9HnjwEmFU5tGYaJk1_Td6qO0pAcv5ZE4_E96N-q_7XXl_yzhiU0HcaWjiafbIF3UKzrLrAPFNz9QKvSmCifOPNF8mcO2h6cu5MuwEXOIaGir1xIh3UBLt-77GYz933C1JpC7LKzvCsW3nbvW8eRcF5ceojN6VPgVRHFG-s7hRlrpSiVe0Z2q1VyP2P3IiZBxEZY49gHSRaF7kS6vAifCH4BXF6pc1Z0g8nHeRb4h0YXO-0_pCS_QmCvX01Lox68JnCQa4vz22dRJMVY'
    };
  },
  // 5. 修改：onLoad 中并行获取分类和商品，提升加载速度
  async onLoad() {
    await this.fetchCategories(); // 必须先获取分类
    this.refresh(); // 然后根据默认分类刷新商品
  },
  onReachBottom() {
    this.fetchGoods(true);
  },
  onPullDownRefresh() {
    this.refresh().then(() => {
      uni.stopPullDownRefresh();
    });
  },
  methods: {
    goToDetail(id) {
      uni.navigateTo({
        url: `/pages/GoodsDetail/GoodsDetail?id=${id}`,
      });
    },
    // 2. 改造 fetchCategories 方法
    async fetchCategories() {
      try {
        const res = await request({
          url: `${apiConfig.BASE_URL}/mall/getCategory`,
          method: 'GET',
        });
        // 新API返回 { code, message, data: [...] }
        const categoryList = Array.isArray(res) ? res : [];
        const categories = categoryList
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(cat => ({
            id: cat.id,
            name: cat.categoryName,
          }));
        this.tabs = [{ name: '推荐', id: null }, ...categories];
        // 修复：初始时设置 activeTabId，确保商品能正常显示
        if (this.activeTabId === null && this.tabs.length > 0) {
          this.activeTabId = this.tabs[0].id;
        }
      } catch (error) {
        console.error("fetchCategories failed:", error);
        // 错误提示已由 request 函数处理，这里只做降级处理
        if (this.tabs.length === 0) {
          this.tabs = [{ name: '推荐', id: null }];
        }
      }
    },
    changeTab(tab) {
      if (this.activeTabId === tab.id) return;
      this.activeTabId = tab.id;
      this.refresh();
    },
    // 3. 改造 fetchGoods 方法
    async fetchGoods(loadMore = false) {
      if (this.isLoading || (loadMore && !this.hasMore)) {
        return;
      }
      this.isLoading = true;

      let url = '';
      const params = { page: this.page, pageSize: this.pageSize };

      if (this.activeTabId === null) {
        url = `${apiConfig.BASE_URL}/mall/getRecommended`;
      } else {
        url = `${apiConfig.BASE_URL}/mall/getProductByTypeId/${this.activeTabId}`;
      }

      try {
        const res = await request({
          url: url,
          method: 'GET',
          data: params,
        });
        const goodsList = Array.isArray(res) ? res : [];
        const newItems = goodsList.map(item => ({
          id: item.id,
          name: item.productName,
          desc: item.description,
          image: item.imageGif,
          price: item.price,
        }));

        if (loadMore) {
          this.goods = [...this.goods, ...newItems];
          this.page++; // 下一页自增
        } else {
          this.goods = newItems;
          this.page = 1; // 首次加载后，下一页应为1
        }
        this.hasMore = newItems.length === this.pageSize;
      } catch (error) {
        console.error("fetchGoods failed:", error);
      } finally {
        this.isLoading = false;
      }
    },
    // 4. refresh 方法
    async refresh() {
      this.page = 0; // 从第0页开始
      this.goods = [];
      this.hasMore = true;
      await this.fetchGoods();
    },
  },
};
</script>

<style scoped>
.shop-page {
  background: #fafafa;
  min-height: 100vh;
  padding-bottom: 120rpx;
}
.shop-header {
  padding: 30rpx 0 10rpx 0;
  text-align: center;
  background: #fff;
}
.shop-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #222;
}
.shop-tabs {
  display: flex;
  flex-direction: row;
  background: #fff;
  padding: 0 20rpx;
  border-bottom: 1rpx solid #eee;
  overflow-x: auto;
  white-space: nowrap; /* 新增：防止换行 */
  height: 70rpx; /* 新增：固定高度，防止被内容撑高 */
  align-items: center; /* 新增：垂直居中tab内容 */
}
.tab {
  display: inline-block; /* 新增：让tab横向排列且不换行 */
  font-size: 28rpx;
  color: #999;
  margin-right: 32rpx;
  padding: 0 8rpx; /* 修改：上下padding为0，左右适当留白 */
  line-height: 48rpx; /* 新增：让tab内容垂直居中 */
  height: 48rpx; /* 新增：与line-height一致，保证高度 */
  white-space: nowrap; /* 新增：防止tab内容换行 */
  border-bottom: 4rpx solid transparent;
}
.tab.active {
  color: #6753e7;
  font-weight: bold;
  border-bottom: 4rpx solid #6753e7;
}
.goods-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 20rpx 20rpx 0 20rpx;
}
.goods-item {
  width: 47%;
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 20rpx;
}
.goods-image {
  width: 100%;
  height: 240rpx;
  border-radius: 16rpx 16rpx 0 0;
  object-fit: cover;
}
.goods-info {
  width: 90%;
  margin: 16rpx 0 0 0;
}
.goods-name {
  font-size: 26rpx;
  color: #222;
  font-weight: 500;
  display: block;
}
.goods-desc {
  font-size: 22rpx;
  color: #888;
  margin-top: 4rpx;
  display: block;
}
.goods-price {
  color: #6753e7;
  font-size: 28rpx;
  font-weight: bold;
  margin-top: 12rpx;
}
.bottom-status {
  width: 100%;
  text-align: center;
  padding: 32rpx 0 24rpx 0;
  color: #aaa;
  font-size: 26rpx;
}
/* [删除] 以下是加载状态的样式，将被移除 */
/* 
.loading-status {
  padding: 20rpx 0;
  width: 100%;
  text-align: center;
}
*/
</style>