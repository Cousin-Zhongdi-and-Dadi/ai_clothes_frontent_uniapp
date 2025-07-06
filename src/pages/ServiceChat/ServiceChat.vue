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
// 3. 导入依赖
import request from '../../utils/request.js';
import apiConfig from '../../utils/api.js';

export default {
  name: 'ServiceChatPage',
  data() {
    return {
      messages: [], // 消息列表从空数组开始
      userInput: '',  // 用户输入
      isSending: false, // 是否正在发送消息
      scrollTop: 0,   // 滚动条位置
      robotAvatarSrc: '/static/icon/icon-04.png',
      userAvatarSrc: '', // 假设从用户信息中获取
    };
  },
  // 4. 页面加载时，获取欢迎语
  created() {
    this.getWelcomeMessage();
  },
  methods: {
    // 5. 新增：获取欢迎语或初始化对话
    async getWelcomeMessage() {
      this.isSending = true;
      try {
        // 假设有一个获取欢迎消息的API
        const welcomeMsg = await request({
          url: `${apiConfig.BASE_URL}/chat/welcome`,
          method: 'GET',
        });
        this.messages.push({ type: 'robot', ...welcomeMsg });
      } catch (error) {
        // 如果获取欢迎语失败，显示一个默认消息
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

    // 6. 新增：发送消息的核心方法
    async sendMessage() {
      if (!this.userInput.trim() || this.isSending) return;

      const userMessageContent = this.userInput;
      this.isSending = true;

      // a. 将用户消息立即显示在界面上
      this.messages.push({
        type: 'user',
        content: userMessageContent,
        time: new Date().toISOString(),
      });
      this.userInput = ''; // 清空输入框
      this.scrollToBottom();

      try {
        // b. 调用后端API发送消息
        const replyMsg = await request({
          url: `${apiConfig.BASE_URL}/chat/send`,
          method: 'POST',
          data: { message: userMessageContent },
        });
        
        // c. 将机器人回复显示在界面上
        this.messages.push({ type: 'robot', ...replyMsg });
      } catch (error) {
        // d. 如果API失败，也显示一条错误提示消息
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

    // 7. 新增：处理快捷回复按钮点击
    handleQuickReply(text) {
      this.userInput = text;
      this.sendMessage();
    },

    // 8. 新增：滚动到底部的方法
    scrollToBottom() {
      this.$nextTick(() => {
        // 通过设置一个很大的值来确保滚动到底部
        this.scrollTop = this.messages.length * 200; // 估算值
      });
    }
  }
};
</script>

<style scoped>
/* 样式微调 */
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