<template>
  <view class="goods-detail-page">
    <!-- <customer-service /> -->
    <cart-icon />

    <!-- 商品图片展示 (添加 v-if) -->
    <view
      v-if="productInfo.images && productInfo.images.length > 0"
      class="goods-image-swiper"
    >
      <swiper
        indicator-dots
        autoplay
        circular
        class="swiper"
      >
        <swiper-item
          v-for="(img, idx) in productInfo.images"
          :key="idx"
        >
          <view class="image-wrapper">
            <image
              :src="img"
              class="main-image"
              mode="aspectFill"
              @error="onImageError(idx)"
              :style="{ opacity: imageLoadError[idx] ? 0 : 1 }"
            />
            <!-- 图片加载失败时显示占位 -->
            <view
              v-if="imageLoadError[idx]"
              class="image-fallback"
            >
              <text class="image-fallback-text">图片加载失败</text>
            </view>
            <!-- 只在第一张图片上显示3D按钮 -->
            <view
              v-if="idx === 0"
              class="three-d-btn"
              @click.stop="goToThreeDimDisplay"
            >
              <text class="three-d-btn-text">3d</text>
            </view>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 商品参数区 (添加 v-if) -->
    <view
      v-if="productInfo.title"
      class="goods-info"
    >
      <view class="goods-price-row">
        <text class="goods-price">￥{{ productInfo.price }}</text>
        <!--<text class="goods-tag">新品</text>-->
      </view>
      <view class="goods-title">{{ productInfo.title }}</view>
      <view class="goods-desc">{{ productInfo.desc }}</view>
    </view>

    <!-- 商品选择弹窗 (添加 v-if) -->
    <view
      v-if="showSkuPopup && styles.length > 0"
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
              :key="style.styleId"
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
              :class="['sku-popup-size-item', { active: selectedSize === size, disabled: !isSizeAvailable(size) }]"
              @click="selectSize(size)"
            >{{ size }}</view>
          </view>
        </view>
        <view class="sku-popup-section sku-quantity-section">
          <view class="sku-popup-label">数量</view>
          <view class="quantity-selector">
            <button
              class="quantity-btn"
              @click="changeQuantity(-1)"
              :disabled="quantity <= 1"
            >-</button>
            <input
              class="quantity-input"
              type="number"
              v-model.number="quantity"
            />
            <button
              class="quantity-btn"
              @click="changeQuantity(1)"
            >+</button>
          </view>
        </view>
        <button
          class="sku-popup-confirm"
          @click="confirmSku"
        >确定</button>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="button_pannel">
      <button
        class="add_to_cart"
        @click="openSkuPopup('cart')"
      >加入我的衣橱</button>
      <button
        class="buy_now"
        @click="openSkuPopup('buy')"
      >立即购买</button>
    </view>
  </view>
</template>

<script>
import request from '@/utils/request.js';
import apiConfig from '@/utils/api.js';
import CustomerService from '@/components/CustomerService/CustomerService.vue';
import CartIcon from '@/components/CartIcon/CartIcon.vue';

