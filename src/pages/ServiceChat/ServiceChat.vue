<template>
  <view class="service-chat-page">
    <!-- 聊天内容区 -->
    <scroll-view
      class="chat-body"
      scroll-y
      :scroll-top="scrollTop"
      scroll-with-animation
    >
      <view
        v-for="(msg, idx) in messages"
        :key="idx"
        class="chat-row-wrapper"
      >
        <!-- 机器人消息 -->
        <view
          v-if="msg.type === 'robot'"
          class="chat-row"
        >
          <image
            class="robot-avatar"
            :src="robotAvatarSrc"
          />
          <view class="robot-msg">
            <!-- 修改：渲染markdown内容 -->
            <view class="robot-msg-title">
              <towxml :nodes="$towxmlFun(msg.content, 'markdown')" />
            </view>
            <!-- 推荐商品图片展示 -->
            <view
              v-if="msg.productImages && msg.productImages.length"
              class="robot-product-list"
            >
              <image
                v-for="item in msg.productImages"
                :key="item.productId"
                :src="item.imageUrl"
                class="robot-product-img"
                mode="aspectFill"
                @click="goToGoodsDetail(item.productId)"
              />
            </view>
          </view>
        </view>
        <!-- 用户消息 -->
        <view
          v-else-if="msg.type === 'user'"
          class="chat-row user"
        >
          <view class="user-msg-wrap">
            <view class="user-msg">{{ msg.content }}</view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 如果没有消息，则将输入框放置在页面中央 -->
    <view
      v-if="messages.length === 0"
      class="center-input-wrapper"
    >
      <view class="robot-intro">
        <image
          class="robot-avatar-intro"
          :src="robotAvatarSrc"
        />
        <text class="slogan">让每个时常成为你的T台</text>
        <text class="intro-desc">今天天气不错，你想怎样搭配穿搭？不如来让我帮帮你吧！</text>
      </view>
      <!-- 将输入和按钮放在同一行 -->
      <view class="center-input-row">
        <input
          class="chat-input center"
          placeholder="今天的穿搭推荐……"
          v-model="userInput"
          @confirm="sendMessage"
          :disabled="isSending"
        />
        <button
          class="send-btn center"
          @click="sendMessage"
          :disabled="isSending || !userInput"
        >发送</button>
      </view>
    </view>

    <!-- 有消息时置底输入栏 -->
    <view
      v-else
      class="chat-input-bar"
    >
      <input
        class="chat-input"
        placeholder="请输入内容"
        v-model="userInput"
        @confirm="sendMessage"
        :disabled="isSending"
      />
      <button
        class="send-btn"
        @click="sendMessage"
        :disabled="isSending || !userInput"
      >发送</button>
    </view>
  </view>
</template>

<script>
import request from '@/utils/request.js';
import apiConfig from '@/utils/api.js';

