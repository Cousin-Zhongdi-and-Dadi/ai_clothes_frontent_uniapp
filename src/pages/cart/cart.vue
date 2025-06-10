<template>
  <view class="cart-page">
    <!-- 购物车商品列表 -->
    <view class="cart-list">
      <view
        class="cart-item"
        v-for="(item, idx) in cartList"
        :key="item.id"
      >
        <view class="cart-item-brand">品牌名称</view>
        <view class="cart-item-content">
          <image
            :src="item.image"
            class="cart-item-img"
            mode="aspectFill"
          />
          <view class="cart-item-info">
            <text class="cart-item-name">商品名称</text>
            <view class="cart-item-params">
              <text class="cart-item-param">颜色：{{ item.color }}</text>
              <text class="cart-item-param">尺码：{{ item.size }}</text>
            </view>
            <text class="cart-item-price">￥{{ item.price }}</text>
          </view>
          <view class="cart-item-select">
            <view
              class="select-circle"
              :class="{ selected: item.selected }"
              @click="toggleSelect(idx)"
            ></view>
          </view>
        </view>
      </view>
    </view>
    <!-- 底部结算栏 -->
    <view class="cart-footer">
      <view class="footer-left">
        <view
          class="select-circle"
          :class="{ selected: isAllSelected }"
          @click="toggleSelectAll"
        ></view>
        <text class="footer-select-all">全选</text>
      </view>
      <view class="footer-right">
        <text class="footer-total">合计：</text>
        <text class="footer-price">￥{{ totalPrice }}</text>
        <button class="footer-checkout">结算</button>
      </view>
    </view>
  </view>
</template>

<script>
import axios from 'axios'

export default {
  data() {
    return {
      cartList: []
    };
  },
  computed: {
    isAllSelected() {
      return this.cartList.length > 0 && this.cartList.every(item => item.selected);
    },
    totalPrice() {
      return this.cartList
        .filter(item => item.selected)
        .reduce((sum, item) => sum + item.price * item.quantity, 0);
    }
  },
  methods: {
    toggleSelect(idx) {
      this.cartList[idx].selected = !this.cartList[idx].selected;
    },
    toggleSelectAll() {
      const select = !this.isAllSelected;
      this.cartList.forEach(item => (item.selected = select));
    },
    async fetchCartList() {
      try {
        const res = await axios.get('/shoppingCart/getProduct');
        if (res.data && res.data.code === 200 && Array.isArray(res.data.data)) {
          this.cartList = res.data.data.map(item => ({
            id: item.id,
            image: item.imageUrl,
            color: item.colorName,
            size: item.sizeName,
            price: item.price,
            quantity: item.quantity,
            productName: item.productName,
            selected: true
          }));
        }
      } catch (e) {
        uni.showToast({ title: '加载购物车失败', icon: 'none' });
      }
    }
  },
  onLoad() {
    this.fetchCartList();
  }
};
</script>

<style scoped>
.cart-page {
  background: #fafafa;
  min-height: 100vh;
  padding-bottom: 120rpx;
}
.cart-header {
  background: #fff;
  padding: 30rpx 0 10rpx 0;
  text-align: center;
  font-size: 36rpx;
  font-weight: bold;
  color: #222;
  border-bottom: 1rpx solid #eee;
}
.cart-title {
  font-size: 36rpx;
  font-weight: bold;
}
.cart-list {
  padding: 0 20rpx;
}
.cart-item {
  background: #fff;
  border-radius: 20rpx;
  margin-top: 24rpx;
  padding: 20rpx 0 0 0;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}
.cart-item-brand {
  font-size: 24rpx;
  color: #888;
  margin-left: 24rpx;
  margin-bottom: 10rpx;
}
.cart-item-content {
  display: flex;
  align-items: center;
  padding: 0 24rpx 20rpx 24rpx;
}
.cart-item-img {
  width: 120rpx;
  height: 140rpx;
  border-radius: 12rpx;
  object-fit: cover;
  background: #f7f7f7;
}
.cart-item-info {
  flex: 1;
  margin-left: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 140rpx;
}
.cart-item-name {
  font-size: 28rpx;
  color: #222;
  font-weight: 500;
  margin-bottom: 8rpx;
}
.cart-item-params {
  font-size: 22rpx;
  color: #888;
  margin-bottom: 8rpx;
}
.cart-item-param {
  margin-right: 20rpx;
}
.cart-item-price {
  color: #6753e7;
  font-size: 28rpx;
  font-weight: bold;
}
.cart-item-select {
  margin-left: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 140rpx;
}
.select-circle {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  border: 2rpx solid #ccc;
  background: #fff;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s;
}
.select-circle.selected {
  border-color: #6753e7;
  background: #6753e7;
}
.select-circle.selected::after {
  content: "";
  position: absolute;
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #fff;
}
.cart-footer {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  background: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.04);
  z-index: 100;
}
.footer-left {
  display: flex;
  align-items: center;
}
.footer-select-all {
  font-size: 26rpx;
  color: #222;
  margin-left: 12rpx;
}
.footer-right {
  display: flex;
  align-items: center;
}
.footer-total {
  font-size: 26rpx;
  color: #888;
  margin-right: 4rpx;
}
.footer-price {
  font-size: 32rpx;
  color: #6753e7;
  font-weight: bold;
  margin-right: 24rpx;
}
.footer-checkout {
  background: #6753e7;
  color: #fff;
  font-size: 28rpx;
  border-radius: 40rpx;
  padding: 0 40rpx;
  height: 64rpx;
  line-height: 64rpx;
  border: none;
}
</style>