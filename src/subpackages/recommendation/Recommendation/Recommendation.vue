<template>
  <view class="page">
    <view class="card-wrap">
      <!-- 底图 -->
      <image
        class="page-bg"
        src="/static/icon/每日推荐/底图.png"
        mode="widthFix"
      />

      <!-- 卡片容器背景图（覆盖 card-decoration 的视觉） -->
      <image
        class="card-bg"
        src="/static/icon/每日推荐/卡片.png"
        mode="widthFix"
      />

      <view class="card">
        <view class="card-header">
          <view>
            <text class="title">精彩推荐</text>
            <text class="subtitle">开启个性化穿搭</text>
          </view>
          <!-- 右上角星星：使用两种状态图片，点击会切换并 emit 状态 -->
          <image
            :src="currentStarSrc"
            mode="widthFix"
            class="star-btn"
            @click="handleStarClick"
          />
        </view>

        <view
          v-if="!isFinished"
          class="main-image-wrap"
        >
          <image
            :src="mainImageSrc"
            class="main-image"
            mode="aspectFill"
          />
        </view>

        <image
          v-if="!isFinished"
          :src="arrowSrc"
          class="arrow-btn"
          mode="widthFix"
          @click="handleArrowClick"
        />

        <view
          v-else
          class="finished-wrap"
          style="text-align:center;"
        >
          <text class="finished-text">已经看完啦！</text>
          <button
            class="restart-btn"
            @click="handleRestart"
          >重看</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'Recommendation',
  props: {
    // 主展示图片路径数组（外部传入）
    mainImageList: {
      type: Array,
      default: () => [
        '/static/example_pictures/sample1.jpg',
        '/static/example_pictures/sample2.jpg'
      ]
    },
    // 右上角星星图片路径（空/有色），提供默认值
    starEmptySrc: {
      type: String,
      default: '/static/icon/ai评价/评分星星无色.png'
    },
    starFilledSrc: {
      type: String,
      default: '/static/icon/ai评价/评分星星有色.png'
    },
    // 右下角箭头/按钮图片（默认使用“按钮.png”）
    arrowSrc: {
      type: String,
      default: '/static/icon/每日推荐/按钮.png'
    },
    // 可选：当点击星星时，若提供为页面路径（uni-app 路径），组件会尝试跳转
    starAction: {
      type: String,
      default: ''
    },
    // 可选：当点击箭头时，若提供为页面路径（uni-app 路径），组件会尝试跳转
    arrowAction: {
      type: String,
      default: ''
    },
    // 可选初始是否已收藏/已点星
    starInitiallyFilled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      starFilled: this.starInitiallyFilled,
      currentImageIndex: 0,
      isFinished: false
    }
  },
  computed: {
    currentStarSrc() {
      return this.starFilled ? this.starFilledSrc : this.starEmptySrc
    },
    mainImageSrc() {
      // 当前展示图片
      if (Array.isArray(this.mainImageList) && this.mainImageList.length > 0) {
        return this.mainImageList[this.currentImageIndex]
      }
      // 兼容旧用法
      return '/static/example_pictures/sample2.jpg'
    }
  },
  methods: {
    handleStarClick() {
      // 切换本地状态并 emit 新状态
      this.starFilled = !this.starFilled
      this.$emit('star-click', { filled: this.starFilled })

      // 如果传入了跳转路径，尝试 navigateTo
      if (this.starAction) {
        try {
          uni.navigateTo({ url: this.starAction })
        } catch (e) {
          console.warn('navigateTo failed for starAction', this.starAction, e)
        }
      }
    },
    handleArrowClick() {
      // 切换到下一张图片
      if (Array.isArray(this.mainImageList) && this.mainImageList.length > 0) {
        if (this.currentImageIndex < this.mainImageList.length - 1) {
          this.currentImageIndex++
        } else {
          // 已到最后一张，显示提示
          this.isFinished = true
        }
      }
      this.$emit('arrow-click', { currentIndex: this.currentImageIndex, finished: this.isFinished })

      if (this.arrowAction) {
        try {
          uni.navigateTo({ url: this.arrowAction })
        } catch (e) {
          console.warn('navigateTo failed for arrowAction', this.arrowAction, e)
        }
      }
    },
    handleRestart() {
      this.currentImageIndex = 0
      this.isFinished = false
      this.$emit('restart')
    }
  }
}
</script>

