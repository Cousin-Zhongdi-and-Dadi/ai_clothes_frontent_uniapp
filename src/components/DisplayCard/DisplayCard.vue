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
      <!-- 卡片正面图片 -->
      <view class="card-face card-front">
        <image
          :src="frontImage"
          class="card-image"
          @error="onImgError"
        />
      </view>
      <!-- 卡片背面文字及详情按钮 -->
      <view class="card-face card-back">
        <text class="card-back-text">{{ backText }}</text>
        <button class="details">查看更多细节</button>
      </view>
    </view>
  </view>
</template>

<script>
/**
 * DisplayCard component
 * Interactive card with swipe and flip features.
 * Props:
 *   - frontImage: Card front image (String)
 *   - backText: Card back text (String)
 *   - canInteract: Enable interaction (Boolean)
 * Emits:
 *   - swipeLeft: Triggered on left swipe
 *   - swipeRight: Triggered on right swipe
 */
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
      transformX: 0
    };
  },
  methods: {
    /**
     * Handle touch start event, record initial position
     */
    onTouchStart(e) {
      if (!this.canInteract) return;       this.startX = e.touches[0].clientX;
      this.isSwiping = true;
    },
    /**
     * Handle touch move event, update card offset
     */
    onTouchMove(e) {
      if (!this.canInteract) return;
      const deltaX = e.touches[0].clientX - this.startX;
      this.transformX = deltaX;     },
    /**
     * Handle touch end event, determine swipe direction and emit event
     */
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
        this.transformX = 0;       }
    },
    /**
     * Flip card between front and back
     */
    flipCard() {
      if (!this.canInteract) return;       this.isFlipped = !this.isFlipped;
    },
    /**
     * Update card offset from external control
     */
    updateTransformX(value) {
      this.transformX = value;
    },
    /**
     * Handle image error event
     */
    onImgError() {
      console.log('图片加载失败', this.frontImage);
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