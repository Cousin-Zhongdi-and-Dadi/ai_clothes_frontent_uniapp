<template>
  <view class="ai-match-page">
    <!-- 主内容卡片 -->
    <view class="card">
      <view class="upload-row">
        <!-- 左侧：上传虚线框 -->
        <view
          class="upload-box"
          @click="showUploadDialog"
        >
          <view
            v-if="!imageUrl"
            class="upload-placeholder"
          >
            <view class="plus">+</view>
          </view>
          <image
            v-else
            :src="imageUrl"
            class="uploaded-image"
            mode="aspectFit"
            @click.stop="showPreview = true"
          />
        </view>

        <!-- 右侧：商品占位/预览 -->
        <view
          class="product-box"
          @click="() => { /* 保留位：可触发选择商品 */ }"
        >
          <view
            v-if="!productId"
            class="product-placeholder"
          >商品占位</view>
          <view
            v-else
            class="product-selected"
          >已选择商品</view>
        </view>
      </view>

      <!-- 简短描述输入 -->
      <view class="desc-row">
        <textarea
          v-model="desc"
          class="desc-single"
          placeholder="请输入关于单品信息文字描述"
          maxlength="10000"
        ></textarea>
      </view>

      <!-- 开始搭配按钮 -->
      <button
        class="start-btn"
        @click="onAiRecommend"
      >开始搭配</button>
    </view>

    <!-- 其他搭配选项 -->
    <view class="other-section">
      <view class="other-title">其他搭配选项</view>
      <view class="other-card">
        <view class="thumbs">
          <view
            class="thumb"
            v-for="(img, idx) in ['/static/example_pictures/sample1.jpg','/static/example_pictures/sample2.jpg']"
            :key="idx"
          >
            <image
              :src="img"
              class="thumb-image"
              mode="aspectFit"
            />
          </view>
        </view>
      </view>
    </view>

    <!-- 大图预览遮罩 -->
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

    <!-- 上传来源弹窗（保留原逻辑） -->
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
import api from '@/utils/api.js';

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
      showPreview: false, // 控制大图预览

      // 集成后的推荐数据
      bestProduct: null, // 最佳推荐的商品详情对象
      otherRecommendations: [], // 次佳推荐数组（按优先级）
      isProcessing: false
    };
  },
  onLoad(options) {
    // 保持页面进入时状态干净
    this.imageUrl = '';
    this.selectedScene = '';
    this.desc = '';
    this.productId = null;
    this.showPreview = false;
    this.bestProduct = null;
    this.otherRecommendations = [];
  },
  onShow() {
    // 先解绑，防止重复绑定
    uni.$off && uni.$off('ai-match-image-selected');
    uni.$off && uni.$off('ai-match-product-selected');
    // 重新绑定（保留原有事件通道）
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

    // 点击“开始搭配”后：调用 AI 推荐服务，拿到推荐结果后在当前页处理并展示（将最佳设置到右侧，占位变为已选择；次佳写入 otherRecommendations）
    async onAiRecommend() {
      if (!this.productId) {
        uni.showToast({ title: '请先选择商品', icon: 'none' });
        return;
      }
      if (!this.selectedScene) {
        uni.showToast({ title: '请选择场景', icon: 'none' });
        return;
      }

      const requestBody = {
        product_id: this.productId,
        scene: this.selectedScene,
        desc: this.desc
      };

      uni.showLoading({ title: 'AI推荐中...' });
      this.isProcessing = true;
      try {
        const data = await request({
          url: 'https://remotely-one-javelin.ngrok-free.app/api/recommend_best_item',
          method: 'POST',
          data: requestBody,
          header: {
            'content-type': 'application/json'
          }
        });

        // 处理返回的数据：兼容几种常见结构
        // 优先解析为 { product_id, candidates: [...] }
        let candidateIds = [];
        if (data) {
          if (Array.isArray(data.candidates) && data.candidates.length) {
            candidateIds = data.candidates.slice();
          } else if (data.product_id) {
            candidateIds = [data.product_id];
            // 如果后端把更多候选放在 data.other 或 data.recommendations，也尝试取出
            if (Array.isArray(data.recommendations)) {
              candidateIds = candidateIds.concat(data.recommendations.filter(Boolean));
            }
          } else if (Array.isArray(data) && data.length) {
            // 有时后端直接返回 id 数组
            candidateIds = data.slice();
          }
        }

        if (!candidateIds.length) {
          uni.showToast({ title: '未返回推荐结果', icon: 'none' });
          uni.hideLoading();
          this.isProcessing = false;
          return;
        }

        // 最佳推荐为第一个 id
        const bestId = candidateIds[0];
        this.productId = bestId; // 切换右侧占位的显示状态（template 中会显示已选择）

        // 获取并保存最佳商品详情（用于后续可能的 UI 展示）
        const bestDetail = await this.fetchProductDetail(bestId);
        this.bestProduct = bestDetail || null;

        // 其余次佳推荐
        this.otherRecommendations = [];
        for (let i = 1; i < candidateIds.length; i++) {
          try {
            const d = await this.fetchProductDetail(candidateIds[i]);
            if (d) this.otherRecommendations.push(d);
          } catch (e) {
            // 单条错误不影响整体
            console.warn('fetchRecommendationDetail error', e);
          }
        }

        uni.hideLoading();
        uni.showToast({ title: '推荐完成', icon: 'success' });

        // 保留兼容：触发全局事件（如果其他页面监听）
        uni.$emit && uni.$emit('ai-match-result-ready', {
          best: this.bestProduct,
          others: this.otherRecommendations
        });
      } catch (e) {
        // request.js 里可能已统一提示，确保 loading 隐藏
        uni.hideLoading();
        console.error('onAiRecommend error', e);
      } finally {
        this.isProcessing = false;
      }
    },

    // 根据商品 id 拉取商品详情（复用 AiMatchResult 中的逻辑）
    async fetchProductDetail(productId) {
      if (!productId) return null;
      try {
        const res = await request({
          url: `${api.BASE_URL}/mall/getProductDetail/${productId}`,
          method: 'GET'
        });

        const detail = {
          id: productId,
          productName: res.productName || '',
          tags: res.scene || '',
          description: res.description || '',
          brand: res.brand || '',
          price: res.price ?? null,
          imageUrl: Array.isArray(res.imageUrl) ? (res.imageUrl[0] || '') : (res.imageUrl || '')
        };

        return detail;
      } catch (e) {
        console.warn('fetchProductDetail failed for', productId, e);
        return null;
      }
    },

    onSceneChange(e) {
      this.selectedScene = e.detail.value;
    }
  }
};
</script>

