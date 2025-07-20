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
.form-container {
  width: 100%;
}

.form-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding-bottom: 10rpx;
}

.form-label {
  font-size: 32rpx;
  color: #333;
  width: 100rpx;
}

.form-input {
  flex: 1;
  margin-left: 20rpx;
  padding: 10rpx 0;
  border: none;
  border-bottom: 2rpx solid #666;
  font-size: 28rpx;
  outline: none;
  text-align: left;
  transition: border-color 0.3s;
}

.form-input:focus {
  border-bottom-color: #6753e7;
}

.submit-button {
  width: 80%;
  margin: 40rpx auto 0 auto;
  background-color: #6753e7;
  color: #fff;
  border: none;
  border-radius: 50rpx;
  font-size: 30rpx;
  text-align: center;
  cursor: pointer;
  padding: 18rpx 0;
}

.submit-button:hover {
  background-color: #5742c8;
}

.form-note {
  font-size: 24rpx;
  color: #6753e7;
  margin-left: 10rpx;
  width: 60rpx;
  text-align: right;
}
</style>