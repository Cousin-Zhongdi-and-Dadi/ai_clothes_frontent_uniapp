<template>
  <view class="welcome-page">
    <image
      class="bg-image"
      src="/static/icon/每日推荐/底图.png"
      mode="widthFix"
    />

    <view class="card-area">
      <image
        class="card-image"
        src="/static/icon/每日推荐/卡片.png"
        mode="widthFix"
      />
      <view class="card-text">
        <text class="title">精彩推荐</text>
        <text class="subtitle">开启个性化穿搭</text>
      </view>
    </view>

    <view class="footer">
      <view class="grid-icon">
        <view class="square"></view>
        <view class="square"></view>
        <view class="square"></view>
        <view class="square"></view>
      </view>
      <view class="label">Daily Recommendations</view>
    </view>

    <!-- 右下角箭头按钮 -->
    <button
      class="arrow-btn"
      @click="goToRecommendation"
    >
      <image
        src="/static/icon/每日推荐/按钮.png"
        mode="widthFix"
        class="arrow-img"
      />
    </button>
  </view>
</template>

<script>
export default {
  methods: {
    goToRecommendation() {
      // 使用 subpackage 路径的完整页面路径
      uni.navigateTo({ url: '/subpackages/recommendation/Recommendation/Recommendation' });
    }
  }
};
</script>

<style scoped>
.welcome-page {
  position: relative;
  min-height: 100vh;
  background: #faf7ff;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.bg-image {
  width: 100%;
  height: 380rpx;
  object-fit: cover;
}
.card-area {
  width: 86%;
  max-width: 720rpx;
  margin-top: -90rpx; /* 把卡片往上拉覆盖背景 */
  position: relative;
}
.card-image {
  width: 100%;
  border-radius: 18rpx;
  box-shadow: 0 12rpx 32rpx rgba(103, 83, 231, 0.12);
}
.card-text {
  position: absolute;
  left: 28rpx;
  top: 28rpx;
}
.title {
  font-size: 42rpx;
  font-weight: 700;
  color: #1a0f2c;
}
.subtitle {
  font-size: 28rpx;
  color: #6b6b8a;
  margin-top: 8rpx;
}
.footer {
  margin-top: 28rpx;
  width: 86%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.grid-icon {
  display: flex;
  gap: 6rpx;
}
.grid-icon .square {
  width: 28rpx;
  height: 28rpx;
  background: #6c3ef0;
  border-radius: 4rpx;
}
.label {
  color: #6c3ef0;
  font-weight: 600;
  border-bottom: 4rpx solid #d9cfff;
  padding-bottom: 8rpx;
}
.arrow-btn {
  position: fixed;
  right: 28rpx;
  bottom: 28rpx;
  width: 88rpx;
  height: 88rpx;
  padding: 0;
  border: none;
  background: transparent;
}
.arrow-img {
  width: 100%;
  height: 100%;
}
</style>
