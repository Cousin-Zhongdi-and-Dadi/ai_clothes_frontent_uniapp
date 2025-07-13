<template>
  <view class="upload-whole-page">
    <!-- 上装选择区 -->
    <view class="section-block">
      <image
        class="section-icon"
        src="/static/icon/补充icon0116-03.png"
        mode="widthFix"
      />
      <view class="btn-group">
        <button
          class="btn btn-primary"
          @click="selectFromResources('top')"
        >
          <image
            class="btn-icon"
            src="/static/icon/icon-01.png"
            mode="widthFix"
          />
          素材库选择
        </button>
        <!-- <button
          class="btn btn-primary"
          @click="uploadFromAlbum('top')"
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
          @click="uploadFromCamera('top')"
        >
          <image
            class="btn-icon"
            src="/static/icon/补充icon0116-06.png"
            mode="widthFix"
          />
          拍照上传
        </button> -->
      </view>
    </view>
    <view class="tips-block">
      <image
        class="tips-pic"
        src="/static/icon/补充icon0116_画板 1.png"
        mode="widthFix"
      />
    </view>

    <!-- 分割线 -->
    <view class="divider"></view>

    <!-- 下装选择区 -->
    <view class="section-block">
      <image
        class="section-icon"
        src="/static/icon/补充icon0116-09.png"
        mode="widthFix"
      />
      <view class="btn-group">
        <button
          class="btn btn-primary"
          @click="selectFromResources('bottom')"
        >
          <image
            class="btn-icon"
            src="/static/icon/icon-01.png"
            mode="widthFix"
          />
          素材库选择
        </button>
        <!-- <button
          class="btn btn-primary"
          @click="uploadFromAlbum('bottom')"
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
          @click="uploadFromCamera('bottom')"
        >
          <image
            class="btn-icon"
            src="/static/icon/补充icon0116-06.png"
            mode="widthFix"
          />
          拍照上传
        </button> -->
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
</template>

<script>
export default {
  name: 'UploadWhole',
  methods: {
    // 直接进入流程，无论是否登录
    selectFromResources(type) {
      uni.navigateTo({
        url: `/pages/ResourcesSelection/ResourcesSelection?type=${type}`
      });
    },
    uploadFrom(sourceType, type) {
      uni.chooseImage({
        count: 1,
        sourceType: [sourceType],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          uni.navigateTo({
            url: `/pages/ConfirmCloth/ConfirmCloth?imageUrl=${encodeURIComponent(tempFilePath)}&type=${type}`
          });
        },
        fail: (err) => {
          if (err.errMsg !== 'chooseImage:fail cancel') {
            console.error('选择图片失败:', err);
          }
        }
      });
    },
    uploadFromAlbum(type) {
      this.uploadFrom('album', type);
    },
    uploadFromCamera(type) {
      this.uploadFrom('camera', type);
    }
  }
}
</script>

<style scoped>
.upload-whole-page {
  min-height: 100vh;
  background: #fafbfc;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 0;
}
.section-block {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
}
.section-icon {
  width: 180rpx;
  margin-right: 40rpx;
}
.btn-group {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  width: 300rpx;
}
.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 500;
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
}
.tips-block {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 20rpx;
}
.tips-pic {
  width: 520rpx;
}
.divider {
  width: 90%;
  height: 1rpx;
  background-color: #e0e0e0;
  margin: 40rpx 0;
}
</style>