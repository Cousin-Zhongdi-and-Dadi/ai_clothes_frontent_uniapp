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
          @click="() => { /* 右侧显示最佳推荐占位，点击暂无行为 */ }"
        >
          <view
            v-if="!bestProduct"
            class="product-placeholder"
          >最佳推荐占位</view>
          <view
            v-else
            class="product-selected"
          >已生成推荐</view>
        </view>
      </view>

      <!-- 简短描述输入 -->
      <view class="desc-row">
        <textarea
          v-model="desc"
          class="desc-single"
          placeholder="请输入你的搭配需求（可包含预算、风格、场景等关键词）"
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
      desc: '',
      showDialog: false,
      showPreview: false, // 控制大图预览

      // 集成后的推荐数据
      bestProduct: null, // 最佳推荐（来自 /chat 的 recommendations[0]）
      otherRecommendations: [], // 其他推荐
      isProcessing: false,
      sessionId: ''
    };
  },
  onLoad(options) {
    // 保持页面进入时状态干净
    this.imageUrl = '';
    this.desc = '';
    this.showPreview = false;
    this.bestProduct = null;
    this.otherRecommendations = [];
  },
  onShow() {
    // 先解绑，防止重复绑定
    uni.$off && uni.$off('ai-match-image-selected');
    // 重新绑定（保留原有事件通道）
    uni.$on && uni.$on('ai-match-image-selected', (imgUrl) => {
      this.imageUrl = imgUrl;
    });

    // 关键：优先读取缓存
    const img = uni.getStorageSync('ai-match-image');
    if (img) {
      this.imageUrl = img;
      uni.removeStorageSync('ai-match-image');
    }

    // 读取已存在的会话ID（若有）
    const sid = uni.getStorageSync('ai_session_id');
    if (sid) this.sessionId = sid;
  },
  onHide() {
    uni.$off && uni.$off('ai-match-image-selected');
  },
  methods: {
    // 确保会话存在
    async ensureSession() {
      if (this.sessionId) return this.sessionId;
      try {
        const res = await request({
          url: `${api.TEST_URL}/api/v1/sessions`,
          method: 'POST',
          data: {}
        });
        if (res && res.session_id) {
          this.sessionId = res.session_id;
          uni.setStorageSync('ai_session_id', this.sessionId);
          return this.sessionId;
        }
      } catch (e) {
        // request 已有统一提示
      }
      throw new Error('会话创建失败');
    },
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

    // 点击“开始搭配”后：调用 AI 多智能体聊天接口，期望路由到 recommendation 智能体
    async onAiRecommend() {
      // 温和提示：图片需公网可达
      if (this.imageUrl && !/^https?:\/\//i.test(this.imageUrl)) {
        uni.showToast({ title: '提示：图片需公网可访问，已仅用文本请求', icon: 'none' });
      }

      uni.showLoading({ title: 'AI推荐中...' });
      this.isProcessing = true;
      try {
        // 确保会话
        await this.ensureSession();

        // 组装聊天请求体（意图为单品推荐）
        const payload = {
          session_id: this.sessionId,
          text: `单品推荐：${this.desc || '请根据我的需求给出单品推荐'}`,
          prompt: this.desc || '',
        };
        if (this.imageUrl && /^https?:\/\//i.test(this.imageUrl)) {
          payload.image = { image_url: this.imageUrl };
        }

        const chatData = await request({
          url: `${api.TEST_URL}/api/v1/chat`,
          method: 'POST',
          data: payload,
          header: { 'content-type': 'application/json' }
        });

        // chatData 直接为响应 data 字段
        if (!chatData) {
          uni.showToast({ title: '服务无响应数据', icon: 'none' });
          return;
        }

        // 需要更多信息
        if (chatData.needs_more_info) {
          const msg = chatData.message || '需要更多信息以完成推荐';
          uni.showToast({ title: msg, icon: 'none', duration: 3500 });
          return;
        }

        if (chatData.agent_type !== 'recommendation') {
          // 非预期类型，做温和提示
          if (chatData.agent_type === 'default' && chatData.result && chatData.result.answer) {
            uni.showToast({ title: '收到通用回答', icon: 'none' });
          } else if (chatData.agent_type === 'scoring') {
            uni.showToast({ title: '当前返回为试衣评分', icon: 'none' });
          } else {
            uni.showToast({ title: '返回类型与预期不符', icon: 'none' });
          }
          return;
        }

        const result = chatData.result || {};
        const recs = Array.isArray(result.recommendations) ? result.recommendations : [];
        if (!recs.length) {
          uni.showToast({ title: '未返回推荐结果', icon: 'none' });
          return;
        }

        // 设置最佳与其他
        this.bestProduct = recs[0] || null;
        this.otherRecommendations = recs.slice(1);

        uni.showToast({ title: '推荐完成', icon: 'success' });

        // 保留兼容：触发全局事件（如果其他页面监听）
        uni.$emit && uni.$emit('ai-match-result-ready', {
          best: this.bestProduct,
          others: this.otherRecommendations
        });
      } catch (e) {
        // request.js 里可能已统一提示，确保 loading 隐藏
        console.error('onAiRecommend error', e);
      } finally {
        uni.hideLoading();
        this.isProcessing = false;
      }
    },
    
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