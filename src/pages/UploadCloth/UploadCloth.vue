<template>
  <view class="two-dim-page">
    <!-- 主体内容 -->
    <view class="main-content">
      <view class="center-block">
        <!-- 横向排列：左侧icon，右侧按钮组 -->
        <view class="center-row">
          <image
            class="main-cloth-icon"
            src="/static/icon/补充icon0116-03.png"
            mode="widthFix"
          />
          <view class="btn-group">
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
          src="/static/icon/补充icon0116_画板 1.png"
          mode="widthFix"
        />
      </view>
    </view>

    <!-- 悬浮客服按钮 -->
    <!-- <customer-service /> -->
  </view>
</template>

<script>
import CustomerService from '@/components/CustomerService/CustomerService.vue'

export default {
  components: { CustomerService },
  name: 'UploadCloth',
  methods: {
    // 1. 新增：通用的登录检查和后续操作方法
    checkLoginAndProceed(action) {
      const token = uni.getStorageSync('token');
      if (!token) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        });
        // 延迟后跳转到登录页
        setTimeout(() => {
          uni.navigateTo({
            url: '/pages/LoginSelection/LoginSelection'
          });
        }, 1500);
        return;
      }
      // 如果已登录，则执行传入的回调函数
      action();
    },

    // 2. 修改：所有方法都先调用登录检查
    changeModel() {
      this.checkLoginAndProceed(() => {
        uni.navigateTo({
          url: '/pages/TwoDimDisplay/TwoDimDisplay'
        });
      });
    },
    
    selectFromResources() {
      this.checkLoginAndProceed(() => {
        uni.navigateTo({
          url: '/pages/ResourcesSelection/ResourcesSelection?type=top'
        });
      });
    },

    uploadFromAlbum() {
      this.checkLoginAndProceed(() => {
        uni.chooseImage({
          count: 1,
          sourceType: ['album'],
          success: (res) => {
            const tempFilePath = res.tempFilePaths[0];
            // 3. 修改：将图片路径传递到确认页面
            uni.navigateTo({
              url: `/pages/ConfirmCloth/ConfirmCloth?imageUrl=${encodeURIComponent(tempFilePath)}`
            });
          },
          fail: (err) => {
            console.log('取消选择或选择失败', err);
          }
        });
      });
    },

    uploadFromCamera() {
      this.checkLoginAndProceed(() => {
        uni.chooseImage({
          count: 1,
          sourceType: ['camera'],
          success: (res) => {
            const tempFilePath = res.tempFilePaths[0];
            // 3. 修改：将图片路径传递到确认页面
            uni.navigateTo({
              url: `/pages/ConfirmCloth/ConfirmCloth?imageUrl=${encodeURIComponent(tempFilePath)}`
            });
          },
          fail: (err) => {
            console.log('取消拍摄或拍摄失败', err);
          }
        });
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
.main-cloth-icon {
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