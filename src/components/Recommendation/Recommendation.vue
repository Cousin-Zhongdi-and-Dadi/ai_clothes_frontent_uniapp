<template>
  <view
    v-if="visible"
    class="recommendation-fullscreen-mask"
  >
    <view
      class="close-btn"
      @click="$emit('close')"
    >×</view>
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
          top: `${index * 100}rpx`,
          transform: `scale(${1 - index * 0.05})`,
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
          this.emptyMessage = '加载推荐失败或今日暂无推荐';
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
        this.addProcessedId(likedCard.id);
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
      // 可选：重置卡片动画
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
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.display_card {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.status-view {
  color: #fff;
  font-size: 32rpx;
  text-align: center;
}
</style>