<template>
  <view class="ai-match-result-page">
    <!-- 顶部提示 -->
    <view class="tips">AI根据您的输入生成的搭配建议</view>

    <!-- 商品图片展示 -->
    <view
      v-if="imageUrl"
      class="goods-image-swiper"
    >
      <swiper
        indicator-dots
        autoplay
        circular
        class="swiper"
      >
        <swiper-item>
          <view class="image-wrapper">
            <image
              :src="imageUrl"
              class="main-image"
              mode="aspectFill"
              @error="onImageError"
              :style="{ opacity: imageLoadError ? 0 : 1 }"
            />
            <view
              v-if="imageLoadError"
              class="image-fallback"
            >
              <text class="image-fallback-text">图片加载失败</text>
            </view>
          </view>
        </swiper-item>
      </swiper>
    </view>
    <view
      v-else
      class="image-placeholder"
    >暂无图片</view>

    <!-- 商品信息区 -->
    <view
      v-if="title"
      class="goods-info"
    >
      <view class="goods-price-row">
        <text
          class="goods-price"
          v-if="price !== null"
        >￥{{ price }}</text>
      </view>
      <view class="goods-title">{{ title }}</view>
      <view
        class="goods-desc"
        v-if="description"
      >{{ description }}</view>
      <view
        class="goods-brand"
        v-if="brand"
      >品牌：{{ brand }}</view>
      <view
        class="goods-tags"
        v-if="tags"
      >标签：{{ tags }}</view>
    </view>
  </view>
</template>

<script>
import request from '@/utils/request.js';
import api from '@/utils/api.js';

export default {
  name: 'AiMatchResult',
  data() {
    return {
      imageUrl: '',
      title: '',
      tags: '',
      description: '',
      brand: '',
      price: null,
      imageLoadError: false
    };
  },
  onLoad(options) {
    const productId = options.productId;
    if (!productId) return;
    this.fetchProductDetail(productId);
  },
  methods: {
    async fetchProductDetail(productId) {
      try {
        const data = await request({
          url: `${api.BASE_URL}/mall/getProductDetail/${productId}`,
          method: 'GET'
        });
        this.title = data.productName || '';
        this.tags = data.scene || '';
        this.description = data.description || '';
        this.brand = data.brand || '';
        this.price = data.price ?? null;
        if (Array.isArray(data.imageUrl)) {
          this.imageUrl = data.imageUrl[0] || '';
        } else {
          this.imageUrl = data.imageUrl || '';
        }
        this.imageLoadError = false;
      } catch (e) {
        uni.showToast({ title: '获取商品信息失败', icon: 'none' });
      }
    },
    onImageError() {
      this.imageLoadError = true;
    }
  }
};
</script>

<style scoped>
.ai-match-result-page {
  background: #fafafa;
  min-height: 100vh;
  padding-bottom: 40rpx;
}
.tips {
  color: #6753e7;
  font-size: 28rpx;
  background: #f5f6fa;
  padding: 20rpx 0;
  text-align: center;
  border-radius: 12rpx;
  margin-bottom: 32rpx;
}
.goods-image-swiper {
  width: 100%;
  height: 800rpx;
  background: #fff;
}
.swiper {
  width: 100%;
  height: 100%;
}
.swiper-item {
  width: 100%;
  height: 100%;
}
.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.image-wrapper {
  position: relative;
  width: 100%;
  height: 800rpx;
  overflow: hidden;
}
.image-fallback {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}
.image-fallback-text {
  color: #bbb;
  font-size: 28rpx;
}
.image-placeholder {
  color: #bbb;
  font-size: 26rpx;
  text-align: center;
  margin: 40rpx 0;
}
.goods-info {
  background: #fff;
  padding: 32rpx 24rpx 16rpx 24rpx;
  border-radius: 0 0 24rpx 24rpx;
  margin-bottom: 20rpx;
}
.goods-price-row {
  display: flex;
  align-items: center;
}
.goods-price {
  color: #6753e7;
  font-size: 36rpx;
  font-weight: bold;
  margin-right: 16rpx;
}
.goods-title {
  font-size: 30rpx;
  color: #222;
  font-weight: 500;
  margin: 16rpx 0 8rpx 0;
}
.goods-desc {
  font-size: 24rpx;
  color: #888;
  margin-bottom: 12rpx;
}
.goods-brand {
  font-size: 24rpx;
  color: #888;
  margin-bottom: 8rpx;
}
.goods-tags {
  font-size: 24rpx;
  color: #888;
  margin-bottom: 8rpx;
}
</style>