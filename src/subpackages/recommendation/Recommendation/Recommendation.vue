<template>
  <view class="recommendation-page">
    <view
      class="card-stack"
      ref="cardStack"
    >
      <display-card
        v-for="(card, index) in cards"
        :key="card.id"
        :ref="`card-${index}`"
        class="display_card"
        :frontImage="card.frontImage"
        :backText="card.backText"
        :style="{
          transform: `translate(-50%, -50%) scale(${1 - index * 0.05}) translateY(${index * 100}rpx)`,

          zIndex: cards.length - index
        }"
        :canInteract="index === 0"
        @swipeLeft="handleSwipeLeft(index)"
        @swipeRight="handleSwipeRight(index)"
        @click="handleCardClick(index)"
      />
      <view
        v-if="isLoading"
        class="status-view"
      >
        <view class="loading-animation"></view>
        <text>正在加载今日推荐...</text>
      </view>
      <view
        v-else-if="cards.length === 0"
        class="status-view"
      >
        <text>{{ emptyMessage }}</text>
        <button
          class="retry-btn"
          @click="resetTodayProcessed"
        >重看</button>
      </view>
    </view>
  </view>
</template>

<script>
import DisplayCard from '@/components/DisplayCard/DisplayCard.vue';
import request from '@/utils/request.js';
import apiConfig from '@/utils/api.js';

export default {
  components: { DisplayCard },
  data() {
    return {
      cards: [],
      isLoading: true,
      emptyMessage: '看完啦',
      isGuest: false
    };
  },
  // page lifecycle: load when page is shown
  onLoad() {
    const token = uni.getStorageSync('token');
    this.isGuest = !token;
    this.loadInitialStack();
  },
  onShow() {
    // refresh each time page becomes visible
    this.loadInitialStack();
  },
  methods: {
    async loadInitialStack() {
      this.isLoading = true;
      const processedIds = this.getProcessedIds();
      if (this.isGuest) {
        console.log('游客模式加载静态卡片', this.cards)
        this.cards = [
          {
            id: 1,
            frontImage: '/static/example_pictures/sample1.jpg',
            backText: '示例推荐1'
          },
          {
            id: 2,
            frontImage: '/static/example_pictures/sample2.jpg',
            backText: '示例推荐2'
          }
        ].filter(card => !processedIds.includes(card.id));
        this.isLoading = false;
        this.emptyMessage = '游客模式下仅展示部分静态推荐';
        return;
      }
      try {
        const res = await request({
          url: `${apiConfig.BASE_URL}/dailyRecommendation/getRecommendation`,
          method: 'GET',
        });
        let dataArr = Array.isArray(res) ? res : res.data;
        let newCards = (dataArr || []).filter(card => card && !processedIds.includes(card.id))
          .map(card => ({
            frontImage: card.imageGif,
            backText: card.description || '',
            id: card.id
          }));
        this.cards = newCards;
      } catch (error) {
        this.cards = [];
      } finally {
        this.isLoading = false;
        if (this.cards.length === 0) {
          this.emptyMessage = '今日推荐已看完';
        }
      }
    },
    getTodayStr() {
      return new Date().toISOString().slice(0, 10);
    },
    getProcessedIds() {
      const today = this.getTodayStr();
      const map = uni.getStorageSync('recommendation_processed_map') || {};
      return map[today] || [];
    },
    addProcessedId(id) {
      const today = this.getTodayStr();
      let map = uni.getStorageSync('recommendation_processed_map') || {};
      if (!map[today]) map[today] = [];
      if (!map[today].includes(id)) map[today].push(id);
      uni.setStorageSync('recommendation_processed_map', map);
    },
    // 清除当天已处理 ID，并重新加载推荐
    resetTodayProcessed() {
      const today = this.getTodayStr();
      let map = uni.getStorageSync('recommendation_processed_map') || {};
      map[today] = [];
      uni.setStorageSync('recommendation_processed_map', map);
      // 重新加载卡片
      this.loadInitialStack();
    },
    handleSwipeLeft(index) {
      if (index === 0) {
        const likedCard = this.cards[0];
        if (!likedCard) return;
        if (this.isGuest) {
          uni.showToast({
            title: '请登录后收藏',
            icon: 'none'
          });
        } else {
          this.addProcessedId(likedCard.id);
          // 这里可以添加收藏逻辑
        }
        this.cards.shift();
        this.$nextTick(() => this.resetCardPosition());
      }
    },
    handleSwipeRight(index) {
      if (index === 0) {
        const card = this.cards[0];
        if (card) this.addProcessedId(card.id);
        this.cards.shift();
        this.$nextTick(() => this.resetCardPosition());
      }
    },
    handleCardClick(index) {
      // 可选：弹出详情或其它操作
    },
    resetCardPosition() {
      // 只对当前可交互的卡片（index 0）重置
      if (this.cards.length > 0) {
        const cardRef = this.$refs[`card-0`];
        // 兼容 v-for 反回数组的情况
        const cardInstance = Array.isArray(cardRef) ? cardRef[0] : cardRef;
        if (cardInstance && typeof cardInstance.updateTransformX === 'function') {
          cardInstance.updateTransformX(0);
        }
      }
    }
    ,
    close() {
      // navigate back to previous page
      try {
        uni.navigateBack();
      } catch (e) {
        // fallback: redirect to home
        uni.reLaunch({ url: '/pages/index/index' });
      }
    }
  }
};
</script>

<style scoped>
.recommendation-page {
  min-height: 100vh;
  background: #faf7ff;
  padding: 36rpx;
  box-sizing: border-box;
}
.header {
  display: flex;
  align-items: center;
  position: relative;
  margin-bottom: 24rpx;
}
.back-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  margin-right: 16rpx;
}
.card-stack {
  width: 100%;
  min-height: 600rpx;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding-bottom: 60rpx;
}
.display_card {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  width: 90%;
  max-width: 720rpx;
  height: 700rpx;
  transition: transform 0.3s, box-shadow 0.3s;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
}

/* 让下方卡片边缘可见 */
.display_card:not(:first-child) {
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  filter: brightness(0.96);
}
.status-view {
  color: #6b6b8a; /* 深色，确保在浅背景可见 */
  font-size: 32rpx;
  text-align: center;
  z-index: 1; /* 状态提示层级低于卡片 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
}
.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #3b2b6c;
  text-align: center;
  z-index: 20;
  width: 100%;
}

.retry-btn {
  background: #fff;
  color: #333;
  padding: 10rpx 40rpx;
  border-radius: 12rpx;
  border: 1rpx solid #eee;
  font-size: 28rpx;
  width: 200rpx;
}
</style>