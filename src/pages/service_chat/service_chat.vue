<template>
  <view class="service-chat-page">
    <!-- 聊天内容区 -->
    <scroll-view
      class="chat-body"
      scroll-y
    >
      <view
        v-for="(msg, idx) in messages"
        :key="idx"
      >
        <!-- 机器人消息 -->
        <view
          v-if="msg.type === 'robot'"
          class="chat-row"
        >
          <image
            class="robot-avatar"
            :src="robotAvatarSrc"
            v-if="robotAvatarSrc"
          />
          <view
            class="avatar-fallback"
            v-else
          ></view>
          <view class="robot-msg">
            <view class="robot-msg-title">{{ msg.content }}</view>
            <view
              class="robot-btn-list"
              v-if="msg.buttons"
            >
              <view
                v-for="(btn, bidx) in msg.buttons"
                :key="bidx"
                class="robot-btn"
                :class="{ active: btn === msg.selectedButton }"
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
          <template v-if="userAvatarSrc">
            <image
              class="user-avatar"
              :src="userAvatarSrc"
            />
          </template>
          <template v-else>
            <view class="avatar-fallback"></view>
          </template>
          <view class="user-msg-wrap">
            <view class="user-msg">{{ msg.content }}</view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部输入栏 -->
    <view class="chat-input-bar">
      <input
        class="chat-input"
        placeholder="请输入内容"
      />
      <view class="chat-input-plus">＋</view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ServiceChatPage',
  data() {
    return {
      // 页面数据
      messages: [
        {
          type: 'robot',
          content: '请选择你需要咨询的内容',
          time: '2023-10-01 10:00',
          buttons: [
            '账号问题咨询',
            '小程序功能相关咨询',
            '购物/履约/订单类咨询',
            '3D建模需求咨询',
            '商务合作/入驻类咨询',
            '其他需求咨询'
          ],
          selectedButton: '商务合作/入驻类咨询',
          tip: '转人工客服\n人工客服在线时间：\n工作日 9:00-18:00\n非工作时间请留言，我们会尽快回复'
        },
        {
          type: 'user',
          content: '商务合作/入驻类咨询',
          time: '2023-10-01 10:01'
        },
        {
          type: 'robot',
          content: '请问您具体想咨询什么内容？',
          time: '2023-10-01 10:02',
          buttons: [
            '入驻流程咨询',
            '合作方式咨询',
            '其他商务合作相关咨询'
          ],
          selectedButton: '入驻流程咨询',
          tip: ''
        },
        {
          type: 'user',
          content: '入驻流程咨询',
          time: '2023-10-01 10:03'
        }
      ],
      robotAvatarSrc: '/static/icon/icon-04.png',
      userAvatarSrc: ''
    };
  },
  methods: {
  }
};
</script>

<style scoped>
.service-chat-page {
  background: #fafafa;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.chat-header {
  height: 90rpx;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
  border-bottom: 1rpx solid #eee;
}
.icon-back {
  font-size: 36rpx;
  color: #222;
}
.chat-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #222;
}
.chat-header-right {
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.icon-more,
.icon-setting {
  font-size: 28rpx;
  color: #888;
}
.chat-body {
  flex: 1;
  padding: 24rpx 0 24rpx 0;
  overflow-y: auto;
}
.chat-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 32rpx;
  padding-left: 24rpx;
}
.robot-avatar,
.user-avatar {
  width: 48rpx;
  height: 48rpx;
  border-radius: 12rpx;
  object-fit: cover;
  margin-right: 16rpx;
}
.chat-row.user .user-avatar {
  margin-left: 16rpx;
  margin-right: 0;
}
.robot-avatar[src=""],
.user-avatar[src=""] {
  background: #e0e0e0;
}
.robot-msg {
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  max-width: 480rpx;
}
.robot-msg-title {
  font-size: 26rpx;
  color: #222;
  margin-bottom: 18rpx;
  font-weight: bold;
}
.robot-btn-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 18rpx;
}
.robot-btn {
  padding: 10rpx 32rpx;
  border-radius: 32rpx;
  background: #f7f7f7;
  color: #6753e7;
  font-size: 24rpx;
  margin-bottom: 4rpx;
}
.robot-btn.active {
  background: #6753e7;
  color: #fff;
}
.robot-tip {
  margin-top: 10rpx;
  font-size: 22rpx;
  color: #888;
  background: #f7f7f7;
  border-radius: 12rpx;
  padding: 10rpx 16rpx;
}
.robot-tip-desc {
  display: block;
  font-size: 20rpx;
  color: #bbb;
  margin-top: 4rpx;
}
.chat-row.user {
  flex-direction: row-reverse;
  padding-right: 24rpx;
  padding-left: 0;
}
.user-msg-wrap {
  display: flex;
  align-items: center;
}
.user-msg {
  background: #fff;
  border-radius: 32rpx;
  padding: 10rpx 32rpx;
  font-size: 24rpx;
  color: #222;
  margin-right: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
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
}
.chat-input {
  flex: 1;
  height: 56rpx;
  border: none;
  background: #f7f7f7;
  border-radius: 32rpx;
  padding: 0 24rpx;
  font-size: 24rpx;
  outline: none;
}
.chat-input-plus {
  font-size: 36rpx;
  color: #6753e7;
  margin-left: 18rpx;
  font-weight: bold;
  margin-right: 40rpx;
}

.avatar-fallback {
  width: 48rpx;
  height: 48rpx;
  border-radius: 12rpx;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 16rpx;
}
</style>