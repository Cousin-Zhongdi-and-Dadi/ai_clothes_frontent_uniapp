<template>
  <view class="two-dim-page">
    <!-- 主体内容 -->
    <view class="main-content">
      <view class="center-block">
        <!-- 横向排列：左侧icon，右侧按钮组 -->
        <view class="center-row">
          <image
            class="main-trousers-icon"
            src="/static/icon/补充icon0116-09.png"
            mode="widthFix"
          />
          <view class="btn-group">
            <!-- 1. 绑定 changeModel 事件 -->
            <button
              class="btn btn-disabled"
              @click="changeModel"
            >
              <image
                class="btn-icon"
                src="/static/icon/补充icon0116-08.png"
                mode="widthFix"
              />
              更换模特
            </button>
            <!-- 2. 绑定 selectFromResources 事件 -->
            <button
              class="btn btn-primary"
              @click="selectFromResources"
            >
              <image
                class="btn-icon"
                src="/static/icon/icon-01.png"
                mode="widthFix"
              />
              衣物选择
            </button>
            <!-- 3. 绑定 uploadFromAlbum 事件 -->
            <button
              class="btn btn-primary"
              @click="uploadFromAlbum"
            >
              <image
                class="btn-icon"
                src="/static/icon/补充icon0116-05.png"
                mode="widthFix"
              />
              相册上传
            </button>
            <!-- 4. 绑定 uploadFromCamera 事件 -->
            <button
              class="btn btn-primary"
              @click="uploadFromCamera"
            >
              <image
                class="btn-icon"
                src="/static/icon/补充icon0116-06.png"
                mode="widthFix"
              />
              拍照上传
            </button>
          </view>
        </view>
      </view>

      <view class="tips-block">
        <image
          class="tips-pic"
          src="/static/icon/补充icon0116-10.png"
          mode="widthFix"
        />
      </view>
    </view>

    <!-- 悬浮客服按钮 -->
    <customer-service />
  </view>
</template>

<script>
import CustomerService from '@/components/CustomerService/CustomerService.vue'
export default {
  components: { CustomerService },
  name: 'UploadTrousers',
  methods: {
    // 5. 新增：更换模特的方法
    changeModel() {
      // 虽然按钮是禁用样式，但仍为其添加跳转逻辑
      uni.navigateTo({
        url: '/pages/TwoDimDisplay/TwoDimDisplay'
      });
    },
    // 6. “衣物选择”的方法
    selectFromResources() {
      console.log('触发“衣物选择”');
      // 跳转到素材库，并传递 type=bottom 参数
      uni.navigateTo({
        url: '/pages/ResourcesSelection/ResourcesSelection?type=bottom'
      });
    },
    // 7. 新增：“相册上传”的方法
    uploadFromAlbum() {
      console.log('触发“相册上传”');
      uni.chooseImage({
        count: 1,
        sourceType: ['album'],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          // 选择成功后，跳转到确认页面
          uni.navigateTo({
            url: `/pages/ConfirmTrousers/ConfirmTrousers?imageUrl=${encodeURIComponent(tempFilePath)}`
          });
        }
      });
    },
    // 8. 新增：“拍照上传”的方法
    uploadFromCamera() {
      console.log('触发“拍照上传”');
      uni.chooseImage({
        count: 1,
        sourceType: ['camera'],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          // 拍摄成功后，跳转到确认页面
          uni.navigateTo({
            url: `/pages/ConfirmTrousers/ConfirmTrousers?imageUrl=${encodeURIComponent(tempFilePath)}`
          });
        }
      });
    }
  }
}
</script>

<style scoped>
.two-dim-page {
  min-height: 100vh;
  background: #fafbfc;
  display: flex;
  flex-direction: column;
}
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30rpx 0 0 0;
}
.center-block {
  display: flex;
  flex-direction: column;
  align-items: center;
}
/* 新增横向排列样式 */
.center-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}
.main-trousers-icon {
  width: 180rpx;
  margin-right: 40rpx;
}
.btn-group {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  width: 260rpx;
}
.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: bold;
  margin: 0;
  padding: 0;
  border: none;
}
.btn-icon {
  width: 36rpx;
  height: 36rpx;
  margin-right: 16rpx;
}
.btn-primary {
  background: #6c5ce7;
  color: #fff;
  margin-bottom: 0;
}
.btn-disabled {
  background: #999;
  color: #fff;
}
.tips-block {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 30rpx;
  margin-top: 40rpx;
}
.fab-chat {
  position: fixed;
  right: 40rpx;
  bottom: 140rpx;
}
</style>