<template>
  <view class="goods-detail-page">
    <customer-service />
    <cart-icon />
    <!-- 商品图片展示 -->
    <view class="goods-image-swiper">
      <swiper
        indicator-dots
        autoplay
        circular
        class="swiper"
      >
        <swiper-item
          v-for="(img, idx) in images"
          :key="idx"
        >
          <image
            :src="img"
            class="main-image"
            mode="aspectFill"
          />
        </swiper-item>
      </swiper>
    </view>

    <!-- 商品参数区 -->
    <view class="goods-info">
      <view class="goods-price-row">
        <text class="goods-price">￥{{ price }}</text>
        <text class="goods-tag">新品</text>
      </view>
      <view class="goods-title">{{ title }}</view>
      <view class="goods-desc">{{ desc }}</view>
      <view class="goods-params">
        <view class="param-row">
          <text class="param-label">颜色：</text>
          <text class="param-value">{{ color }}</text>
        </view>
        <view class="param-row">
          <text class="param-label">尺码：</text>
          <text class="param-value">{{ size }}</text>
        </view>
      </view>
    </view>

    <!-- 尺码推荐 -->
    <view class="size-recommend">
      <view class="size-header">
        <text class="size-title">尺码推荐</text>
      </view>
      <view class="size-table">
        <view class="size-table-header">
          <text class="size-th">尺码</text>
          <text class="size-th">身高</text>
          <text class="size-th">体重</text>
        </view>
        <view
          class="size-table-row"
          v-for="(row, idx) in sizeTable"
          :key="idx"
        >
          <text class="size-td">{{ row.size }}</text>
          <text class="size-td">{{ row.height }}</text>
          <text class="size-td">{{ row.weight }}</text>
        </view>
      </view>
    </view>

    <!-- 商品详情 -->
    <view class="goods-detail-section">
      <view class="detail-title">商品详情</view>
      <image
        v-for="(img, idx) in detailImages"
        :key="idx"
        :src="img"
        class="detail-image"
        mode="widthFix"
      />
    </view>

    <!-- 更多推荐 -->
    <view class="more-recommend-section">
      <view class="recommend-title">更多推荐</view>
      <view class="recommend-list">
        <view
          class="recommend-item"
          v-for="item in moreGoods"
          :key="item.id"
        >
          <image
            :src="item.image"
            class="recommend-image"
            mode="aspectFill"
          />
          <view class="recommend-info">
            <text class="recommend-name">{{ item.name }}</text>
            <text class="recommend-price">￥{{ item.price }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 商品选择弹窗 -->
    <view
      v-if="showSkuPopup"
      class="sku-popup-mask"
      @click="closeSkuPopup"
    >
      <view
        class="sku-popup"
        @click.stop
      >
        <view class="sku-popup-header">
          <image
            :src="selectedStyle.img"
            class="sku-popup-img"
          />
          <view class="sku-popup-info">
            <text class="sku-popup-price">￥{{ selectedStylePrice }}</text>
            <text class="sku-popup-selected">已选：{{ selectedStyle.name }} {{ selectedSize }}</text>
          </view>
        </view>
        <view class="sku-popup-section">
          <view class="sku-popup-label">款式</view>
          <view class="sku-popup-style-list">
            <view
              v-for="(style, idx) in styles"
              :key="style.name"
              :class="['sku-popup-style-item', { active: selectedStyleIndex === idx }]"
              @click="selectStyle(idx)"
            >
              <image
                :src="style.img"
                class="sku-popup-style-img"
              />
              <text>{{ style.name }}</text>
            </view>
          </view>
        </view>
        <view class="sku-popup-section">
          <view class="sku-popup-label">尺码</view>
          <view class="sku-popup-size-list">
            <view
              v-for="size in sizes"
              :key="size"
              :class="['sku-popup-size-item', { active: selectedSize === size }]"
              @click="selectSize(size)"
            >{{ size }}</view>
          </view>
        </view>
        <button
          class="sku-popup-confirm"
          @click="confirmSku"
        >立即下单</button>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="button_pannel">
      <button
        class="add_to_cart"
        @click="openSkuPopup('cart')"
      >加入购物车</button>
      <button
        class="buy_now"
        @click="openSkuPopup('buy')"
      >立即购买</button>
    </view>
  </view>
</template>

<script>
import CustomerService from '@/components/CustomerService/CustomerService.vue';
import CartIcon from '@/components/CartIcon/CartIcon.vue';
export default {
  components: { CustomerService, CartIcon },
  name: 'GoodsDetail',
  data() {
    return {
      isReminderVisible: false, // 控制提醒信息的显示状态
      images: [
        '/static/example_pictures/sample2.png',
        '/static/example_pictures/sample3.png',
      ],
      price: 350,
      title: 'New Balance NB 530单层 经典复古 时尚特物',
      desc: 'New Balance NB 530单层 经典复古 时尚特物',
      color: '粉色',
      size: 'M',
      sizeTabs: ['尺码推荐'],
      sizeTabIndex: 0,
      sizeTable: [
        { size: 'S', height: '150-160', weight: '40-50kg' },
        { size: 'M', height: '160-170', weight: '50-60kg' },
        { size: 'L', height: '170-180', weight: '60-70kg' }
      ],
      detailImages: [
        '/static/example_pictures/sample1.png',
        '/static/example_pictures/sample2.png',
      ],
      moreGoods: [
        { id: 1, name: 'New Balance NB 530单层', price: 350, image: '/static/example_pictures/sample4.png' },
        { id: 2, name: 'New Balance NB 530单层', price: 350, image: '/static/example_pictures/sample4.png' },
        { id: 3, name: 'New Balance NB 530单层', price: 350, image: '/static/example_pictures/sample4.png' },
        { id: 4, name: 'New Balance NB 530单层', price: 350, image: '/static/example_pictures/sample4.png' }
      ],
      showSkuPopup: false,
      skuAction: '', // 'cart' or 'buy'
      styles: [
        { name: '主图', img: '/static/example_pictures/sample1.png', price: 350 },
        { name: '图2', img: '/static/example_pictures/sample2.png', price: 399 },
        { name: '图3', img: '/static/example_pictures/sample3.png', price: 299 }
      ],
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
      selectedStyleIndex: 0,
      selectedSize: 'XS'
    };
  },
  computed: {
    selectedStyle() {
      return this.styles[this.selectedStyleIndex];
    },
    // 当前弹窗显示的价格
    selectedStylePrice() {
      return this.selectedStyle.price;
    }
  },
  methods: {
    openSkuPopup(action) {
      this.skuAction = action;
      this.showSkuPopup = true;
    },
    closeSkuPopup() {
      this.showSkuPopup = false;
    },
    selectStyle(idx) {
      this.selectedStyleIndex = idx;
    },
    selectSize(size) {
      this.selectedSize = size;
    },
    confirmSku() {
      this.showSkuPopup = false;
      if (this.skuAction === 'cart') {
        
      } else {

      }
    //   this.isReminderVisible = true; // 显示提醒信息
    //     setTimeout(() => {
    //       this.isReminderVisible = false; // 2秒后隐藏提醒信息
    //     }, 2000);
    uni.showToast({
        title: this.skuAction === 'cart' ? '已加入购物车' : '已下单成功',
        icon: 'success',
        duration: 2000
      });
    }
  }
};
</script>

<style scoped>
.goods-detail-page {
  background: #fafafa;
  min-height: 100vh;
}
.goods-image-swiper {
  width: 100%;
  height: 1000rpx;
  background: #fff;
}
.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.goods-info {
  background: #fff;
  padding: 32rpx 24rpx 16rpx 24rpx;
  border-radius: 0 0 24rpx 24rpx;
  margin-bottom: 20rpx;
}
.goods-price-row {
  display: flex;
  align-items: center;
}
.goods-price {
  color: #6753e7;
  font-size: 36rpx;
  font-weight: bold;
  margin-right: 16rpx;
}
.goods-tag {
  font-size: 22rpx;
  color: #fff;
  background: #6753e7;
  border-radius: 8rpx;
  padding: 4rpx 12rpx;
}
.goods-title {
  font-size: 30rpx;
  color: #222;
  font-weight: 500;
  margin: 16rpx 0 8rpx 0;
}
.goods-desc {
  font-size: 24rpx;
  color: #888;
  margin-bottom: 12rpx;
}
.goods-params {
  margin-top: 8rpx;
}
.param-row {
  display: flex;
  margin-bottom: 6rpx;
}
.param-label {
  color: #888;
  font-size: 22rpx;
  width: 80rpx;
}
.param-value {
  color: #222;
  font-size: 22rpx;
}
.size-recommend {
  background: #fff;
  margin: 20rpx 0;
  border-radius: 24rpx;
  padding: 24rpx;
}
.size-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.size-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #222;
}
.size-tabs {
  display: flex;
}
.size-tab {
  font-size: 24rpx;
  color: #888;
  margin-left: 24rpx;
  padding-bottom: 6rpx;
  border-bottom: 4rpx solid transparent;
}
.size-tab.active {
  color: #6753e7;
  border-bottom: 4rpx solid #6753e7;
}
.size-table {
  margin-top: 18rpx;
}
.size-table-header,
.size-table-row {
  display: flex;
  justify-content: space-between;
  padding: 8rpx 0;
}
.size-th,
.size-td {
  width: 33%;
  text-align: center;
  font-size: 22rpx;
  color: #222;
}
.goods-detail-section {
  background: #fff;
  margin: 20rpx 0;
  border-radius: 24rpx;
  padding: 24rpx;
}
.detail-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #222;
  margin-bottom: 18rpx;
}
.detail-image {
  width: 100%;
  margin-bottom: 18rpx;
  border-radius: 12rpx;
}
.more-recommend-section {
  background: #fff;
  margin: 20rpx 0 0 0;
  border-radius: 24rpx;
  padding: 24rpx;
}
.recommend-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #222;
  margin-bottom: 18rpx;
}
.recommend-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}
.recommend-item {
  width: 47%;
  background: #f7f7f7;
  border-radius: 16rpx;
  margin-bottom: 18rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 12rpx;
}
.recommend-image {
  width: 100%;
  height: 200rpx;
  border-radius: 16rpx 16rpx 0 0;
  object-fit: cover;
}
.recommend-info {
  width: 90%;
  margin: 10rpx 0 0 0;
  text-align: center;
}
.recommend-name {
  font-size: 22rpx;
  color: #222;
  display: block;
}
.recommend-price {
  color: #6753e7;
  font-size: 24rpx;
  font-weight: bold;
  margin-top: 6rpx;
  display: block;
}