export default {
  components: { CustomerService, CartIcon },
  name: 'GoodsDetail',
  data() {
    return {
      productId: null,
      productInfo: {},       styles: [],            variations: [],        sizes: [],             
      quantity: 1,
      selectedStyleIndex: 0,
      selectedSize: '',
      
      showSkuPopup: false,
      skuAction: '', 
            imageLoadError: [],     };
  },
  computed: {
    selectedStyle() {
      return this.styles.length > 0 ? this.styles[this.selectedStyleIndex] : {};
    },
    selectedStylePrice() {
      return this.selectedStyle.price || this.productInfo.price || 0;
    },
    selectedVariation() {
      if (!this.selectedStyle || !this.selectedSize) return null;
      return this.variations.find(v => v.styleId === this.selectedStyle.styleId && v.size === this.selectedSize);
    }
  },
  onLoad(options) {
    if (options.id) {
      this.productId = options.id;
      this.fetchProductDetails(this.productId);
      
    } else {
      uni.showToast({ title: '商品不存在', icon: 'none' });
      uni.navigateBack();
    }
  },
  methods: {
        async fetchProductDetails(id) {
      uni.showLoading({ title: '加载中...' });
      try {
        const productData = await request({
          url: `${apiConfig.BASE_URL}/mall/getProductDetail/${id}`,
          method: 'GET',
        });

                this.productInfo = {
          title: productData.productName,
          desc: productData.description,
          price: productData.price,
          images: productData.imageUrl,
        };

        const stylesMap = new Map();
        const sizesSet = new Set();
        
        productData.variations.forEach(v => {
          if (!stylesMap.has(v.colorName)) {
            stylesMap.set(v.colorName, {
              styleId: v.styleId,               name: v.colorName,
              img: v.imageUrl,               price: v.price,
            });
          }
          sizesSet.add(v.sizeName);
        });

        this.styles = Array.from(stylesMap.values());
        this.sizes = Array.from(sizesSet);
        this.variations = productData.variations.map(v => ({
          styleId: v.styleId,
          size: v.sizeName,
          stock: v.stockQuantity,
        }));

                if (this.styles.length > 0) {
          this.selectStyle(0);
        }
        if (this.sizes.length > 0) {
                    const firstAvailableSize = this.sizes.find(s => this.isSizeAvailable(s));
          if (firstAvailableSize) {
            this.selectSize(firstAvailableSize);
          }
        }

      } catch (error) {
        console.error("fetchProductDetails failed:", error);
                setTimeout(() => uni.navigateBack(), 1500);
      } finally {
        uni.hideLoading();
      }
    },

        async confirmSku() {
      if (!this.selectedSize) {
        uni.showToast({ title: '请选择尺码', icon: 'none' });
        return;
      }
      if (this.skuAction === 'cart') {
        await this.addToCart();
      } else if (this.skuAction === 'buy') {
                
                uni.navigateTo({
          url: `/pages/OuterShop/OuterShop`
        });
      }
      this.closeSkuPopup();
    },

    async addToCart() {
      uni.showLoading({ title: '正在添加...' });
      try {
        const variation = this.selectedVariation;
        if (!variation) {
          uni.showToast({ title: '无效的商品规格', icon: 'none' });
          return;
        }
        await request({
          url: `${apiConfig.BASE_URL}/shoppingCart/addProduct`,
          method: 'POST',
          data: {
            productId: this.productId,
            styleId: this.selectedStyle.styleId,
            size: this.selectedSize,
            quantity: this.quantity,
          },
        });
        uni.showToast({ title: '添加成功', icon: 'success' });
              } catch (error) {
        console.error("addToCart failed:", error);
      } finally {
        uni.hideLoading();
      }
    },

    isSizeAvailable(size) {
        if (!this.selectedStyle) return false;
        const variation = this.variations.find(v => v.styleId === this.selectedStyle.styleId && v.size === size);
        return variation && variation.stock > 0;
    },
    openSkuPopup(action) {
      this.skuAction = action;
      this.showSkuPopup = true;
    },
    closeSkuPopup() {
      this.showSkuPopup = false;
    },
    selectStyle(idx) {
      this.selectedStyleIndex = idx;
            this.selectedSize = '';
            const firstAvailableSize = this.sizes.find(s => this.isSizeAvailable(s));
      if (firstAvailableSize) {
        this.selectSize(firstAvailableSize);
      }
    },
    selectSize(size) {
      if (this.isSizeAvailable(size)) {
        this.selectedSize = size;
      } else {
        uni.showToast({ title: '该尺码无货', icon: 'none' });
      }
    },
    changeQuantity(amount) {
      const newQuantity = this.quantity + amount;
      if (newQuantity > 0) {
        this.quantity = newQuantity;
      }
    },

    goToThreeDimDisplay() {
      uni.navigateTo({
        url: `/pages/ThreeDimDisplay/ThreeDimDisplay?styleId=${this.productId}`
      });
    },

        onImageError(idx) {
      this.$set(this.imageLoadError, idx, true);
    },
  }
};
</script>

<style scoped>
.goods-detail-page {
  background: #fafafa;
  min-height: 100vh;
  padding-bottom: 120rpx;
}
.goods-image-swiper {
  width: 100%;
  height: 800rpx;
  background: #fff;
}
.swiper {
  width: 100%;
  height: 100%;
}
.swiper-item {
  width: 100%;
  height: 100%;
}
.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.image-wrapper {
  position: relative;
  width: 100%;
  height: 800rpx;
  overflow: hidden;
}
.three-d-btn {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 120rpx;
  height: 120rpx;
  background: rgba(103, 83, 231, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  box-shadow: 0 4rpx 16rpx rgba(103, 83, 231, 0.15);
  cursor: pointer;
}
.three-d-btn-text {
  color: #fff;
  font-size: 36rpx;
  font-weight: bold;
  letter-spacing: 2rpx;
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
  box-sizing: border-box;
  border-top: 1rpx solid #f0f0f0;
}
.add_to_cart {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  background-color: #f0f0f0;
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
}
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
.sku-popup {
  width: 100%;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 32rpx 24rpx 24rpx 24rpx;
  animation: popupUp 0.25s;
  box-sizing: border-box;
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
  flex-wrap: wrap;
}
.sku-popup-style-item {
  display: flex;
  align-items: center;
  border: 2rpx solid #eee;
  border-radius: 12rpx;
  padding: 10rpx;
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
  margin-right: 10rpx;
  object-fit: cover;
  border-radius: 8rpx;
}
.sku-popup-size-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}
.sku-popup-size-item {
  min-width: 80rpx;
  padding: 12rpx 24rpx;
  text-align: center;
  border-radius: 40rpx;
  background: #f7f7f7;
  color: #222;
  font-size: 24rpx;
  border: 2rpx solid #f7f7f7;
  cursor: pointer;
}
.sku-popup-size-item.active {
  color: #6753e7;
  border-color: #6753e7;
  background: #f3f0ff;
}
.sku-popup-size-item.disabled {
  color: #ccc;
  background: #f9f9f9;
  text-decoration: line-through;
  cursor: not-allowed;
}
.sku-quantity-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.quantity-selector {
  display: flex;
  align-items: center;
}
.quantity-btn {
  width: 50rpx;
  height: 50rpx;
  background-color: #f7f7f7;
  color: #333;
  border: none;
  border-radius: 50%;
  font-size: 36rpx;
  line-height: 50rpx;
  padding: 0;
  margin: 0;
}
.quantity-btn[disabled] {
  color: #ccc;
  background-color: #f9f9f9;
}
.quantity-input {
  width: 80rpx;
  text-align: center;
  font-size: 28rpx;
  margin: 0 10rpx;
  background-color: #f7f7f7;
  border-radius: 8rpx;
  height: 50rpx;
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
.image-fallback {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}
.image-fallback-text {
  color: #bbb;
  font-size: 28rpx;
}
</style>