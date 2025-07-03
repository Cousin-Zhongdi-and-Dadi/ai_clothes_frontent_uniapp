<template>
  <view class="goods-detail-page">
    <customer-service />
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
          <image
            :src="img"
            class="main-image"
            mode="aspectFill"
          />
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
        <text class="goods-tag">新品</text>
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
import apiConfig from '@/utils/api.js';

export default {
  components: { CustomerService, CartIcon },
  name: 'GoodsDetail',
  data() {
    return {
      productId: null,
      productInfo: {}, // 存储商品基本信息
      styles: [],      // 存储款式信息
      variations: [],  // 存储规格信息
      sizes: [],       // 存储所有可用尺码
      
      quantity: 1,
      selectedStyleIndex: 0,
      selectedSize: '',
      
      showSkuPopup: false,
      skuAction: '',
    };
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
  methods: {
    // 修改：从后端获取商品详情
    async fetchProductDetails(id) {
      try {
        // 1. 发起真实的API请求
        const res = await uni.request({
          url: `${apiConfig.BASE_URL}/mall/getProductDetail/${id}`, // 使用 Path 参数
          method: 'GET',
        });

        // 2. 校验请求和业务逻辑是否都成功
        if (res.statusCode === 200 && res.data && res.data.code === 0) {
          const productData = res.data.data;

          // 3. 映射API数据到前端组件状态
          // 3.1 映射商品基本信息
          this.productInfo = {
            title: productData.productName,
            desc: productData.description,
            price: productData.price,
            images: productData.imageUrl,
          };

          // 3.2 处理规格(variations)数据，生成 Styles 和 Sizes
          const stylesMap = new Map();
          const sizesSet = new Set();
          
          productData.variations.forEach(v => {
            // 如果这个颜色是第一次出现，则创建一个新的款式对象
            if (!stylesMap.has(v.colorName)) {
              stylesMap.set(v.colorName, {
                // styleId 可以用颜色名或索引，这里用颜色名保证唯一
                styleId: v.colorName, 
                name: v.colorName,
                img: v.imageUrl,
                // 计算该款式的最终价格
                price: productData.price + v.additionalPrice, 
              });
            }
            // 收集所有不重复的尺码
            sizesSet.add(v.sizeName);
          });

          this.styles = Array.from(stylesMap.values());
          this.sizes = Array.from(sizesSet);

          // 3.3 映射前端所需的 variations 结构
          this.variations = productData.variations.map(v => ({
            variationId: v.id,
            styleId: v.colorName, // 与上面 styleId 保持一致
            size: v.sizeName,
            stock: v.stockQuantity,
          }));

          // 4. 设置默认选中项
          if (this.sizes.length > 0) {
            // 找到第一个有库存的尺码作为默认值
            this.selectedSize = this.sizes.find(size => this.isSizeAvailable(size)) || '';
          }

        } else {
          throw new Error(res.data.message || '商品信息加载失败');
        }
      } catch (error) {
        uni.showToast({ title: error.message || '网络请求异常', icon: 'none' });
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
    },
    selectSize(size) {
      if (this.isSizeAvailable(size)) {
        this.selectedSize = size;
      } else {
        uni.showToast({ title: '该尺码已售罄', icon: 'none' });
      }
    },
    changeQuantity(amount) {
        const newQuantity = this.quantity + amount;
        if (newQuantity >= 1) {
            this.quantity = newQuantity;
        }
    },
    async confirmSku() {
      if (!this.selectedVariation) {
        uni.showToast({ title: '请选择有效的商品规格', icon: 'none' });
        return;
      }
      if (this.selectedVariation.stock === 0) {
        uni.showToast({ title: '该规格已售罄', icon: 'none' });
        return;
      }

      this.showSkuPopup = false;

      if (this.skuAction === 'cart') {
        await this.addToCart();
      } else {
        // 修改：调用新的 buyNow 方法
        await this.buyNow();
      }
    },
    // 【此方法已符合API规范，无需修改】
    async addToCart() {
      const params = {
        productId: this.productId,
        variationId: this.selectedVariation.variationId,
        quantity: this.quantity
      };

      console.log('添加到购物车 API 请求参数:', params);

      try {
        const res = await uni.request({
          url: `${apiConfig.BASE_URL}/cart/add`, 
          method: 'POST',
          data: params,
        });

        if (res.statusCode === 200 || res.statusCode === 201) {
          uni.showToast({
            title: '已加入购物车',
            icon: 'success',
            duration: 2000
          });
        } else {
          throw new Error(res.data.message || '添加失败');
        }
      } catch (error) {
        uni.showToast({
          title: error.message || '网络请求失败',
          icon: 'none'
        });
      }
    },
    // 新增：立即购买并创建订单的方法
    async buyNow() {
      // 在实际应用中，此处应先跳转到地址选择页或弹出地址选择器
      // 这里我们模拟一个默认的地址ID
      const addressId = 1; 

      const params = {
        addressId: addressId,
        productId: this.productId,
        variationId: this.selectedVariation.variationId,
        quantity: this.quantity
      };

      console.log('立即购买 API 请求参数:', params);

      try {
        const res = await uni.request({
          url: `${apiConfig.BASE_URL}/order/create`, // 假设的下单API端点
          method: 'POST',
          data: params,
        });

        // 检查后端返回结果
        if (res.statusCode === 200 && res.data && res.data.code === 0) {
          const order = res.data.data;
          uni.showToast({
            title: '下单成功',
            icon: 'success',
            duration: 1500
          });
          
          // 下单成功后，跳转到订单详情或支付页面，并携带订单ID
          setTimeout(() => {
            uni.navigateTo({
              url: `/pages/OrderConfirmation/OrderConfirmation?orderId=${order.orderId}`
            });
          }, 1500);

        } else {
          throw new Error(res.data.message || '下单失败');
        }
      } catch (error) {
        uni.showToast({
          title: error.message || '网络请求异常',
          icon: 'none'
        });
      }
    }
  },
  onLoad(options) {
      this.productId = options.id || 1; // 从页面参数获取ID
      this.fetchProductDetails(this.productId); // 获取商品详情
  },
};
</script>

<style scoped>
/* 样式部分保持不变，此处省略 */
.goods-detail-page {
  background: #fafafa;
  min-height: 100vh;
  padding-bottom: 120rpx; /* 为底部按钮留出空间 */
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
</style>