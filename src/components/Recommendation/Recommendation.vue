<template>
  <view
    v-if="visible"
    class="recommendation-fullscreen-mask"
  >
    <view
      class="close-btn"
      @click="$emit('close')"
    >×</view>
    <text class="title">今日推荐</text>
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
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      cards: [],
      isLoading: true,
      emptyMessage: '今日推荐已看完',
      isGuest: false
    };
  },
  watch: {
    visible(val) {
      if (val) {
        this.loadInitialStack();
      }
    }
  },
  created() {
    const token = uni.getStorageSync('token');
    this.isGuest = !token;
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
  }
};
</script>

<style scoped>
.recommendation-fullscreen-mask {
  position: fixed;
  z-index: 9999;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(120, 120, 120, 0.5); /* 项目通用灰色半透明 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.close-btn {
  position: absolute;
  right: 40rpx;
  top: 40rpx;
  font-size: 60rpx;
  color: #fff;
  z-index: 10;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 50%;
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.card-stack {
  width: 100vw;
  min-height: 800rpx;
  height: 800rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.display_card {
  position: absolute;
  left: 50%;
  top: 50%;
  /* 堆叠效果：每张卡片向下偏移并缩小一点 */
  /* index 由 v-for 传入，建议在 :style 里动态设置 */
  /* 这里仅保留基础样式，具体堆叠效果在 :style 里实现 */
  transform: translate(-50%, -50%);
  z-index: 10;
  width: 90vw;
  height: 800rpx;
  transition: transform 0.3s, box-shadow 0.3s;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
}

/* 让下方卡片边缘可见 */
.display_card:not(:first-child) {
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  filter: brightness(0.96);
}
.status-view {
  color: #fff;
  font-size: 32rpx;
  text-align: center;
  z-index: 1; /* 状态提示层级低于卡片 */
}
.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.title {
  position: absolute;
  top: 150rpx;
  left: 50%;
  transform: translateX(-50%);
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
  text-align: center;
  z-index: 20;
  width: 80vw;
  pointer-events: none;
}
</style>