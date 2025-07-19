<template>
  <view class="container">
    <!-- 图片容器 -->
    <view class="image-container">
      <image
        v-if="imageUrl"
        :src="imageUrl"
        mode="aspectFit"
        class="photo"
        @click="showPreview = true"
      />
      <view
        v-else
        class="photo placeholder"
      ></view>
    </view>

    <!-- 大图预览遮罩 -->
    <view
      v-if="showPreview"
      class="preview-mask"
      @click="showPreview = false"
    >
      <image
        :src="imageUrl"
        mode="widthFix"
        class="preview-img"
      />
    </view>

    <!-- 按钮区 -->
    <view class="button-group">
      <button
        class="retry-btn"
        @click="onRetry"
      >重新挑选</button>
      <button
        class="confirm-btn"
        @click="onConfirm"
      >下一步</button>
    </view>

  </view>
</template>

<script>
import CustomerService from '@/components/CustomerService/CustomerService.vue';
import apiConfig from '@/utils/api.js';
import request from '@/utils/request.js';

export default {
  components: { CustomerService },
  data() {
    return {
      imageUrl: '',      // 用于图片显示的临时路径
      tempFilePath: '',  // 存储原始的临时文件路径 (从上个页面传来)
      imageBase64: '',   // 用于上传的Base64数据
      // 注意：这里保留 compressedFilePath 是为了兼容 onConfirm 中的逻辑
      // 它现在和 tempFilePath 是同一个值
      compressedFilePath: '' 
    }
  },
  onLoad(options) {
    // 1. 直接接收并解码上个页面传来的图片路径
    if (options.tempFilePath) {
      const filePath = decodeURIComponent(options.tempFilePath);
      
      // 2. 将路径赋值给相关变量
      this.tempFilePath = filePath;
      this.compressedFilePath = filePath; // 图片已经是压缩过的
      
      // 3. 直接调用 displayImage 显示图片，不再进行二次压缩
      this.displayImage(filePath);
    }
  },
  methods: {
    // 显示图片
    displayImage(filePath) {
      this.imageUrl = filePath;
    },
    
    // 重新挑选，返回上一页
    onRetry() {
      uni.navigateBack();
    },
    
    // 确认上传
    async onConfirm() {
      const filePath = this.compressedFilePath || this.tempFilePath;
      if (!filePath) {
        uni.showToast({ title: '没有可上传的图片', icon: 'none' });
        return;
      }
      uni.showLoading({ title: '正在上传...', mask: true });
      uni.uploadFile({
        url: `${apiConfig.BASE_URL}/fitting_2d/submit_images`, // 新接口
        filePath: filePath,
        name: 'file', // 参数名必须为 file
        formData: {}, // 可加其它参数
        success: (res) => {
          uni.hideLoading();
          try {
            const result = JSON.parse(res.data);
            console.log('任务提交响应:', res);
            if (result.code === 200 && result.data) {
              uni.showToast({ title: '上传成功！', icon: 'success' });
              // 保存人物图片的存储链接
              uni.setStorageSync('personImageUrl', result.data);
              setTimeout(() => {
                uni.navigateTo({ url: `/pages/UploadWhole/UploadWhole?imgUrl=${encodeURIComponent(result.data)}` });
              }, 1500);
            } else {
              uni.showToast({ title: result.message || '上传失败', icon: 'none' });
            }
          } catch (e) {
            uni.showToast({ title: '服务器响应解析失败', icon: 'none' });
          }
        },
        fail: (err) => {
          uni.hideLoading();
          uni.showToast({ title: '上传失败，请重试', icon: 'none' });
          console.error('上传失败:', err);
        }
      });
    },
    
    // 将文件转换为Base64
    fileToBase64(filePath) {
      return new Promise((resolve, reject) => {
        uni.getFileSystemManager().readFile({
          filePath,
          encoding: 'base64',
          success: (res) => resolve(res.data),
          fail: (err) => reject(err)
        });
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
  padding-top: 40rpx;
}
.image-container {
  width: 440rpx;
  height: 560rpx;
  margin: 0 auto 60rpx auto;
  display: flex;
  align-items: center;
  justify-content: center;
}
.photo {
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
  background: #666;
}
.placeholder {
  display: flex;
}
.button-group {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.retry-btn {
  width: 400rpx;
  height: 64rpx;
  background: #d8d8d8;
  color: #fff;
  border-radius: 12rpx;
  font-size: 28rpx;
  margin-bottom: 32rpx;
  border: none;
}
.confirm-btn {
  width: 400rpx;
  height: 64rpx;
  background: #6c5ce7;
  color: #fff;
  border-radius: 12rpx;
  font-size: 28rpx;
  border: none;
}
.preview-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.preview-img {
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.18);
  background: #fff;
}
</style>