.swiper {
  height: 100%;
}

.button_pannel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 20rpx;
  background-color: #fff;
}

.add_to_cart {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  background-color: #c4c4c4;
  color: #333;
  margin-right: 20rpx;
}
.buy_now {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  background-color: #6753e7;
  color: #fff;
  margin-left: 20rpx;
  margin-right: 40rpx;
}

/* 遮罩层 */
.sku-popup-mask {
  position: fixed;
  z-index: 2000;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}
/* 弹窗主体 */
.sku-popup {
  width: 100%;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 32rpx 24rpx 24rpx 24rpx;
  animation: popupUp 0.25s;
}
@keyframes popupUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
.sku-popup-header {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}
.sku-popup-img {
  width: 120rpx;
  height: 120rpx;
  border-radius: 16rpx;
  margin-right: 20rpx;
  object-fit: cover;
  background: #f7f7f7;
}
.sku-popup-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.sku-popup-price {
  color: #6753e7;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 8rpx;
}
.sku-popup-selected {
  font-size: 24rpx;
  color: #888;
}
.sku-popup-section {
  margin-bottom: 24rpx;
}
.sku-popup-label {
  font-size: 24rpx;
  color: #222;
  margin-bottom: 12rpx;
}
.sku-popup-style-list {
  display: flex;
  gap: 20rpx;
}
.sku-popup-style-item {
  width: 120rpx;
  height: 120rpx;
  border: 2rpx solid #eee;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  cursor: pointer;
}
.sku-popup-style-item.active {
  border-color: #6753e7;
  background: #f3f0ff;
}
.sku-popup-style-img {
  width: 60rpx;
  height: 60rpx;
  margin-bottom: 8rpx;
  object-fit: cover;
}
.sku-popup-size-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}
.sku-popup-size-item {
  min-width: 80rpx;
  padding: 12rpx 0;
  text-align: center;
  border-radius: 40rpx;
  background: #f7f7f7;
  color: #222;
  font-size: 24rpx;
  border: 2rpx solid #f7f7f7;
  margin-bottom: 10rpx;
  cursor: pointer;
}
.sku-popup-size-item.active {
  color: #6753e7;
  border-color: #6753e7;
  background: #f3f0ff;
}
.sku-popup-confirm {
  width: 100%;
  height: 72rpx;
  background: #6753e7;
  color: #fff;
  border-radius: 40rpx;
  font-size: 28rpx;
  margin-top: 24rpx;
}
</style>