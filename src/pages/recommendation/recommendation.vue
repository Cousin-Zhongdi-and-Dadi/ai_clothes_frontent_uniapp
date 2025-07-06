<template>
  <view class="container">
    <customer-service />
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
          top: `${index * 20}rpx`,
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
import CartIcon from '@/components/CartIcon/CartIcon.vue';
import CustomerService from '@/components/CustomerService/CustomerService.vue';
import DisplayCard from '@/components/DisplayCard/DisplayCard.vue';
import apiConfig from '@/utils/api.js'; // 导入API配置

export default {
  components: { DisplayCard, CustomerService, CartIcon },
  data() {
    return {
      cards: [],
      isLoading: true,
      emptyMessage: '今日推荐已看完'
    };
  },
  created() {
    this.loadInitialStack();
  },
  methods: {
    // 1. 加载初始卡片堆栈
    async loadInitialStack() {
      this.isLoading = true;
      const promises = Array(5).fill(null).map(() => this.fetchRecommendation());
      const newCards = await Promise.all(promises);
      this.cards = newCards.filter(card => card !== null);
      this.isLoading = false;
      if (this.cards.length === 0) {
        this.emptyMessage = '加载推荐失败或今日暂无推荐';
      }
    },
    // 2. 获取单张推荐卡片（返回一个Promise）
    fetchRecommendation() {
      return new Promise((resolve) => {
        const token = uni.getStorageSync('token');
        if (!token) {
          resolve(null);
          return;
        }
        const requestUrl = `${apiConfig.BASE_URL}/dailyRecommendation/getRecommendation`;
        uni.request({
          url: requestUrl,
          method: 'GET',
          header: { 'Authorization': `Bearer ${token}` },
          success: (res) => {
            if (res.data && res.data.data) {
              resolve({
                frontImage: res.data.data.imageUrl,
                backText: res.data.data.description,
                id: Date.now() + Math.random()
              });
            } else {
              resolve(null);
            }
          },
          fail: () => {
            resolve(null);
          }
        });
      });
    },
    // 3. 修改：处理左滑（喜欢）
    handleSwipeLeft(index) {
      if (index === 0) {
        const likedCard = this.cards[0];
        if (!likedCard) return;

        console.log('喜欢当前卡片');
        // 调用API将图片添加到收藏
        this.addToFavorites(likedCard.frontImage);

        // 从堆栈中移除卡片
        this.cards.shift();
        this.$nextTick(() => this.resetCardPosition());
      }
    },
    // 4. 新增：添加到收藏的方法
    addToFavorites(imageUrl) {
      if (!imageUrl) {
        console.error('没有可收藏的图片URL');
        return;
      }
      const token = uni.getStorageSync('token');
      if (!token) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        return;
      }

      // 根据API文档，使用POST方法，并将imageUrl作为Query参数
      const requestUrl = `${apiConfig.BASE_URL}/collection/add?imageUrl=${encodeURIComponent(imageUrl)}`;

      uni.request({
        url: requestUrl,
        method: 'POST',
        header: {
          'Authorization': `Bearer ${token}`
        },
        success: (res) => {
          if (res.data && res.data.code === 0) {
            console.log('收藏成功:', imageUrl);
            // 为了不打扰用户滑动体验，成功时可以不显示toast
          } else {
            // 仅在失败时提示用户
            uni.showToast({ title: (res.data && res.data.message) || '收藏失败', icon: 'none' });
          }
        },
        fail: (err) => {
          uni.showToast({ title: '网络请求失败', icon: 'none' });
          console.error('Favorite request failed:', err);
        }
      });
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