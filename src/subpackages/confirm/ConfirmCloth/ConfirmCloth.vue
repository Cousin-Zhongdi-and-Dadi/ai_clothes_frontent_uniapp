<template>
  <view class="page">
    <!-- 中间卡片：紫色边框、图片、右上圆形重选、开始搭配按钮 -->
    <view class="confirm-card">
      <view class="card-inner">
        <view class="image-wrap">
          <image
            v-if="imageUrl"
            :src="imageUrl"
            mode="aspectFit"
            class="card-image"
          />
          <button
            class="reselect-btn"
            @click="onReselect"
          >重选</button>
        </view>

        <button
          class="start-btn"
          @click="startFitting"
        >开始搭配</button>
      </view>
    </view>

    <!-- 底部卡片：其他搭配选项 -->
    <view class="other-card">
      <view class="other-title">其他搭配选项</view>
      <view class="thumb-row">
        <view
          class="thumb"
          v-for="n in 2"
          :key="n"
        >
          <image
            :src="imageUrl || '/static/example_pictures/sample1.jpg'"
            mode="aspectFit"
          />
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      imageUrl: '',
      type: 'top'
    };
  },
  onLoad(options) {
    if (options.imageUrl && options.type) {
      this.imageUrl = decodeURIComponent(options.imageUrl);
      this.type = options.type;
      const key = this.type === 'top' ? 'topGarmentUrl' : 'bottomGarmentUrl';
      // 保存到本地供 TryOnContainer 使用
      uni.setStorageSync(key, this.imageUrl);
    } else {
      console.error('未接收到图片URL或类型');
      uni.showToast({ title: '页面参数错误', icon: 'none' });
    }
  },
  methods: {
    onReselect() {
      uni.navigateBack();
    },
    // 这里不再提交试衣任务，仅保存并返回，实际提交在 TryOnContainer 的“一键试穿”中完成
    startFitting() {
      const key = this.type === 'top' ? 'topGarmentUrl' : 'bottomGarmentUrl';
      uni.setStorageSync(key, this.imageUrl);
      uni.showToast({ title: '已保存', icon: 'success' });
      setTimeout(() => {
        uni.switchTab({ url: '/pages/TryOnContainer/TryOnContainer' });
      }, 600);
    }
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #faf9ff;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.nav {
  width: 100%;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding-top: 20rpx;
  box-sizing: border-box;
}
.nav-back {
  position: absolute;
  left: 18rpx;
  top: 26rpx;
  width: 56rpx;
  height: 56rpx;
  border-radius: 28rpx;
  background: transparent;
  border: none;
  font-size: 36rpx;
  color: #6c5ce7;
}
.nav-title {
  font-size: 32rpx;
  color: #6c5ce7;
  font-weight: 700;
}

.confirm-card {
  width: 75%;
  max-width: 760rpx;
  margin-top: 12rpx;
  background: transparent;
}
.card-inner {
  background: #fff;
  border-radius: 20rpx;
  padding: 28rpx 24rpx 20rpx 24rpx;
  box-sizing: border-box;
  border: 4rpx solid #6c5ce7;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 800rpx;
}
.image-wrap {
  width: 100%;
  /* 加大高度以支持纵向展示 */
  height: 640rpx;
  border-radius: 12rpx;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.card-image {
  /* 优先填满高度以显示纵向比例的衣物 */
  max-height: 96%;
  max-width: 92%;
  object-fit: contain;
}
.reselect-btn {
  position: absolute;
  right: 18rpx;
  top: 18rpx;
  width: 72rpx;
  height: 72rpx;
  border-radius: 36rpx;
  background: rgba(108, 92, 231, 0.08);
  color: #6c5ce7;
  border: none;
  font-size: 28rpx;
}
.start-btn {
  width: 80%;
  height: 80rpx;
  margin-top: 22rpx;
  border-radius: 44rpx;
  background: #6c5ce7;
  color: #fff;
  border: none;
  font-size: 30rpx;
  font-weight: 600;
}

.other-card {
  width: 92%;
  margin-top: 36rpx;
  background: #f6f3ff;
  border-radius: 22rpx;
  padding: 20rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.other-title {
  color: #b9aef9;
  font-size: 26rpx;
  margin-bottom: 16rpx;
}
.thumb-row {
  width: 100%;
  display: flex;
  gap: 18rpx;
  justify-content: space-between;
}
.thumb {
  flex: 1;
  height: 320rpx;
  background: #fff;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.thumb image {
  width: 86%;
  height: 86%;
  object-fit: contain;
}
</style>