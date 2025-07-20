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
            <view class="robot-msg-title">{{ msg.content }}</view>
            <view
              class="robot-btn-list"
              v-if="msg.buttons && msg.buttons.length > 0"
            >
              <!-- 1. 绑定点击事件 -->
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
          <image
            class="user-avatar"
            :src="userAvatarSrc"
          />
        </view>
      </view>
    </scroll-view>

    <!-- 底部输入栏 -->
    <view class="chat-input-bar">
      <!-- 2. 绑定 v-model 和事件 -->
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
import request from '../../utils/request.js';
import apiConfig from '../../utils/api.js';

export default {
  name: 'ServiceChatPage',
  data() {
    return {
      messages: [],       userInput: '',        isSending: false,       scrollTop: 0,         robotAvatarSrc: '/static/icon/icon-04.png',
      userAvatarSrc: '',     };
  },
    created() {
    this.getWelcomeMessage();
  },
  methods: {
        async getWelcomeMessage() {
      this.isSending = true;
      try {
                const welcomeMsg = await request({
          url: `${apiConfig.BASE_URL}/chat/welcome`,
          method: 'GET',
        });
        this.messages.push({ type: 'robot', ...welcomeMsg });
      } catch (error) {
                this.messages.push({
          type: 'robot',
          content: '您好，有什么可以帮助您？',
          buttons: ['功能咨询', '订单问题', '商务合作'],
        });
        console.error("getWelcomeMessage failed:", error);
      } finally {
        this.isSending = false;
        this.scrollToBottom();
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
      this.userInput = '';       this.scrollToBottom();

      try {
                const replyMsg = await request({
          url: `${apiConfig.BASE_URL}/chat/send`,
          method: 'POST',
          data: { message: userMessageContent },
        });
        
                this.messages.push({ type: 'robot', ...replyMsg });
      } catch (error) {
                this.messages.push({
          type: 'robot',
          content: '抱歉，服务暂时遇到问题，请稍后再试。',
        });
        console.error("sendMessage failed:", error);
      } finally {
        this.isSending = false;
        this.scrollToBottom();
      }
    },

        handleQuickReply(text) {
      this.userInput = text;
      this.sendMessage();
    },

        scrollToBottom() {
      this.$nextTick(() => {
                this.scrollTop = this.messages.length * 200;       });
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
  border: 1px solid #eee;
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
  border: none;
  background: #f7f7f7;
  border-radius: 36rpx;
  padding: 0 32rpx;
  font-size: 28rpx;
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
</style>