<template>
  <!-- 移除外层的 .container, 直接以表单作为根元素 -->
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
  </view>
</template>

<script>
export default {
  name: 'BodyDataEdit',
  props: {
    initialData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      formFields: [
        { key: 'height', label: '身高', value: '' },
        { key: 'weight', label: '体重', value: '' },
        { key: 'bust', label: '胸围', value: '' },
        { key: 'waist', label: '腰围', value: '' },
        { key: 'hip', label: '臀围', value: '' },
        { key: 'shoulder', label: '肩宽', value: '' },
        { key: 'arm', label: '臂长', value: '' },
        { key: 'leg', label: '腿长', value: '' },
        { key: 'neck', label: '颈围', value: '' }
      ]
    };
  },
  watch: {
    initialData: {
      handler(newData) {
        if (newData) {
          this.formFields.forEach(field => {
            if (newData[field.key] !== undefined) {
              field.value = newData[field.key];
            }
          });
        }
      },
      immediate: true, // 立即执行一次
      deep: true
    }
  },
  methods: {
    handleSubmit() {
      const heightField = this.formFields.find(f => f.key === 'height');
      const weightField = this.formFields.find(f => f.key === 'weight');

      if (!heightField.value || !weightField.value) {
        this.$emit('failed', '身高和体重为必填项');
        return;
      }

      // 将表单数据转换为父组件需要的格式
      const submittedData = this.formFields.reduce((acc, field) => {
        acc[field.key] = field.value;
        return acc;
      }, {});

      this.$emit('success', submittedData); // 使用 $emit 发送事件和数据
    }
  }
};
</script>

<style scoped>
/* 移除 .container 样式 */

.form-container {
  width: 100%;
  /* 从父组件继承背景色和padding, 这里无需设置 */
}

.form-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx; /* 增加间距 */
  padding-bottom: 10rpx; /* 在输入框下加一点空间 */
  /* border-bottom: 1rpx solid #eee; */ /* 移除这里的整行下划线 */
}

.form-label {
  font-size: 32rpx; /* 调整字体大小 */
  color: #333;
  width: 100rpx; /* 固定标签宽度，使其对齐 */
}

.form-input {
  flex: 1;
  margin-left: 20rpx; /* 增加左边距 */
  padding: 10rpx 0;
  border: none; /* 移除边框 */
  border-bottom: 2rpx solid #666; /* 新增：为输入框添加灰色下划线 */
  font-size: 28rpx;
  outline: none;
  text-align: left; /* 输入内容右对齐 */
  transition: border-color 0.3s; /* 新增：为边框颜色变化添加过渡效果 */
}

/* 新增：输入框获取焦点时的样式 */
.form-input:focus {
  border-bottom-color: #6753e7; /* 将下划线颜色变为主题色 */
}

.submit-button {
  width: 80%;
  margin: 40rpx auto 0 auto; /* 调整按钮边距 */
  background-color: #6753e7;
  color: #fff;
  border: none;
  border-radius: 50rpx;
  font-size: 30rpx;
  text-align: center;
  cursor: pointer;
  padding: 18rpx 0; /* 增加按钮高度 */
}

.submit-button:hover {
  background-color: #5742c8;
}

.form-note {
  font-size: 24rpx; /* 调整字体大小 */
  color: #6753e7;
  margin-left: 10rpx;
  width: 60rpx; /* 固定宽度 */
  text-align: right;
}
</style>