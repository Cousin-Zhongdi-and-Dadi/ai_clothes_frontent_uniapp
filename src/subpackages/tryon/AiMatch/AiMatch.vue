<template>
  <view class="ai-match-page">
    <!-- 上传图片区域（含提示/占位/图片） -->
    <view class="upload-section">
      <view class="preview-image-wrapper">
        <image
          v-if="imageUrl"
          :src="imageUrl"
          class="preview-image"
          mode="aspectFit"
          @click="showPreview = true"
        />
        <view
          v-else
          class="preview-placeholder"
        >
          <text class="tips">点击上传，仅支持单张图片（上装 | 下装）</text>
        </view>
      </view>
      <button
        class="upload-btn"
        @click="showUploadDialog"
      >上传图片</button>
    </view>

    <!-- 大图预览弹窗 -->
    <view
      v-if="showPreview"
      class="image-preview-mask"
      @click="showPreview = false"
    >
      <image
        :src="imageUrl"
        class="image-preview-big"
        mode="aspectFit"
      />
    </view>

    <!-- 场景选择 -->
    <view class="section-label">场景</view>
    <view class="scene-radio-group">
      <radio-group @change="onSceneChange">
        <label
          class="scene-radio"
          v-for="scene in scenes"
          :key="scene.value"
        >
          <radio
            :value="scene.value"
            :checked="selectedScene === scene.value"
          />
          <text>{{ scene.label }}</text>
        </label>
      </radio-group>
    </view>

    <!-- 产品特征描述 -->
    <view class="section-label">产品特征描述（可选）</view>
    <view class="desc-input-wrapper">
      <textarea
        v-model="desc"
        class="desc-input"
        placeholder="请输入您想要的单品特征"
        auto-height
      />
    </view>

    <!-- AI推荐按钮 -->
    <button
      class="ai-btn"
      @click="onAiRecommend"
    >AI推荐</button>

    <!-- 上传来源选择弹窗 -->
    <view
      v-if="showDialog"
      class="upload-dialog-mask"
    >
      <view class="upload-dialog">
        <view class="upload-dialog-title">请选择图片来源</view>
        <button
          class="upload-dialog-btn"
          @click="goCloset"
        >我的衣橱</button>
        <button
          class="upload-dialog-btn"
          @click="goResource"
        >总素材库</button>
        <button
          class="upload-dialog-cancel"
          @click="showDialog=false"
        >取消</button>
      </view>
    </view>
  </view>
</template>

<script>
import request from '@/utils/request.js';

export default {
  name: 'AiMatch',
  data() {
    return {
      imageUrl: '',
      scenes: [
        { label: '运动', value: 'sports' },
        { label: '日常', value: 'casual' }
      ],
      selectedScene: '',
      desc: '',
      showDialog: false,
      productId: null,
      showPreview: false // 控制大图预览
    };
  },
  onLoad(options) {
    // 清除AI推荐相关缓存，保证每次进入页面为干净状态
    this.imageUrl = '';
    this.selectedScene = '';
    this.desc = '';
    this.productId = null;
    this.showPreview = false;
  },
  onShow() {
    // 先解绑，防止重复绑定
    uni.$off && uni.$off('ai-match-image-selected');
    uni.$off && uni.$off('ai-match-product-selected');
    // 重新绑定
    uni.$on && uni.$on('ai-match-image-selected', (imgUrl) => {
      this.imageUrl = imgUrl;
    });
    uni.$on && uni.$on('ai-match-product-selected', (productId) => {
      this.productId = productId;
    });

    // 关键：优先读取缓存
    const img = uni.getStorageSync('ai-match-image');
    const pid = uni.getStorageSync('ai-match-product');
    if (img) {
      this.imageUrl = img;
      uni.removeStorageSync('ai-match-image');
    }
    if (pid) {
      this.productId = pid;
      uni.removeStorageSync('ai-match-product');
    }
  },
  onHide() {
    uni.$off && uni.$off('ai-match-image-selected');
    uni.$off && uni.$off('ai-match-product-selected');
  },
  methods: {
    showUploadDialog() {
      this.showDialog = true;
    },
    goCloset() {
      uni.showToast({
        title: '功能完善中……',
        icon: 'none'
      });
    },
    goResource() {
      this.showDialog = false;
      uni.navigateTo({
        url: '/subpackages/resources/ResourcesSelection/ResourcesSelection?source=AiMatch'
      });
    },
    async onAiRecommend() {
      if (!this.productId) {
        uni.showToast({ title: '请先选择商品', icon: 'none' });
        return;
      }
      if (!this.selectedScene) {
        uni.showToast({ title: '请选择场景', icon: 'none' });
        return;
      }
      uni.showLoading({ title: 'AI推荐中...' });
      const requestBody = {
        product_id: this.productId,
        scene: this.selectedScene
      };
      console.log('AI推荐请求体:', requestBody); // 打印请求体内容
      try {
        const data = await request({
          url: 'https://remotely-one-javelin.ngrok-free.app/api/recommend_best_item',
          method: 'POST',
          data: requestBody,
          header: {
            'content-type': 'application/json'
          }
        });
        uni.hideLoading();
        uni.showToast({ title: '推荐成功', icon: 'success' });
        uni.navigateTo({
          url: `/subpackages/tryon/AiMatchResult/AiMatchResult?productId=${data.product_id}`
        });
      } catch (e) {
        uni.hideLoading();
        // 错误提示已由 request.js 统一处理
      }
    },
    onSceneChange(e) {
      this.selectedScene = e.detail.value;
    }
  }
};
</script>