<style scoped>
/* 页面整体 */
.ai-match-page {
  padding: 32rpx;
  background: #fff;
}

/* 顶部 */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}
.back-btn {
  background: transparent;
  border: none;
  font-size: 36rpx;
  color: #333;
}
.title {
  font-size: 32rpx;
  color: #6753e7;
  font-weight: 600;
  text-align: center;
}
.header-space {
  width: 44rpx;
}

/* 主卡片 */
.card {
  background: #f8f6ff;
  border-radius: 20rpx;
  padding: 28rpx;
  box-shadow: 0 8rpx 24rpx rgba(103, 83, 231, 0.08);
  margin-bottom: 24rpx;
}
.upload-row {
  display: flex;
  gap: 24rpx;
  margin-bottom: 20rpx;
}
.upload-box,
.product-box {
  flex: 1;
  height: 360rpx;
  border-radius: 16rpx;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.upload-box {
  border: 2rpx dashed #dcd6f8;
}
.upload-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.plus {
  width: 200rpx;
  height: 200rpx;
  line-height: 120rpx;
  border-radius: 16rpx;
  border: 2rpx dashed #bfaef7;
  color: #6753e7;
  font-size: 100rpx;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.upload-text {
  color: #9a8fe6;
  font-size: 24rpx;
}
.uploaded-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.product-placeholder {
  color: #bbb;
  font-size: 26rpx;
}
.product-selected {
  color: #333;
  font-size: 26rpx;
}

/* 描述行 */
.desc-row {
  margin-bottom: 20rpx;
}
.desc-single {
  width: 100%;
  height: 200rpx; /* 固定高度，确保显示正常 */
  min-height: 200rpx;
  border-radius: 12rpx;
  padding: 18rpx; /* 顶部与左侧内边距，placeholder 顶对齐 */
  box-sizing: border-box;
  border: 1rpx solid #eee;
  background: #fff;
  font-size: 26rpx;
  color: #333;
  line-height: 30rpx; /* 文本行高 */
  text-align: left;
  resize: none;
  overflow-y: auto;
}

/* 开始搭配按钮 */
.start-btn {
  width: 100%;
  background: #6753e7;
  color: #fff;
  border-radius: 14rpx;
  font-size: 30rpx;
  padding: 22rpx 0;
  margin-top: 6rpx;
}

/* 其他搭配选项 */
.other-section {
  margin-top: 18rpx;
}
.other-title {
  font-size: 28rpx;
  color: #9b8fe6;
  text-align: center;
  margin-bottom: 12rpx;
}
.other-card {
  background: #f5f6fa;
  border-radius: 16rpx;
  padding: 20rpx;
}
.thumbs {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 4%;
}
.thumb {
  width: 48%;
  height: 200rpx;
  margin-bottom: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 12rpx;
  padding: 6rpx;
  box-sizing: border-box;
  height: 400rpx;
}
.thumb-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8rpx;
}

/* 大图预览样式（复用原样式） */
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
}

/* 上传弹窗（保留原样式） */
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
</style>