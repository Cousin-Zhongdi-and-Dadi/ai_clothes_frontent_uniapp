<template>
  <view class="container">
    <!-- 1. 修改为图片显示区域 -->
    <view class="image-container">
      <image
        v-if="imageUrl"
        :src="imageUrl"
        class="preview-img"
        mode="aspectFit"
      />
      <!-- 如果没有图片URL，显示灰色占位符 -->
      <view
        v-else
        class="preview-img placeholder"
      ></view>
    </view>

    <!-- 2. 启用按钮并绑定点击事件 -->
    <button
      class="retry-btn"
      @click="onReselect"
    >重新挑选</button>
    <view class="complete-btn-wrapper">
      <button
        class="complete-btn"
        @click="onComplete"
      >选择完成</button>
    </view>

    <customer-service />
  </view>
</template>

<script>
// 3. 改为 Options API 并添加逻辑
import CustomerService from '@/components/CustomerService/CustomerService.vue';

export default {
  components: { CustomerService },
  data() {
    return {
      imageUrl: '' // 用于存储从上个页面传来的图片路径
    };
  },
  // 4. 在页面加载时，获取上个页面传递的图片URL
  onLoad(options) {
    if (options.imageUrl) {
      this.imageUrl = decodeURIComponent(options.imageUrl);
      // 4.1 将下装图片URL存入缓存
      uni.setStorageSync('bottomGarmentUrl', this.imageUrl);
      console.log('下装URL已存储:', this.imageUrl);
    } else {
      console.error('ConfirmTrousers.vue: 未接收到图片URL');
    }
  },
  methods: {
    // 5. “重新挑选”按钮的逻辑
    onReselect() {
      console.log('点击了重新挑选');
      // 流程: UploadTrousers -> ResourcesSelection -> ConfirmTrousers
      // 因此返回2级即可回到 UploadTrousers
      uni.navigateBack({
        delta: 2
      });
    },
    // 6. “选择完成”按钮的逻辑
    onComplete() {
      console.log('点击了选择完成（上装+下装）');
      const personImageUrl = uni.getStorageSync('personImageUrl');
      const topGarmentUrl = uni.getStorageSync('topGarmentUrl');
      const bottomGarmentUrl = uni.getStorageSync('bottomGarmentUrl');

      if (!personImageUrl || !topGarmentUrl || !bottomGarmentUrl) {
        uni.showToast({ title: '缺少必要的图片信息', icon: 'none' });
        return;
      }
      // 6.1 调用提交任务的通用方法
      this.submitTryOnTask();
    },
    // 7. 新增：提交试衣任务的通用方法 (与ConfirmCloth.vue中的方法一致)
    submitTryOnTask() {
      const token = uni.getStorageSync('token');
      if (!token) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        return;
      }

      uni.showLoading({ title: '正在提交任务...' });

      const personImageUrl = uni.getStorageSync('personImageUrl');
      const topGarmentUrl = uni.getStorageSync('topGarmentUrl');
      const bottomGarmentUrl = uni.getStorageSync('bottomGarmentUrl');

      let requestUrl = `${apiConfig.BASE_URL}/fitting_2d/submit_task?personImageUrl=${encodeURIComponent(personImageUrl)}&topGarmentUrl=${encodeURIComponent(topGarmentUrl)}`;
      if (bottomGarmentUrl) {
        requestUrl += `&bottomGarmentUrl=${encodeURIComponent(bottomGarmentUrl)}`;
      }

      console.log('提交试衣任务, URL:', requestUrl);

      uni.request({
        url: requestUrl,
        method: 'GET',
        header: {
          'Authorization': `Bearer ${token}`
        },
        success: (res) => {
          // 修改：检查返回的 data 是否为 taskId
          if (res.data && res.data.code === 0 && res.data.data) {
            const taskId = res.data.data; // 假设 data 是 taskId
            uni.showToast({ title: '任务提交成功！', icon: 'success' });
            // 修改：跳转到最终结果页，并携带 taskId
            setTimeout(() => {
              uni.navigateTo({
                url: `/pages/TwoDimComment/TwoDimComment?taskId=${taskId}`
              });
            }, 1500);
          } else {
            uni.showToast({ title: (res.data && res.data.message) || '任务提交失败', icon: 'none' });
          }
        },
        fail: (err) => {
          uni.showToast({ title: '网络请求失败', icon: 'none' });
          console.error('TryOn request failed:', err);
        },
        complete: () => {
          uni.hideLoading();
        }
      });
    }
  }
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 40rpx;
  box-sizing: border-box;
}
.image-container {
  width: 420rpx;
  height: 480rpx;
  background: #f0f0f0; /* 修改为占位符背景色 */
  border-radius: 12rpx;
  margin-bottom: 60rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}
.preview-img {
  width: 100%;
  height: 100%;
}
.placeholder {
  background-color: #e0e0e0;
}
.retry-btn {
  width: 400rpx;
  height: 60rpx;
  background: #e5e5e5; /* 修改为启用的灰色 */
  color: #333;
  border-radius: 12rpx;
  font-size: 28rpx;
  margin-bottom: 30rpx;
  border: none;
  line-height: 60rpx;
}
.retry-btn::after {
  border: none;
}
.complete-btn-wrapper {
  width: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}
.complete-btn {
  width: 400rpx;
  height: 60rpx;
  background: #6c5ce7;
  color: #fff;
  border-radius: 12rpx;
  font-size: 28rpx;
  border: none;
  line-height: 60rpx;
}
.complete-btn::after {
  border: none;
}
</style>