<style scoped>
.ai-match-page {
  padding: 40rpx 32rpx 32rpx 32rpx;
}
.preview-image-wrapper {
  width: 100%;
  height: 600rpx; /* 调高图片容器高度，原为400rpx */
  position: relative;
  margin-bottom: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.preview-image {
  width: 100%;
  height: 100%;
  border-radius: 16rpx;
  object-fit: contain;
  border: 1rpx solid #eee;
  background: #fff;
}
.preview-placeholder {
  width: 100%;
  height: 100%;
  background: #f5f6fa;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx solid #eee;
}
.tips {
  color: #6753e7;
  font-size: 28rpx;
  text-align: center;
}
.upload-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32rpx;
}
.upload-btn {
  background: #6753e7;
  color: #fff;
  border-radius: 8rpx;
  font-size: 28rpx;
  padding: 16rpx 48rpx;
  margin-bottom: 16rpx;
  width: 100%;
}
.section-label {
  font-size: 28rpx;
  color: #222;
  font-weight: 500;
  margin: 32rpx 0 16rpx 0;
}
.scene-radio-group {
  display: flex;
  flex-direction: row;
  gap: 40rpx;
  margin-bottom: 32rpx;
  align-items: center;
}
.scene-radio {
  display: flex;
  align-items: center;
  font-size: 26rpx;
  color: #333;
}
.desc-input-wrapper {
  margin-bottom: 32rpx;
}
.desc-input {
  width: 100%;
  min-height: 200rpx;
  font-size: 26rpx;
  border: 1rpx solid #eee;
  border-radius: 8rpx;
  padding: 16rpx;
  background: #fafafa;
  box-sizing: border-box;
}
.ai-btn {
  width: 100%;
  background: #6753e7;
  color: #fff;
  border-radius: 12rpx;
  font-size: 30rpx;
  padding: 24rpx 0;
  margin-top: 32rpx;
}
.upload-dialog-mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.upload-dialog {
  background: #fff;
  border-radius: 16rpx;
  padding: 48rpx 32rpx 32rpx 32rpx;
  width: 70vw;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.upload-dialog-title {
  font-size: 32rpx;
  color: #222;
  font-weight: 600;
  text-align: center;
  margin-bottom: 32rpx;
}
.upload-dialog-btn {
  background: #6753e7;
  color: #fff;
  border-radius: 8rpx;
  font-size: 28rpx;
  padding: 20rpx 0;
  margin-bottom: 24rpx;
  width: 100%;
}
.upload-dialog-cancel {
  background: #f5f6fa;
  color: #888;
  border-radius: 8rpx;
  font-size: 28rpx;
  padding: 20rpx 0;
  width: 100%;
}

/* 大图预览样式 */
.image-preview-mask {
  position: fixed;
  z-index: 2000;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
}
.image-preview-big {
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 16rpx;
  background: #fff;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.18);
}
</style>