<style lang="scss" scoped>
.page {
  padding: 0;
  background: #f7f5fb;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-wrap {
  position: absolute;
  left: 0;
  width: 100vw;
  max-width: 650rpx;
  display: flex;
  justify-content: center;
}
/* 已看完提示整体居中样式 */
.finished-wrap {
  position: relative;
  top: 250rpx;
  min-height: 500rpx;
  height: 60vh;
  width: 100%;
}

/* 可选：如需左上角圆形装饰可用伪元素或box-shadow模拟 */

.card {
  position: relative;
  padding: 60rpx 60rpx 60rpx 60rpx;
  width: 100%;
  max-width: 650rpx;
  box-sizing: border-box;
  z-index: 2;
  margin-top: 120rpx; /* 留出顶部空间给背景图 */
  margin-left: 100rpx;
}

/* 背景图片应当在 card 下面，所以放在 card-wrap 层级的绝对定位，z-index 低于 .card */
.page-bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
  opacity: 1;
  pointer-events: none;
}

.card-bg {
  position: absolute;
  left: 60rpx;
  top: 100rpx;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.title {
  font-size: 72rpx;
  font-weight: 900;
  color: #1a1a1a;
  line-height: 1.1;
}
.subtitle {
  display: block;
  margin-top: 8rpx;
  color: #222;
  font-size: 28rpx;
  font-weight: 400;
}

.star-btn {
  width: 56rpx;
  height: 56rpx;
  border-radius: 28rpx;
  margin-left: 0;
  margin-top: 20rpx;
  position: absolute;
  right: 20rpx;
  top: 100rpx;
}
.star-placeholder {
  width: 56rpx;
  height: 56rpx;
  border-radius: 28rpx;
  background: #fff7ff;
  color: #7b4bd6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  position: absolute;
  right: 36rpx;
  top: 36rpx;
}

.main-image-wrap {
  margin-top: 32rpx;
  display: flex;
  justify-content: center;
}
.main-image {
  width: 100%;
  height: 700rpx;
  border-radius: 24rpx;
  background: #eee;
  object-fit: cover;
}

.arrow-btn {
  position: absolute;
  right: -60rpx;
  bottom: -40rpx;
  width: 200rpx;
  height: 200rpx;
  z-index: 3;
}
/* 已看完提示样式 */
.finished-text {
  font-size: 40rpx;
  color: #6c2ee8;
  margin-bottom: 32rpx;
  display: block;
}
.restart-btn {
  margin-top: 24rpx;
  background: linear-gradient(90deg, #caa7ff, #7b4bd6);
  color: #fff;
  border-radius: 16rpx;
  font-size: 32rpx;
  padding: 16rpx 48rpx;
  border: none;
}
.arrow-placeholder {
  position: absolute;
  right: -24rpx;
  bottom: -24rpx;
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #caa7ff, #7b4bd6);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  transform: rotate(20deg);
  box-shadow: 0 8rpx 24rpx rgba(140, 96, 199, 0.18);
  z-index: 3;
}

.bottom-bar {
  margin-top: 48rpx;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 24rpx;
}
.bottom-bar-row {
  display: flex;
  align-items: center;
  justify-content: center;
}
.grid-icon {
  font-size: 64rpx;
  color: #6c2ee8;
  margin-right: 18rpx;
}
.bottom-text {
  color: #6c2ee8;
  font-weight: 600;
  font-size: 32rpx;
}
.underline {
  width: 70vw;
  max-width: 600rpx;
  height: 8rpx;
  background: linear-gradient(
    90deg,
    rgba(108, 46, 232, 0.9),
    rgba(180, 150, 255, 0.6)
  );
  border-radius: 4rpx;
  margin-top: 12rpx;
}
</style>