export default {
  name: 'ServiceChatPage',
  data() {
    return {
      messages: [],
      userInput: '',
      isSending: false,
      scrollTop: 0,
      robotAvatarSrc: '/static/icon/icon-04.png',
      userAvatarSrc: '',
      sessionId: null,
    };
  },
  created() {
    // 进入页面时清空消息记录
    uni.removeStorageSync('service-chat-messages');
    this.messages = [];
    this.createSession();
  },
  onUnload() {
    // 离开页面时清空消息记录
    uni.removeStorageSync('service-chat-messages');
    this.messages = [];
    this.endSession();
  },
  methods: {
    // 注意：已移除欢迎消息。首次打开且无消息时，输入框显示在页面中央；发送第一条消息后会恢复到底部。

    async createSession() {
      try {
        const sessionData = await request({
          url: `${apiConfig.TEST_URL}/api/v1/sessions`,
          method: 'POST',
          data: {}
        });
        // request.js 成功时返回 res.data，所以这里直接使用
        if (sessionData && sessionData.session_id) {
          this.sessionId = sessionData.session_id;
        }
      } catch (error) {
        console.error('Create session failed:', error);
      }
    },

    async endSession() {
      if (this.sessionId) {
        try {
          await request({
            url: `${apiConfig.TEST_URL}/api/v1/sessions/${this.sessionId}`,
            method: 'DELETE'
          });
        } catch (error) {
          console.error('End session failed:', error);
        }
      }
    },

    async sendMessage() {
      if (!this.userInput.trim() || this.isSending) return;

      const userMessageContent = this.userInput;
      this.isSending = true;

      this.messages.push({
        type: 'user',
        content: userMessageContent,
        time: new Date().toISOString(),
      });
      this.userInput = '';
      this.saveMessages();
      // 首次发送后需要让页面从“居中输入”切换到底部输入栏，稍作延迟以确保渲染
      this.$nextTick(() => {
        setTimeout(() => this.scrollToBottom(), 50);
      });

      try {
        const data = await request({
          url: `${apiConfig.TEST_URL}/api/v1/chat`,
          method: 'POST',
          data: {
            session_id: this.sessionId,
            text: userMessageContent
          },
          header: {
            'Content-Type': 'application/json'
          },
          // 大模型响应时间可能较长，显式设置 90s 超时
          timeout: 90000
        });

        // request.js 成功时返回 res.data，所以 data 就是后端返回的 data 对象
        const responseData = data;

        let robotMsg = {
          type: 'robot',
          content: '',
          productImages: [],
          buttons: [],
          tip: ''
        };

        if (responseData.needs_more_info) {
          robotMsg.content = responseData.message || '需要更多信息';
          robotMsg.buttons = responseData.missing_info ? responseData.missing_info.map(info => `提供${info}`) : [];
        } else {
          if (responseData.agent_type === 'scoring') {
            const result = responseData.result;
            robotMsg.content = `**总体评分：${result.overall_score}**\n\n${result.comments}\n\n**各维度评分：**\n${Object.entries(result.dimension_scores).map(([key, value]) => `- ${key}: ${value}`).join('\n')}\n\n**改进建议：**\n${result.suggestions.map(s => `- ${s}`).join('\n')}`;
          } else if (responseData.agent_type === 'recommendation') {
            const result = responseData.result || {};
            // 使用更新后的推荐结构：recommendations 中包含 product_id, product_name, description, image_gif, category_id, brand, price, scene, matching_reason
            const recs = Array.isArray(result.recommendations) ? result.recommendations : [];
            robotMsg.content = `${result.reasoning || ''}\n\n**推荐单品：**\n${recs.map(rec => {
              const name = rec.product_name || rec.product_id || '商品';
              const brand = rec.brand ? `品牌：${rec.brand}` : '';
              const price = (typeof rec.price !== 'undefined') ? `价格：¥${rec.price}` : '';
              const scene = rec.scene ? `风格：${rec.scene}` : '';
              const reason = rec.matching_reason ? `推荐理由：${rec.matching_reason}` : '';
              const desc = rec.description ? `${rec.description}` : '';
              return `- ${name} ${brand} ${price} ${scene}\n  ${desc}\n  ${reason}`.trim();
            }).join('\n\n')}`;

            // 将可用的图片加入 productImages，供模板展示并支持跳转
            robotMsg.productImages = recs.map(rec => ({
              productId: rec.product_id || rec.productId || '',
              imageUrl: rec.image_gif || rec.image || ''
            })).filter(i => i.imageUrl);
          } else if (responseData.agent_type === 'default') {
            robotMsg.content = (responseData.result && responseData.result.answer) ? responseData.result.answer : (responseData.result || responseData.message || '');
          } else {
            robotMsg.content = '未知响应类型';
          }
        }

        this.messages.push(robotMsg);
        this.saveMessages();
      } catch (error) {
        this.messages.push({
          type: 'robot',
          content: error.message || '抱歉，服务暂时遇到问题，请稍后再试。',
        });
        this.saveMessages();
        console.error("sendMessage failed:", error);
      } finally {
        this.isSending = false;
        this.scrollToBottom();
      }
    },

    scrollToBottom() {
      this.$nextTick(() => {
        this.scrollTop = this.messages.length * 200;
      });
    },

    saveMessages() {
      uni.setStorageSync('service-chat-messages', this.messages);
    },

    goToGoodsDetail(productId) {
      if (!productId) {
        uni.showToast({ title: '未提供商品ID，无法跳转', icon: 'none' });
        return;
      }
      uni.navigateTo({
        url: `/subpackages/shop/GoodsDetail/GoodsDetail?id=${encodeURIComponent(productId)}`
      });
    },

    // 新增：markdown转nodes方法
    renderMarkdown(md) {
      if (!md) return [];
      // 尝试使用 marked 转换为 html，如果未引入 marked，则直接返回原始字符串
      try {
        // marked 可能未全局引入
        const markedLib = (typeof marked !== 'undefined') ? (marked.default || marked) : null;
        if (markedLib && typeof markedLib.parse === 'function') {
          return markedLib.parse(md);
        }
      } catch (e) {
        // ignore
      }
      return md;
    }
  }
};
</script>

