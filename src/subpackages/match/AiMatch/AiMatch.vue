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
            v-if="!bestProduct || !recommendationImage"
            class="upload-placeholder"
          >
            <view class="product-placeholder">点击“开始搭配”<br>查看推荐</view>
          </view>
          <image
            v-else
            :src="recommendationImage"
            class="uploaded-image"
            mode="aspectFit"
          />
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

      <!-- 新增：响应文本区域 -->
      <view
        v-if="recommendationText"
        class="response-text-area"
      >
        <towxml :nodes="$towxmlFun(recommendationText, 'markdown')" />
      </view>
    </view>

    <!-- 其他搭配选项 -->
    <view
      v-if="imagesOthers && imagesOthers.length"
      class="other-section"
    >
      <view class="other-title">其他搭配选项</view>
      <view class="other-card">
        <scroll-view
          scroll-x="true"
          class="other-scroll"
          show-scrollbar="false"
        >
          <view class="other-row">
            <view
              class="hthumb"
              v-for="(o, i) in imagesOthers"
              :key="o.product_id || i"
            >
              <image
                :src="o.image_gif || o.image_url"
                class="hthumb-image"
                mode="aspectFit"
              />
            </view>
          </view>
        </scroll-view>
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
      recommendationText: '', // 自然语言格式的推荐结果（显示在白色响应区域）
      recommendationReasoning: '', // 推荐理由（也会追加到响应区域）
      recommendationImage: '', // 由大模型返回的图片，优先用于右侧显示
      isProcessing: false,
      sessionId: ''
    };
  },
  computed: {
    // 仅保留有图片的其他推荐项
    imagesOthers() {
      const list = Array.isArray(this.otherRecommendations) ? this.otherRecommendations : [];
      return list.filter(o => o && (o.image_gif || o.image_url));
    }
  },
  onLoad(options) {
    // 保持页面进入时状态干净
    this.imageUrl = '';
    this.desc = '';
    this.showPreview = false;
    this.bestProduct = null;
    this.otherRecommendations = [];
    this.recommendationText = '';
    this.recommendationReasoning = '';
    this.recommendationImage = '';
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
      try {
        const res = await request({
          url: `${api.BASE_URL}/api/v1/sessions`,
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
          url: `${api.BASE_URL}/api/v1/chat`,
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

        // 合并大模型返回的文本和额外信息到响应文本区域
        let mainText = result.text || '';
        if (result.reasoning) {
          mainText = mainText ? mainText + '\n\n' + result.reasoning : result.reasoning;
        }

        // 追加最佳商品基本信息到文本区域（不在右侧显示）
        if (this.bestProduct) {
          const parts = [];
          if (this.bestProduct.product_name) parts.push(`商品：${this.bestProduct.product_name}`);
          if (this.bestProduct.price) parts.push(`价格：¥${this.bestProduct.price}`);
          if (this.bestProduct.brand) parts.push(`品牌：${this.bestProduct.brand}`);
          if (parts.length) mainText += (mainText ? '\n\n' : '') + parts.join(' | ');
        }

        // 列出其他推荐的简短摘要（最多三条）
        if (this.otherRecommendations && this.otherRecommendations.length) {
          const othersSummary = this.otherRecommendations.slice(0, 3).map((o, i) => {
            const name = o.product_name || `推荐${i + 2}`;
            const price = o.price ? ` ¥${o.price}` : '';
            return `${name}${price}`;
          }).join(' ; ');
          if (othersSummary) mainText += '\n\n其他推荐：' + othersSummary;
        }

        this.recommendationText = mainText;
        this.recommendationReasoning = result.reasoning || '';

        // 推荐图片优先使用 result.image / result.image_url，再降级到 bestProduct 的 image_gif/image_url
        this.recommendationImage = result.image || result.image_url || (this.bestProduct && (this.bestProduct.image_gif || this.bestProduct.image_url)) || '';

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
.product-box {
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
  text-align: center;
}
/* 右侧已与 upload-box 对齐展示，不再需要额外的 product-selected/product-info/product-image 布局 */
.product-details {
  flex: 1;
}
.product-name {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 5rpx;
}
.product-price {
  font-size: 24rpx;
  color: #e74c3c;
  margin-bottom: 5rpx;
}
.product-brand {
  font-size: 24rpx;
  color: #666;
}
.recommendation-reasoning {
  font-size: 26rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 10rpx;
}
.recommendation-text {
  font-size: 24rpx;
  color: #555;
  line-height: 1.4;
  margin-top: 10rpx;
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

/* 新增：响应文本区域 */
.response-text-area {
  background: #fff;
  border-radius: 12rpx;
  padding: 18rpx;
  margin-top: 20rpx;
  font-size: 26rpx;
  color: #333;
  line-height: 1.4;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  min-height: 100rpx; /* 最小高度 */
  max-height: none; /* 允许扩展 */
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
/* 横向滚动 */
.other-scroll {
  white-space: nowrap;
  width: 100%;
}
.other-row {
  display: inline-flex;
  flex-direction: row;
  align-items: stretch;
  gap: 16rpx;
}
.hthumb {
  width: 260rpx;
  height: 360rpx;
  background: #fff;
  border-radius: 12rpx;
  padding: 8rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}
.hthumb-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
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