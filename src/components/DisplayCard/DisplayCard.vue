<template>
  <view
    class="card-container"
    :class="{ swiping: isSwiping, 'swiped-left': swipedLeft, 'swiped-right': swipedRight }"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
    @click="flipCard"
    :style="{ transform: `translateX(${transformX}px)` }"
  >
    <view :class="['card', { flipped: isFlipped }]">
      <!-- 正面 -->
      <view class="card-face card-front">
        <image
          :src="frontImage"
          mode="aspectFill"
          class="card-image"
        ></image>
      </view>
      <!-- 背面 -->
      <view class="card-face card-back">
        <text class="card-back-text">{{ backText }}</text>
        <button class="details">查看更多细节</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'DisplayCard',
  props: {
    frontImage: {
      type: String,
      required: true
    },
    backText: {
      type: String,
      required: true
    },
    canInteract: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isSwiping: false,
      swipedLeft: false,
      swipedRight: false,
      startX: 0,
      isFlipped: false,
      transformX: 0 // 横向位移
    };
  },
  methods: {
    onTouchStart(e) {
      if (!this.canInteract) return; // 禁用滑动
      this.startX = e.touches[0].clientX;
      this.isSwiping = true;
    },
    onTouchMove(e) {
      if (!this.canInteract) return;
      const deltaX = e.touches[0].clientX - this.startX;
      this.transformX = deltaX; // 更新横向位移
    },
    onTouchEnd(e) {
      if (!this.canInteract) return;
      const deltaX = e.changedTouches[0].clientX - this.startX;
      this.isSwiping = false;

      if (deltaX < -100) {
        this.swipedLeft = true;
        this.$emit('swipeLeft');
      } else if (deltaX > 100) {
        this.swipedRight = true;
        this.$emit('swipeRight');
      } else {
        this.transformX = 0; // 重置横向位移
      }
    },
    flipCard() {
      if (!this.canInteract) return; // 禁用翻转
      this.isFlipped = !this.isFlipped;
    },
    updateTransformX(value) {
      this.transformX = value; // 更新 transformX 的值
      console.log(`Transform X updated to: ${value}`);
    }
  }
};
</script>

<style scoped>
.card-container {
  width: 100%;
  height: 800rpx;
  perspective: 1000rpx;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

.card {
  width: 100%;
  height: 100%;
  margin: 0;
  position: relative;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  transform-origin: center center;
}

.card.flipped {
  transform: rotateY(180deg);
}

.card-face {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  position: absolute;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.card-front {
  z-index: 2;
}

.card-image {
  width: 100%;
  height: 100%;
  border-radius: 20rpx;
  object-fit: cover;
}

.card-back {
  transform: rotateY(180deg);
  background: #f8f8f8;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20rpx;
}

.card-back-text {
  width: 80%;
  font-size: 32rpx;
  color: #333;
  text-align: center;
  word-break: break-all;
  margin-bottom: 20rpx;
}

.details {
  padding: 0rpx 20rpx;
  background-color: #6753e7;
  color: #fff;
  border: none;
  border-radius: 50rpx;
  cursor: pointer;
  text-align: center;
  font-size: 28rpx;
}

.swiping {
  transition: none;
}

.swiped-left {
  transform: translateX(-100%);
}

.swiped-right {
  transform: translateX(100%);
}
</style>