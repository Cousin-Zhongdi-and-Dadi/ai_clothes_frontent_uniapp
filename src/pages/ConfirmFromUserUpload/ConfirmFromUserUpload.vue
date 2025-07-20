<template>
  <view class="confirm-page">
    <!-- 1. 图片预览区 -->
    <view class="image-preview-container">
      <image
        :src="imagePath"
        class="preview-image"
        mode="aspectFit"
        @click="previewImage"
      />
    </view>

    <!-- 2. 表单输入区 -->
    <view class="form-container">
      <!-- 类别输入 -->
      <view class="form-item">
        <text class="form-label">类别</text>
        <picker
          mode="selector"
          :range="categories"
          range-key="name"
          @change="handleCategoryChange"
        >
          <view class="picker-display">
            {{ selectedCategoryName || '请选择类别' }}
            <uni-icons
              type="right"
              size="14"
              color="#999"
            ></uni-icons>
          </view>
        </picker>
      </view>

      <!-- 品牌输入 -->
      <view class="form-item">
        <text class="form-label">品牌</text>
        <input
          v-model="formData.brand"
          class="form-input"
          placeholder="请输入品牌(选填)"
        />
      </view>

      <!-- 尺码输入 -->
      <view class="form-item">
        <text class="form-label">尺码</text>
        <input
          v-model="formData.size"
          class="form-input"
          placeholder="请输入尺码(选填)"
        />
      </view>

      <!-- 颜色输入 -->
      <view class="form-item">
        <text class="form-label">颜色</text>
        <input
          v-model="formData.color"
          class="form-input"
          placeholder="请输入颜色(选填)"
        />
      </view>

      <!-- 价格输入 -->
      <view class="form-item">
        <text class="form-label">价格</text>
        <input
          v-model="formData.price"
          type="digit"
          class="form-input"
          placeholder="请输入价格(选填)"
        />
      </view>

      <!-- 其他输入 -->
      <view class="form-item textarea-item">
        <text class="form-label">其他</text>
        <textarea
          v-model="formData.notes"
          class="form-textarea"
          placeholder="请输入其他备注信息(选填)"
        />
      </view>
    </view>

    <!-- 3. 操作按钮区 -->
    <view class="button-group">
      <button
        class="btn cancel-btn"
        @click="handleCancel"
      >取消选择</button>
      <button
        class="btn confirm-btn"
        @click="handleSubmit"
      >确认选择</button>
    </view>
  </view>
</template>

<script>
// --- 开始修改：导入封装的 uploadFile 函数 ---
import request, { uploadFile } from '@/utils/request.js';
import apiConfig from '@/utils/api.js';
// --- 结束修改 ---

export default {
  data() {
    return {
      imagePath: '', // 从上一页接收的图片临时路径
      categories: [], // 从API获取的分类列表
      categoryIndex: -1, // 当前选中的分类索引
      formData: {
        categoryId: null,
        brand: '',
        size: '',
        color: '',
        price: '',
        notes: ''
      }
    };
  },
  computed: {
    // 计算属性，用于显示当前选中的分类名称
    selectedCategoryName() {
      if (this.categoryIndex > -1 && this.categories[this.categoryIndex]) {
        return this.categories[this.categoryIndex].name;
      }
      return '';
    }
  },
  onLoad(options) {
    // 页面加载时，获取从上个页面传来的图片路径
    if (options.tempFilePath) {
      this.imagePath = options.tempFilePath;
    } else {
      uni.showToast({ title: '图片路径丢失', icon: 'none' });
      uni.navigateBack();
    }
    // 同时获取分类列表
    this.fetchCategories();
  },
  methods: {
    // 获取分类列表
    async fetchCategories() {
      try {
        const data = await request({
          url: `${apiConfig.BASE_URL}/address/getCategory`,
          method: 'GET',
        });
        this.categories = data
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(item => ({
            id: item.id,
            name: item.categoryName
          }));
      } catch (error) {
        console.error("fetchCategories failed:", error);
      }
    },
    // 处理分类选择器的变化
    handleCategoryChange(e) {
      this.categoryIndex = e.detail.value;
      this.formData.categoryId = this.categories[this.categoryIndex].id;
    },
    // 新增：点击图片预览
    previewImage() {
      if (!this.imagePath) return;
      uni.previewImage({
        urls: [this.imagePath],
        current: this.imagePath
      });
    },
    // 处理取消操作
    handleCancel() {
      uni.navigateBack();
    },
    // 处理提交操作
    async handleSubmit() {
      // 验证必填项
      if (!this.formData.categoryId) {
        uni.showToast({ title: '请选择类别', icon: 'none' });
        return;
      }

      uni.showLoading({ title: '正在上传...' });

      try {
        // --- 开始修改：使用封装的 uploadFile 函数 ---
        await uploadFile({
          url: `${apiConfig.BASE_URL}/closet/add`,
          filePath: this.imagePath,
          name: 'file',
          formData: {
            categoryId: this.formData.categoryId,
            brand: this.formData.brand,
            size: this.formData.size,
            color: this.formData.color,
            price: this.formData.price,
            notes: this.formData.notes,
          },
        });

        uni.showToast({ title: '上传成功！', icon: 'success' });
        // 通知衣橱页面刷新
        uni.$emit('closet-refresh');
        // 延时后返回，确保Toast能被看到
        setTimeout(() => {
          uni.navigateBack();
        }, 1500);
        // --- 结束修改 ---
      } catch (error) {
        // 错误提示已由 uploadFile 函数统一处理
        console.error("Upload failed in handleSubmit:", error);
      } finally {
        uni.hideLoading();
      }
    },
  }
};
</script>

<style scoped>
.confirm-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8f8f8;
}
.image-preview-container {
  width: 100%;
  height: 600rpx;
  background-color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.preview-image {
  max-width: 100%;
  max-height: 100%;
}
.form-container {
  flex: 1;
  overflow-y: auto;
  padding: 20rpx 30rpx;
  background-color: #fff;
}
.form-item {
  display: flex;
  align-items: center;
  padding: 25rpx 0;
  border-bottom: 1rpx solid #eee;
  font-size: 30rpx;
}
.textarea-item {
  align-items: flex-start;
}
.form-label {
  width: 120rpx;
  color: #333;
  flex-shrink: 0;
}
.form-input,
.picker-display {
  flex: 1;
  color: #333;
}
.picker-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.form-textarea {
  flex: 1;
  height: 150rpx;
  padding-top: 5rpx;
}
.button-group {
  display: flex;
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-top: 1rpx solid #eee;
}
.btn {
  flex: 1;
  margin: 0 10rpx;
  border-radius: 40rpx;
  font-size: 30rpx;
  height: 80rpx;
  line-height: 80rpx;
}
.confirm-btn {
  background-color: #6c5ce7;
  color: #fff;
}
.cancel-btn {
  background-color: #f0f0f0;
  color: #666;
}
</style>