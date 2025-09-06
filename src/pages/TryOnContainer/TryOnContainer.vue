<template>
  <view class="page">
    <view class="card-wrap">
      <view class="left-cards">
        <view class="small-card">
          <image
            class="thumb"
            src="/static/example_pictures/sample1.jpg"
            mode="aspectFill"
          ></image>
          <button
            class="small-btn"
            @click.stop.prevent="chooseUpper"
          >重选</button>
        </view>
        <view class="small-card">
          <image
            class="thumb"
            src="/static/example_pictures/sample2.jpg"
            mode="aspectFill"
          ></image>
          <button
            class="small-btn"
            @click.stop.prevent="chooseLower"
          >重选</button>
        </view>
      </view>

      <view class="right-card">
        <image
          class="model"
          src="/static/example_pictures/sample2.jpg"
          mode="aspectFit"
        ></image>
        <view class="model-tools">
          <!-- 预留 3D/空间 文本及 icon 位置 -->
          <image
            class="icon-3d"
            :src="'/static/icon/试衣搭配/Group_31.png'"
            mode="widthFix"
          />
        </view>
        <button
          class="small-btn"
          @click.stop.prevent="uploadModel"
        >重选</button>
      </view>
    </view>

    <button
      class="primary-btn"
      @click="onTryOn"
    >
      <text>一键试穿</text>
    </button>

    <view class="ai-row">
      <view
        class="ai-card"
        @click="goToAiMatch"
      >
        <image
          class="ai-full"
          src="/static/icon/试衣搭配/ai单品推荐.png"
          mode="aspectFill"
        />
      </view>

      <view
        class="ai-card"
        @click="goToChat"
      >
        <image
          class="ai-full"
          src="/static/icon/试衣搭配/ai评分建议.png"
          mode="aspectFill"
        />
      </view>
    </view>

    <view class="product-list">
      <view
        class="product"
        v-for="(p, idx) in products"
        :key="idx"
      >
        <image
          class="product-img"
          :src="p.img"
          mode="aspectFill"
        ></image>
        <text class="product-title">{{ p.title }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'TryOnContainer',
  data() {
    return {
      products: [
        { img: '/static/example_pictures/sample1.jpg', title: '罗宾汉 ROBINHOOD 美式' },
        { img: '/static/example_pictures/sample2.jpg', title: 'PAUI COSTELLOE 罗·科' }
      ]
    }
  },
  methods: {
    /***** 原有导航方法 *****/
    goToAiMatch() {
      uni.navigateTo({ url: '/subpackages/match/AiMatch/AiMatch' });
    },
    goTo2D() {
      uni.navigateTo({ url: '/subpackages/twodim/TwoDimDisplay/TwoDimDisplay' });
    },
    goToChat() {
      uni.navigateTo({ url: '/subpackages/chat/ServiceChat/ServiceChat' });
    },

    /***** 一键试穿占位 *****/
    onTryOn() {
      console.log('一键试穿 被点击')
      uni.showToast({ title: '正在尝试...', icon: 'none' })
    },

    /***** 上/下装 & 模特 选择/上传 流程（从 UploadWhole / TwoDimDisplay 合并） *****/
    // 供选择素材库使用（会导航到 ResourcesSelection）
    selectFromResources(type) {
      const key = type === 'top' ? 'topGarmentUrl' : 'bottomGarmentUrl';
      const garmentUrl = uni.getStorageSync(key);
      if (garmentUrl) {
        uni.showModal({
          title: '提示',
          content: type === 'top' ? '已选择过上装，是否覆盖？' : '已选择过下装，是否覆盖？',
          confirmText: '覆盖',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({ url: `/subpackages/resources/ResourcesSelection/ResourcesSelection?type=${type}&source=TryOnContainer` });
            }
          }
        });
      } else {
        uni.navigateTo({ url: `/subpackages/resources/ResourcesSelection/ResourcesSelection?type=${type}&source=TryOnContainer` });
      }
    },

    // 通用上传方法：相册/相机 -> 跳转到 ConfirmCloth 并带上 type (top/bottom)
    uploadFrom(sourceType, type) {
      const source = sourceType === 'album' ? ['album'] : ['camera'];
      uni.chooseImage({
        count: 1,
        sourceType: source,
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          uni.navigateTo({ url: `/subpackages/confirm/ConfirmCloth/ConfirmCloth?imageUrl=${encodeURIComponent(tempFilePath)}&type=${type}` });
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
    },

    // TwoDimDisplay 的逻辑：选择人物图片后跳转到 ConfirmModel
    navigateToConfirmModel(tempFilePath) {
      uni.navigateTo({ url: `/subpackages/confirm/ConfirmModel/ConfirmModel?tempFilePath=${encodeURIComponent(tempFilePath)}` });
    },

    /***** 按钮触发流程：为页面上的 three 重选按钮提供具体实现 *****/
    // 上装：提供素材库选择或上传（相册/拍照）
    chooseUpper() {
      // 仅从素材库选择上装
      this.selectFromResources('top');
    },

    // 下装：同上，但 type 为 bottom
    chooseLower() {
      // 仅从素材库选择下装
      this.selectFromResources('bottom');
    },

    // 模特上传：使用相册或相机并跳转到 ConfirmModel
    uploadModel() {
      uni.showActionSheet({
        itemList: ['相册上传', '拍照上传'],
        success: (res) => {
          const idx = res.tapIndex;
          if (idx === 0) {
            uni.chooseImage({ count: 1, sourceType: ['album'], success: (r) => this.navigateToConfirmModel(r.tempFilePaths[0]) });
          } else if (idx === 1) {
            uni.chooseImage({ count: 1, sourceType: ['camera'], success: (r) => this.navigateToConfirmModel(r.tempFilePaths[0]) });
          }
        }
      });
    }
  }
}
</script>

