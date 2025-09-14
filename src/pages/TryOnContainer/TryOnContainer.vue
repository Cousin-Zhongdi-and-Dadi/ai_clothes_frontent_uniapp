<template>
  <view class="page">
    <view class="card-wrap">
      <view class="left-cards">
        <!-- 上装预览 -->
        <view
          class="small-card"
          @click.stop="onTopCardClick"
        >
          <image
            v-if="topThumb"
            class="thumb"
            :src="topThumb"
            mode="aspectFill"
          ></image>
          <view
            v-else
            class="thumb placeholder"
            @click.stop="onTopCardClick"
          >
            <text class="placeholder-text">点击上传上装</text>
          </view>
          <button
            v-if="topThumb"
            class="small-btn"
            @click.stop.prevent="chooseUpper"
          >重选</button>
        </view>
        <!-- 下装预览 -->
        <view
          class="small-card"
          @click.stop="onBottomCardClick"
        >
          <image
            v-if="bottomThumb"
            class="thumb"
            :src="bottomThumb"
            mode="aspectFill"
          ></image>
          <view
            v-else
            class="thumb placeholder"
            @click.stop="onBottomCardClick"
          >
            <text class="placeholder-text">点击上传下装</text>
          </view>
          <button
            v-if="bottomThumb"
            class="small-btn"
            @click.stop.prevent="chooseLower"
          >重选</button>
        </view>
      </view>

      <view
        class="right-card"
        @click.stop="onModelCardClick"
      >
        <image
          v-if="personImageUrl"
          class="model"
          :src="personImageUrl"
          mode="aspectFit"
        ></image>
        <view
          v-else
          class="model placeholder"
          @click.stop="onModelCardClick"
        >
          <text class="placeholder-text">点击上传模特</text>
          <text class="placeholder-text">（清晰的人物全身照）</text>
        </view>
        <view class="model-tools">
          <!-- 预留 3D/空间 文本及 icon 位置 -->
          <image
            class="icon-3d"
            :src="'/static/icon/试衣搭配/Group_31.png'"
            mode="widthFix"
          />
        </view>
        <button
          v-if="personImageUrl"
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
          src="/static/icon/试衣搭配/功能卡片.png"
          mode="aspectFill"
        />
        <text class="ai-title single-recommendation">AI单品推荐</text>
        <text class="ai-desc single-recommendation">任选一件上衣或下装，可自动搭配成完整服装</text>
        <text class="ai-footer single-recommendation">AI助手</text>
      </view>

      <view
        class="ai-card"
        @click="goToDailyRecommendation"
      >
        <image
          class="ai-full"
          src="/static/icon/试衣搭配/功能卡片.png"
          mode="aspectFill"
        />
        <text class="ai-title daily-recommendation">每日推荐</text>
        <text class="ai-desc daily-recommendation">为您推荐今日搭配</text>
        <text class="ai-footer daily-recommendation">AI助手</text>
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
import request from '@/utils/request.js';
import apiConfig from '@/utils/api.js';
import uploadFile from '@/utils/upload.js';

