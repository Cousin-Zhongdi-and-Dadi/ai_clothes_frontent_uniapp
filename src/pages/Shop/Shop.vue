<!-- 素材库 -->

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
          :src="item.image"
          class="goods-image"
          mode="aspectFill"
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
    <recommendation-popup
      :visible="showRecommendation"
      @close="showRecommendation = false"
    />
  </view>
</template>

<script>
import request from '@/utils/request.js';
import apiConfig from '@/utils/api.js';
import RecommendationPopup from '@/components/RecommendationPopup.vue';

export default {
  name: 'ShopPage',
  components: { RecommendationPopup },
  data() {
    return {
      tabs: [],
      activeTabId: null,
      goods: [],
      page: 0,
      pageSize: 10,
      hasMore: true,
      isLoading: false,
      showRecommendation: false
    };
  },
    async onLoad() {
    // 判断是否今日首次进入
    const today = new Date().toISOString().slice(0, 10);
    const lastShow = uni.getStorageSync('recommendation_popup_last_show');
    if (lastShow !== today) {
      this.showRecommendation = true;
      uni.setStorageSync('recommendation_popup_last_show', today);
    }
    await this.fetchCategories();     this.refresh();   },
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
                if (this.activeTabId === null && this.tabs.length > 0) {
          this.activeTabId = this.tabs[0].id;
        }
      } catch (error) {
        console.error("fetchCategories failed:", error);
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
          image: item.imageGif,           price: item.price,
        }));

                newItems.slice(0, 10).forEach((item, idx) => {
          
        });

        if (loadMore) {
          this.goods = [...this.goods, ...newItems];
          this.page++;         } else {
          this.goods = newItems;
          this.page = 1;         }
        this.hasMore = newItems.length === this.pageSize;
      } catch (error) {
        console.error("fetchGoods failed:", error);
      } finally {
        this.isLoading = false;
      }
    },
        async refresh() {
      this.page = 0;       this.goods = [];
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
  white-space: nowrap;
  height: 70rpx;
  align-items: center;
}
.tab {
  display: inline-block;
  font-size: 28rpx;
  color: #999;
  margin-right: 32rpx;
  padding: 0 8rpx;
  line-height: 48rpx;
  height: 48rpx;
  white-space: nowrap;
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
</style>