<style scoped>
.page {
  padding: 36rpx;
  background: #f7f7fb;
  min-height: 100vh;
}
.title {
  color: #9b7ef6;
  font-size: 36rpx;
  margin-bottom: 24rpx;
}
.title .dot {
  color: #c2b3f9;
  margin-left: 8rpx;
}
.card-wrap {
  display: flex;
  gap: 24rpx;
  margin-bottom: 28rpx;
}
.left-cards {
  width: 38%;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}
.small-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  position: relative;
  height: 240rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.thumb {
  /* fill small card area; mode="aspectFill" ensures cropping while preserving aspect */
  width: 100%;
  height: 100%;
  border-radius: 16rpx;
  display: block;
}
.small-btn {
  position: absolute;
  right: 20rpx;
  bottom: 20rpx;
  background: #f3f3ff;
  border-radius: 28rpx;
  padding: 0 20rpx; /* horizontal padding only; height controls vertical size */
  color: #6b6b8a;
  border: none;
  z-index: 10;
  height: 56rpx;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.right-card {
  flex: 1;
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.model {
  /* fill model area; mode controls scaling */
  width: 100%;
  height: 400rpx;
  display: block;
}
.model-tools {
  position: absolute;
  left: 24rpx;
  bottom: 24rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.right-card .small-btn {
  /* ensure the button sits above model image in right-card */
  right: 24rpx;
  bottom: 24rpx;
}
.model-icon {
  width: 48rpx;
  height: 48rpx;
}
.model-text {
  color: #6b6b8a;
  font-size: 24rpx;
}
.primary-btn {
  width: 100%;
  background: #6a2bdc;
  color: #fff;
  padding: 14rpx 0;
  border-radius: 20rpx;
  margin: 16rpx 0;
  text-align: center;
  font-size: 32rpx;
  border: none;
}
.ai-row {
  display: flex;
  gap: 24rpx;
  margin: 24rpx 0;
}
.ai-card {
  flex: 1;
  /* remove background so image shows without底色 */
  background: transparent;
  border-radius: 24rpx;
  padding: 0;
  height: 156rpx;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ai-full {
  width: 100%;
  height: 100%;
  display: block;
  border-radius: 24rpx;
}
.ai-title {
  font-weight: 700;
  color: #3b2b6c;
}
.ai-desc {
  font-size: 24rpx;
  color: #7a6f9a;
  margin-top: 12rpx;
}
.product-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-top: 24rpx;
}
.product {
  width: 48%;
  background: #fff;
  border-radius: 16rpx;
  padding: 16rpx;
  box-sizing: border-box;
}
.product-img {
  width: 100%;
  height: 240rpx;
  border-radius: 12rpx;
}
.product-title {
  display: block;
  margin-top: 16rpx;
  font-size: 24rpx;
  color: #333;
}
.icon-3d {
  width: 100rpx;
}
</style>
