<template>
  <view class="container">
    <view class="form-container">
      <view
        class="form-item"
        v-for="(item, index) in formFields"
        :key="index"
      >
        <text class="form-label">{{ item.label }}</text>
        <input
          class="form-input"
          type="text"
          v-model="item.value"
          :placeholder="'请输入' + item.label"
        />
        <text
          class="form-note"
          v-if="item.label === '身高' || item.label === '体重'"
        >必填</text>
      </view>
      <button
        class="submit-button"
        @click="handleSubmit"
      >确定</button>
      <view
        class="reminder"
        v-if=isReminderVisible
      >
        <view class="reminder-text-holder">
          <text class="reminder-text">请填写身高和体重</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'BodyDataEdit',
  data() {
    return {
      isBodyDataEditVisible: false, // 控制 BodyDataEdit 显示状态
      isReminderVisible: false, // 控制提醒信息的显示状态
      userName: '用户昵称',
      userHeight: 170,
      userWeight: 60,
      userWaist: 70,
      userHip: 90,
      userShoulder: 40,
      userArm: 30,
      userLeg: 80,
      userNeck: 35,
      selectionItems: [
        { icon: '/static/icon/微信图片_20250330204817.png', text: '我的订单' },
        { icon: '/static/icon/微信图片_20250330204803.png', text: '地址管理' },
        { icon: '/static/icon/微信图片_20250330204810.png', text: '浏览历史' },
        { icon: '/static/icon/微信图片_20250330204813.png', text: '收藏穿搭' }
      ],
      formFields: [
        { label: '身高', value: '' },
        { label: '体重', value: '' },
        { label: '胸围', value: '' },
        { label: '腰围', value: '' },
        { label: '臀围', value: '' },
        { label: '肩宽', value: '' },
        { label: '臂长', value: '' },
        { label: '腿长', value: '' },
        { label: '颈围', value: '' }
      ]
    };
  },
  methods: {
    handleSubmit() {
      console.log(this.formFields[0].value, this.formFields[1].value);
      if(!this.formFields[0].value || !this.formFields[1].value) {
        this.isReminderVisible = true; // 显示提醒信息
        setTimeout(() => {
          this.isReminderVisible = false; // 3秒后隐藏提醒信息
        }, 2000);
        return;
      }
      console.log('提交的数据:', this.formFields);
      this.$emit('signal'); // 使用 $emit 发送事件
    }
  }
};
</script>

<style scoped>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
}

.form-container {
  width: 100%;
  max-width: 400rpx;
  background-color: #fff;
  border-radius: 13.333rpx;
  padding: 13.333rpx;
}

.form-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.form-label {
  font-size: 30rpx;
  color: #333;
}

.form-input {
  flex: 1;
  margin-left: 6.667rpx;
  padding: 10rpx;
  border: none;
  border-bottom: 0.667rpx solid #ccc;
  font-size: 30rpx;
  outline: none;
}

.submit-button {
  width: 200rpx;
  background-color: #6753e7;
  color: #fff;
  border: none;
  border-radius: 50rpx;
  font-size: 30rpx;
  text-align: center;
  cursor: pointer;
}

.submit-button:hover {
  background-color: #5742c8;
}

.form-note {
  font-size: 25rpx;
  color: #5742c8;
  margin-left: 6.667rpx;
}

.reminder {
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

.reminder-text-holder {
  background-color: #666;
  padding: 10rpx 20rpx;
  border-radius: 40rpx;
  text-align: center;
}

.reminder-text {
  font-size: 30rpx;
  color: #fff;
}
</style>