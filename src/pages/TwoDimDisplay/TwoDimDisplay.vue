<template>
  <view class="container">
    <view class="center-block">
      <!-- 横向排列：左侧icon，右侧按钮组 -->
      <view class="center-row">
        <image
          class="main-man-icon"
          src="/static/icon/补充icon0116-02.png"
          mode="widthFix"
        />
        <view class="btn-group">
          <button
            class="btn btn-primary"
            @click="uploadFromAlbum"
          >
            <image
              class="btn-icon"
              src="/static/icon/补充icon0116-05.png"
              mode="widthFix"
            />
            相册上传
          </button>
          <button
            class="btn btn-primary"
            @click="uploadFromCamera"
          >
            <image
              class="btn-icon"
              src="/static/icon/补充icon0116-06.png"
              mode="widthFix"
            />
            拍照上传
          </button>
        </view>
      </view>
    </view>

    <!-- 提示信息 -->
    <text class="reminder-text">
      此照片将作为您的唯一体型基础仅能上传一次且不可更改,
      请确认是您本人后上传。
    </text>

    <!-- 提示图片 -->
    <view class="tips-img-section">
      <image
        src="/static/icon/补充icon0116-04.png"
        class="tips-img"
        mode="widthFix"
      />
    </view>

    <!-- <customer-service /> -->
    <canvas
      canvas-id="compressCanvas"
      style="width:1px;height:1px;position:absolute;left:-9999px;top:-9999px;"
    />
  </view>
</template>

<script>
import CustomerService from '@/components/CustomerService/CustomerService.vue';
import apiConfig from '@/utils/api.js';

export default {
  components: { CustomerService },
  name: 'TwoDimDisplay',
  methods: {
        uploadFromAlbum() {
      uni.chooseImage({
        count: 1,
        sourceType: ['album'],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          this.navigateToConfirm(tempFilePath);
        }
      });
    },
    uploadFromCamera() {
      uni.chooseImage({
        count: 1,
        sourceType: ['camera'],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          this.navigateToConfirm(tempFilePath);
        }
      });
    },
        navigateToConfirm(tempFilePath) {
      uni.navigateTo({
        url: `/pages/ConfirmModel/ConfirmModel?tempFilePath=${encodeURIComponent(tempFilePath)}`
      });
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 120rpx;
}
.header {
  width: 100%;
  height: 90rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
  background: #fff;
  box-sizing: border-box;
  position: relative;
  border-bottom: 1rpx solid #f0f0f0;
}
.back-icon {
  font-size: 40rpx;
  color: #333;
  position: absolute;
  left: 32rpx;
}
.title {
  font-size: 34rpx;
  font-weight: bold;
  flex: 1;
  text-align: center;
  color: #222;
}
.header-actions {
  display: flex;
  gap: 20rpx;
  position: absolute;
  right: 32rpx;
}
.icon-section {
  margin-top: 80rpx;
  margin-bottom: 50rpx;
}
.person-icon {
  width: 150rpx;
}
.center-block {
  margin-top: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.upload-btns {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
  align-items: center;
  margin-bottom: 50rpx;
}
.upload-btn {
  width: 300rpx;
  height: 80rpx;
  background: #6c5ce7;
  color: #fff;
  font-size: 30rpx;
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  border: none;
  padding: 0;
  margin: 0;
}
.upload-btn::after {
  border: none;
}

.reminder-text {
  margin-top: 40rpx;
  width: 90%;
  text-align: center;
  color: #6c5ce7;
  font-size: 26rpx;
  line-height: 1.5;
}

.tips-img-section {
  margin-top: 40rpx;
  width: 90vw;
  display: flex;
  justify-content: center;
}
.tips-img {
  width: 100%;
  max-width: 640rpx;
  border-radius: 16rpx;
}
.floating-btn {
  position: fixed;
  bottom: 150rpx;
  right: 40rpx;
  z-index: 10;
}
.help-btn {
  background: #fff;
  color: #6c5ce7;
  border-radius: 50rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  font-size: 26rpx;
  padding: 18rpx 36rpx;
  border: none;
}

.tabbar {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 100rpx;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  background: #fff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1rpx solid #eee;
  z-index: 99;
}
.btn-icon {
  width: 36rpx;
  height: 36rpx;
  margin-right: 16rpx;
}
.center-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}
.main-man-icon {
  width: 100rpx;
  margin-right: 40rpx;
}
.btn-group {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  width: 260rpx;
}
.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: bold;
  margin: 0;
  padding: 0;
  border: none;
}
.btn-icon {
  width: 36rpx;
  height: 36rpx;
  margin-right: 16rpx;
}
.btn-primary {
  background: #6c5ce7;
  color: #fff;
  margin-bottom: 0;
}
</style>