export default {
  name: 'TryOnContainer',
  data() {
    return {
      products: [
        { img: '/static/example_pictures/sample1.jpg', title: '罗宾汉 ROBINHOOD 美式' },
        { img: '/static/example_pictures/sample2.jpg', title: 'PAUI COSTELLOE 罗·科' }
      ]
      ,
      topThumb: '',
      bottomThumb: '',
      personImageUrl: ''
    }
  },
  onShow() {
    // 每次页面显示时从 storage 读取最新的上/下装图片
    const top = uni.getStorageSync('topGarmentUrl');
    const bottom = uni.getStorageSync('bottomGarmentUrl');
    const person = uni.getStorageSync('personImageUrl');
    if (top) this.topThumb = top;
    if (bottom) this.bottomThumb = bottom;
    if (person) this.personImageUrl = person;
  },
  methods: {
    /***** 原有导航方法 *****/
    goToAiMatch() {
      uni.navigateTo({ url: '/subpackages/match/AiMatch/AiMatch' });
    },
    goTo2D() {
      uni.navigateTo({ url: '/subpackages/twodim/TwoDimDisplay/TwoDimDisplay' });
    },
    goToDailyRecommendation() {
      uni.navigateTo({ url: '/subpackages/recommendation/RecommendationWelcome/RecommendationWelcome' });
    },

    // 卡片点击：若无图片则触发上传；若有图片则不响应（重选按钮负责替换）
    onTopCardClick() {
      if (!this.topThumb) {
        // 仅允许从素材库选择上装，直接跳转到素材选择页
        this.selectFromResources('top');
      }
    },
    onBottomCardClick() {
      if (!this.bottomThumb) {
        // 仅允许从素材库选择下装，直接跳转到素材选择页
        this.selectFromResources('bottom');
      }
    },

    // 模特卡片点击：若无模特图则触发上传；若已存在则禁用卡片点击（使用重选按钮替换）
    onModelCardClick() {
      if (!this.personImageUrl) {
        this.uploadOptions('model');
      }
    },

    // 显示上传选项（相册/拍照）
    uploadOptions(type) {
      uni.showActionSheet({
        itemList: ['相册上传', '拍照上传'],
        success: (res) => {
          const idx = res.tapIndex;
          if (idx === 0) {
            this.uploadFromAlbum(type);
          } else if (idx === 1) {
            this.uploadFromCamera(type);
          }
        }
      });
    },

    /***** 一键试穿：检查、上传并提交试衣任务 *****/
    async onTryOn() {
      // 从 storage 中读取三张图片
      const personImageUrl = uni.getStorageSync('personImageUrl');
      let topGarmentUrl = uni.getStorageSync('topGarmentUrl');
      let bottomGarmentUrl = uni.getStorageSync('bottomGarmentUrl') || '';

      // 检查缺失项并提示
  const missing = [];
  if (!personImageUrl) missing.push('人物照片');
  if (!topGarmentUrl) missing.push('上装');
  // 下装为可选：若不存在，仍然可以提交
  if (missing.length) {
        uni.showToast({ title: `缺少：${missing.join('、')}`, icon: 'none' });
        return;
      }

      uni.showLoading({ title: '正在提交试衣...' });
      try {
        // 上传上装/下装（如果是本地临时路径），使用统一的 upload util
        if (!/^https?:\/\//.test(topGarmentUrl)) {
          const uploaded = await uploadFile({
            url: `${apiConfig.BASE_URL}/fitting_2d/submit_images`,
            filePath: topGarmentUrl,
            name: 'file'
          });
          // normalize: prefer string URL
          const uploadedUrl = typeof uploaded === 'string' ? uploaded : (uploaded && (uploaded.url || uploaded.fileUrl || uploaded.path || uploaded.src || uploaded.file || uploaded.avatarUrl));
          topGarmentUrl = uploadedUrl || uploaded;
          uni.setStorageSync('topGarmentUrl', topGarmentUrl);
        }
        if (bottomGarmentUrl && !/^https?:\/\//.test(bottomGarmentUrl)) {
          const uploaded = await uploadFile({
            url: `${apiConfig.BASE_URL}/fitting_2d/submit_images`,
            filePath: bottomGarmentUrl,
            name: 'file'
          });
          const uploadedUrl = typeof uploaded === 'string' ? uploaded : (uploaded && (uploaded.url || uploaded.fileUrl || uploaded.path || uploaded.src || uploaded.file || uploaded.avatarUrl));
          bottomGarmentUrl = uploadedUrl || uploaded;
          uni.setStorageSync('bottomGarmentUrl', bottomGarmentUrl);
        }

        // 提交任务（GET 接口，传入三个 URL）
        const res = await request({
          url: `${apiConfig.BASE_URL}/fitting_2d/submit_task`,
          method: 'GET',
          data: {
            personImageUrl,
            topGarmentUrl,
            bottomGarmentUrl: bottomGarmentUrl || ''
          }
        });

        uni.removeStorageSync('personImageUrl');
        uni.removeStorageSync('topGarmentUrl');
        uni.removeStorageSync('bottomGarmentUrl');
        uni.hideLoading();

        if (res) {
          uni.redirectTo({ url: `/subpackages/twodim/TwoDimComment/TwoDimComment?taskId=${res}` });
        } else {
          uni.showToast({ title: '任务提交失败', icon: 'none' });
        }
      } catch (err) {
        uni.hideLoading();
        uni.showToast({ title: '提交失败，请重试', icon: 'none' });
        console.error('一键试穿提交错误:', err);
      }
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
          // 对上/下装：立即展示缩略图并保存到 storage，ConfirmCloth 页面也会覆盖一次
          if (type === 'top' || type === 'bottom') {
            const key = type === 'top' ? 'topGarmentUrl' : 'bottomGarmentUrl';
            uni.setStorageSync(key, tempFilePath);
            if (type === 'top') this.topThumb = tempFilePath;
            else this.bottomThumb = tempFilePath;
            uni.navigateTo({ url: `/subpackages/confirm/ConfirmCloth/ConfirmCloth?imageUrl=${encodeURIComponent(tempFilePath)}&type=${type}` });
            return;
          }

          // 对模特（model）类型：不要在本页立即写 storage 或展示临时图，
          // 让 ConfirmModel 在用户确认并上传成功后写入 'personImageUrl' 并 navigateBack
          if (type === 'model') {
            this.navigateToConfirmModel(tempFilePath);
            return;
          }
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
  position: relative; /* make page the positioning context for absolute elements */
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
.thumb.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  color: #9b7ef6;
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
.model.placeholder {
  display: flex;
  flex-direction: column; /* 改为纵向排列 */
  align-items: center;
  justify-content: center;
  gap: 8rpx; /* 可选，控制两行间距 */
  background: #fafafa;
  color: #9b7ef6;
  border-radius: 12rpx;
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
}
.ai-title {
  font-weight: 700;
  color: #3b2b6c;
}
.ai-desc {
  font-size: 20rpx;
  color: #7a6f9a;
}
.ai-footer {
  font-size: 20rpx;
  color: #fff;
}
.ai-title.single-recommendation {
  position: absolute;
  top: 800rpx; /* adjust as needed to match design */
  left: 50rpx; /* place relative to page left padding */
  z-index: 20;
  margin: 0; /* reset any inherited margin */
}
.ai-desc.single-recommendation {
  position: absolute;
  top: 840rpx; /* adjust as needed */
  left: 50rpx;
  width: 26%; /* limit width to avoid overflow */
  z-index: 20;
  margin: 0;
}
.ai-footer.single-recommendation {
  position: absolute;
  top: 897rpx; /* adjust as needed to match design */
  left: 60rpx; /* place relative to page left padding */
  z-index: 20;
  margin: 0; /* reset any inherited margin */
}
.ai-title.daily-recommendation {
  position: absolute;
  top: 800rpx; /* adjust as needed to match design */
  left: 410rpx; /* place relative to page left padding */
  z-index: 20;
  margin: 0; /* reset any inherited margin */
}
.ai-desc.daily-recommendation {
  position: absolute;
  top: 840rpx; /* adjust as needed */
  left: 410rpx;
  width: 26%; /* limit width to avoid overflow */
  z-index: 20;
  margin: 0;
}
.ai-footer.daily-recommendation {
  position: absolute;
  top: 897rpx; /* adjust as needed to match design */
  left: 410rpx; /* place relative to page left padding */
  z-index: 20;
  margin: 0; /* reset any inherited margin */
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
.placeholder-text {
  color: #9b7ef6;
  font-size: 28rpx;
  text-align: center;
  line-height: 1.4;
}
</style>
