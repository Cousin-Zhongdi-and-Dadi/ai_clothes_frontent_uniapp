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
            <view
              class="robot-btn-list"
              v-if="msg.buttons && msg.buttons.length > 0"
            >
              <view
                v-for="(btn, bidx) in msg.buttons"
                :key="bidx"
                class="robot-btn"
                @click="handleQuickReply(btn)"
              >{{ btn }}</view>
            </view>
            <view
              class="robot-tip"
              v-if="msg.tip"
            >
              <text
                v-for="(line, lidx) in msg.tip.split('\n')"
                :key="lidx"
              >
                {{ line }}<br v-if="lidx !== msg.tip.split('\n').length - 1" />
              </text>
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
      <input
        class="chat-input center"
        placeholder="请输入内容"
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
    };
  },
  created() {
    // 进入页面时清空消息记录
    uni.removeStorageSync('service-chat-messages');
    this.messages = [];
  },
  onUnload() {
    // 离开页面时清空消息记录
    uni.removeStorageSync('service-chat-messages');
    this.messages = [];
  },
  methods: {
    // 注意：已移除欢迎消息。首次打开且无消息时，输入框显示在页面中央；发送第一条消息后会恢复到底部。

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
          url: 'https://bee-touched-mink.ngrok-free.app/recommend',
          method: 'POST',
          data: { question: userMessageContent },
          header: {
            'Content-Type': 'application/json'
          }
        });

        let productImages = [];
        if (Array.isArray(data.indexes) && data.indexes.length > 0) {
          const api = require('@/utils/api.js').default;
          const detailPromises = data.indexes.map(productId =>
            request({
              url: `${api.BASE_URL}/mall/getProductDetail/${productId}`,
              method: 'GET'
            }).then(res => {
              let img = '';
              if (res && res.imageUrl) {
                img = Array.isArray(res.imageUrl) ? res.imageUrl[0] : res.imageUrl;
              }
              return {
                productId,
                imageUrl: img
              };
            }).catch(() => ({
              productId,
              imageUrl: ''
            }))
          );
          productImages = await Promise.all(detailPromises);
        }

        this.messages.push({
          type: 'robot',
          content: data.answer || '暂无回复',
          indexes: data.indexes || [],
          productImages
        });
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
      uni.navigateTo({
        url: `/subpackages/shop/GoodsDetail/GoodsDetail?id=${productId}`
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
  justify-content: center;
  align-items: center;
  gap: 24rpx;
  padding: 0 24rpx;
  box-sizing: border-box;
}
.chat-input.center {
  width: 60%;
  height: 72rpx;
}
.chat-input.center::placeholder {
  color: #9aa0a6;
}
.chat-input.center {
  background: #ffffff;
  border: 1rpx solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 6rpx 18rpx rgba(0, 0, 0, 0.06);
  padding: 0 28rpx;
}
.send-btn.center {
  height: 72rpx;
  line-height: 72rpx;
  padding: 0 32rpx;
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
