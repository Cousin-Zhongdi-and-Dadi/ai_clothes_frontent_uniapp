<template>
  <view class="tryon-container">
    <view class="tryon-btn-container">
      <view
        class="tryon-btn tryon-btn-3d"
        @click="goTo3D"
      >
        <text class="tryon-btn-text">3D试衣</text>
      </view>
      <view
        class="tryon-btn tryon-btn-2d"
        @click="goTo2D"
      >
        <text class="tryon-btn-text">2D试衣</text>
      </view>
    </view>
    <!-- <customer-service /> -->
  </view>
</template>

<script>
import CustomerService from '@/components/CustomerService/CustomerService.vue';

export default {
  components: { CustomerService },
  name: 'TryOnContainer',
  methods: {
    // 1. 新增：通用的登录检查和跳转方法
    checkLoginAndNavigate(url) {
      const token = uni.getStorageSync('token');
      if (!token) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        });
        // 延迟后跳转到登录页
        setTimeout(() => {
          uni.navigateTo({
            url: '/pages/LoginSelection/LoginSelection'
          });
        }, 1500);
        return;
      }
      // 如果已登录，则正常跳转
      uni.navigateTo({ url });
    },

    // 2. 修改：goTo3D 和 goTo2D 调用通用方法
    goTo3D() {
      // 假设3D试衣需要一个默认的模型ID，或者跳转到一个选择模型的页面
      // 这里我们直接跳转，具体的模型ID选择逻辑可以在目标页面处理
      this.checkLoginAndNavigate('/pages/ThreeDimDisplay/ThreeDimDisplay?styleId=1'); // 示例 styleId
    },
    goTo2D() {
      // 2D试衣通常是流程的第一步，让用户上传自己的照片
      this.checkLoginAndNavigate('/pages/TwoDimDisplay/TwoDimDisplay');
    }
  }
}
</script>

<style scoped>
.tryon-container {
  min-height: 100vh;
  background: #fafbfc;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  position: relative;
}
.tryon-btn-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0;
}
.tryon-btn {
  width: 95%;
  height: 200rpx;
  border-radius: 16rpx;
  margin-bottom: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 38rpx;
  font-weight: bold;
  box-sizing: border-box;
  transition: box-shadow 0.2s;
}
.tryon-btn-3d {
  background: #6c5ce7;
  color: #fff;
  box-shadow: 0 4rpx 16rpx rgba(108, 92, 231, 0.08);
}
.tryon-btn-2d {
  background: #fff;
  color: #6c5ce7;
  border: 4rpx solid #6c5ce7;
  box-shadow: 0 4rpx 16rpx rgba(108, 92, 231, 0.08);
}
.tryon-btn-text {
  font-size: 60rpx;
  font-weight: bold;
}
.fab-chat {
  position: fixed;
  right: 40rpx;
  bottom: 140rpx;
}
</style>