<style scoped>
.service-chat-page {
  background: #f7f7f7;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.chat-body {
  flex: 1;
  padding: 24rpx 0;
  overflow-y: auto;
  box-sizing: border-box;
  padding-bottom: 200rpx; /* 值略大于输入栏高度，适配安全区 */
}

/* 居中输入区域：当没有消息时显示 */
.center-input-wrapper {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
  padding: 0 24rpx;
  box-sizing: border-box;
}
.robot-intro {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 24rpx;
}
.robot-avatar-intro {
  width: 120rpx;
  height: 120rpx;
  background: #fff;
  object-fit: contain;
  padding: 8rpx;
  box-sizing: border-box;
}
.slogan {
  font-size: 32rpx;
  color: #666;
  text-align: center;
}
.intro-desc {
  font-size: 26rpx;
  color: #8a8f95;
  text-align: center;
  max-width: 80%;
  line-height: 36rpx;
}
.chat-input.center::placeholder {
  color: #9aa0a6;
}
.chat-input.center {
  width: 60%;
  height: 72rpx;
  background: #ffffff;
  padding: 0 28rpx;
}
/* 新增：居中输入行，使输入框和按钮水平排列 */
.center-input-row {
  width: 100%;
  display: flex;
  justify-content: center; /* 整个行居中 */
  align-items: center;
  gap: 16rpx;
}
.center-input-row .chat-input.center {
  flex: 1;
}
.center-input-row .send-btn.center {
  height: 72rpx;
  line-height: 72rpx;
  font-size: 28rpx;
  padding: 0 40rpx;
  border-radius: 36rpx;
}
.chat-row-wrapper {
  margin-bottom: 32rpx;
  padding: 0 24rpx;
}
.chat-row {
  display: flex;
  align-items: flex-start;
}
.robot-avatar,
.user-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  flex-shrink: 0;
}
.robot-avatar {
  margin-right: 16rpx;
  background: #fff;
  object-fit: contain;
  padding: 8rpx; /* 新增内边距，保证图片完整显示在圆形容器内 */
  box-sizing: border-box;
}
.user-avatar {
  margin-left: 16rpx;
}
.robot-msg {
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  max-width: 520rpx;
  font-size: 28rpx;
}
.robot-msg-title {
  margin-bottom: 18rpx;
}
.robot-btn-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}
.robot-btn {
  padding: 12rpx 24rpx;
  border-radius: 32rpx;
  background: #f0f0f0;
  color: #333;
  font-size: 26rpx;
  border: 1rpx solid #eee;
}
.robot-btn:active {
  background: #e0e0e0;
}
.robot-tip {
  margin-top: 16rpx;
  font-size: 24rpx;
  color: #999;
  background: #f9f9f9;
  border-radius: 12rpx;
  padding: 12rpx 16rpx;
}
.chat-row.user {
  justify-content: flex-end;
}
.user-msg-wrap {
  display: flex;
  justify-content: flex-end;
}
.user-msg {
  background: #6c5ce7;
  color: #fff;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  max-width: 520rpx;
  font-size: 28rpx;
}
.chat-input-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background: #fff;
  padding: 16rpx 24rpx;
  display: flex;
  align-items: center;
  border-top: 1rpx solid #eee;
  box-sizing: border-box;
  padding-bottom: calc(16rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
}
.chat-input {
  flex: 1;
  height: 72rpx;
  border: 1rpx solid rgba(0, 0, 0, 0.06);
  background: #ffffff; /* 更明显的底色 */
  border-radius: 36rpx;
  padding: 0 32rpx;
  font-size: 28rpx;
  box-shadow: 0 6rpx 18rpx rgba(0, 0, 0, 0.06);
}
.chat-input::placeholder {
  color: #9aa0a6;
}
.send-btn {
  margin-left: 16rpx;
  background: #6c5ce7;
  color: #fff;
  border-radius: 36rpx;
  height: 72rpx;
  line-height: 72rpx;
  font-size: 28rpx;
  padding: 0 40rpx;
}
.send-btn[disabled] {
  background-color: #ccc;
  color: #fff;
}
.robot-product-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin: 16rpx 0 0 0;
}
.robot-product-img {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
  background: #f5f5f5;
  object-fit: cover;
  border: 1rpx solid #eee;
}
</style>
