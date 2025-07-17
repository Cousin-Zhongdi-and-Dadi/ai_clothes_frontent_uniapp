<template>
  <view class="container">
    <!-- <customer-service /> -->
    <cart-icon />

    <!-- 1. 加载状态 -->
    <view
      v-if="isLoading"
      class="status-view"
    >
      <view class="loading-animation"></view>
      <text>正在加载今日推荐...</text>
    </view>

    <!-- 2. 卡片堆栈 -->
    <view
      v-else-if="cards.length > 0"
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
          top: `${index * 100}rpx`, // 增加垂直偏移量
          transform: `scale(${1 - index * 0.05})`,
          zIndex: cards.length - index 
        }"
        :canInteract="index === 0"
        @swipeLeft="handleSwipeLeft(index)"
        @swipeRight="handleSwipeRight(index)"
        @click="handleCardClick(index)"
      />
    </view>

    <!-- 3. 空状态或加载失败状态 -->
    <view
      v-else
      class="status-view"
    >
      <text>{{ emptyMessage }}</text>
    </view>
  </view>
</template>

<script>
// 1. 导入封装的 request 函数和 apiConfig
import request from '@/utils/request.js';
import apiConfig from '@/utils/api.js';
import CartIcon from '@/components/CartIcon/CartIcon.vue';
import CustomerService from '@/components/CustomerService/CustomerService.vue';
import DisplayCard from '@/components/DisplayCard/DisplayCard.vue';

export default {
  components: { DisplayCard, CustomerService, CartIcon },
  data() {
    return {
      cards: [],
      isLoading: true,
      emptyMessage: '今日推荐已看完',
      isGuest: false // 新增：是否为游客模式
    };
  },
  created() {
    const token = uni.getStorageSync('token');
    this.isGuest = !token;
    this.loadInitialStack();
  },
  methods: {
    // 游客模式静态推荐数据
    getMockRecommendations() {
      return [
        {
          id: 1,
          frontImage: '/static/example_pictures/sample1.jpg',
          backText: '静态推荐1：欢迎体验游客模式！'
        },
        {
          id: 2,
          frontImage: '/static/example_pictures/sample2.jpg',
          backText: '静态推荐2：登录后可获得更多个性化推荐。'
        },
        {
          id: 3,
          frontImage: '/static/example_pictures/sample1.jpg',
          backText: '静态推荐3：登录后可获得更多个性化推荐。'
        },
        {
          id: 4,
          frontImage: '/static/example_pictures/sample2.jpg',
          backText: '静态推荐4：登录后可获得更多个性化推荐。'
        },
        {
          id: 5,
          frontImage: '/static/example_pictures/sample1.jpg',
          backText: '静态推荐5：登录后可获得更多个性化推荐。'
        }
      ];
    },
    // 2. 改造 loadInitialStack 和 fetchRecommendation
    async loadInitialStack() {
      this.isLoading = true;
      if (this.isGuest) {
        // 游客模式：加载本地静态数据
        this.cards = this.getMockRecommendations();
        this.isLoading = false;
        this.emptyMessage = '游客模式下仅展示部分静态推荐';
        return;
      }
      // 并行发起5个请求
      const promises = Array(5).fill(null).map(() => this.fetchRecommendation());
      try {
        const newCards = await Promise.all(promises);
        // 过滤掉请求失败的结果 (null)
        this.cards = newCards.filter(card => card !== null);
      } catch (error) {
        console.error("Error loading initial stack:", error);
        this.cards = [];
      } finally {
        this.isLoading = false;
        if (this.cards.length === 0) {
          this.emptyMessage = '加载推荐失败或今日暂无推荐';
        }
      }
    },

    async fetchRecommendation() {
      if (this.isGuest) {
        // 游客模式下不请求后端
        return null;
      }
      try {
        const data = await request({
          url: `${apiConfig.BASE_URL}/dailyRecommendation/getRecommendation`,
          method: 'GET',
        });
        // 业务成功，request 函数直接返回了 data
        return {
          frontImage: data.imageUrl,
          backText: data.description,
          // 使用后端返回的ID或一个随机ID作为key
          id: data.id || Date.now() + Math.random()
        };
      } catch (error) {
        console.error("fetchRecommendation failed:", error);
        // 任何错误（网络或业务）发生时，返回 null，以便 Promise.all 可以继续
        return null;
      }
    },

    // 3. 改造 addToFavorites 方法
    async addToFavorites(imageUrl) {
      if (this.isGuest) {
        uni.showToast({ title: '请登录后收藏', icon: 'none' });
        return;
      }
      if (!imageUrl) {
        console.error('没有可收藏的图片URL');
        return;
      }
      try {
        // 根据原代码逻辑，POST方法的参数在URL中
        await request({
          url: `${apiConfig.BASE_URL}/collection/add?imageUrl=${encodeURIComponent(imageUrl)}`,
          method: 'POST',
        });
        console.log('收藏成功:', imageUrl);
        // 成功时静默处理，不打扰用户
      } catch (error) {
        console.error('Favorite request failed:', error);
        // 错误提示已由 request 函数统一处理
      }
    },

    // 4. handleSwipeLeft 调用改造后的 addToFavorites
    handleSwipeLeft(index) {
      if (index === 0) {
        const likedCard = this.cards[0];
        if (!likedCard) return;

        console.log('喜欢当前卡片');
        this.addToFavorites(likedCard.frontImage);

        this.cards.shift();
        this.$nextTick(() => this.resetCardPosition());
      }
    },
    handleSwipeRight(index) {
      if (index === 0) {
        console.log('不喜欢当前卡片');
        this.cards.shift();
        this.$nextTick(() => this.resetCardPosition());
      }
    },
    resetCardPosition() {
      if (this.cards.length === 0) return;
      const refName = `card-0`;
      const cardRefs = this.$refs[refName];
      if (cardRefs && cardRefs.length > 0) {
        const nextCardRef = cardRefs[0];
        if (nextCardRef) {
          nextCardRef.isSwiping = false;
          nextCardRef.swipedLeft = false;
          nextCardRef.swipedRight = false;
          nextCardRef.isFlipped = false;
          nextCardRef.transformX = 0;
        }
      }
    },
    handleCardClick(index) {
      if (index === 0) {
        console.log('点击翻转卡片');
      }
    }
  }
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 100rpx;
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
  background-color: #f7f7f7;
}

.card-stack {
  position: relative;
  width: 100%;
  height: 800rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.display_card {
  position: absolute;
  width: 100%;
  max-width: 600rpx;
  transition: transform 0.3s ease, top 0.3s ease;
}

.status-view {
  width: 100%;
  text-align: center;
  margin-top: 200rpx;
  color: #666;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-animation {
  width: 60rpx;
  height: 60rpx;
  border: 6rpx solid #e0e0e0;
  border-top-color: #6c63ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20rpx;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>