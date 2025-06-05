<template>
  <view class="reminder-container">
    <view class="reminder-text-holder">
      <slot>未知错误</slot>
    </view>
  </view>
</template>

<script>
export default {
    name: 'Reminder',
    props: {
        // 在此添加props
    },
    data() {
        return {
            // 在此添加data
        };
    },
    methods: {
        // 在此添加methods
    }
};
</script>

<style scoped>
.reminder-text-holder {
  background-color: #666;
  padding: 10rpx 20rpx;
  border-radius: 40rpx;
  text-align: center;
}

.reminder-text-holder ::v-deep {
  color: #fff;
  font-size: 30rpx;
}

.reminder-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* 背景灰度 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* 确保浮于其他内容之上 */
}
</style>