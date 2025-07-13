<!-- 已弃用 -->

<template>
  <view class="cart-page">
    <!-- 购物车商品列表 -->
    <view class="cart-list">
      <view
        class="cart-item"
        v-for="(item, idx) in cartList"
        :key="item.id"
      >
        <!-- 品牌名称从API中没有，可以先移除或根据实际情况保留 -->
        <!-- <view class="cart-item-brand">品牌名称</view> -->
        <view class="cart-item-content">
          <image
            :src="item.image"
            class="cart-item-img"
            mode="aspectFill"
          />
          <view class="cart-item-info">
            <!-- 使用API返回的商品名称 -->
            <text class="cart-item-name">{{ item.productName }}</text>
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
        <text class="footer-price">￥{{ totalPrice.toFixed(2) }}</text>
        <!-- 新增：删除按钮 -->
        <button
          class="footer-delete"
          @click="handleDeleteSelected"
        >删除</button>
        <button
          class="footer-checkout"
          @click="handleCheckout"
        >结算</button>
      </view>
    </view>

    <!-- 新增：加载状态提示 -->
    <view class="loading-status">
      <uni-load-more
        v-if="isLoading"
        status="loading"
        content-text="正在加载..."
      ></uni-load-more>
      <uni-load-more
        v-if="!hasMore && cartList.length > 0"
        status="noMore"
        content-text="没有更多商品了"
      ></uni-load-more>
    </view>
  </view>
</template>

<script>
// 1. 导入封装的 request 函数和 apiConfig
import request from '@/utils/request.js';
import apiConfig from '@/utils/api.js';

export default {
  data() {
    return {
      cartList: [],
      page: 1,
      pageSize: 10,
      hasMore: true,
      isLoading: false,
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
    
    // 2. 改造 handleDeleteSelected 方法
    async handleDeleteSelected() {
      const selectedIds = this.cartList
        .filter(item => item.selected)
        .map(item => item.id);

      if (selectedIds.length === 0) {
        uni.showToast({ title: '请选择要删除的商品', icon: 'none' });
        return;
      }

      const modalRes = await uni.showModal({
        title: '确认删除',
        content: `确定要删除这 ${selectedIds.length} 件商品吗？`,
      });

      if (modalRes.confirm) {
        uni.showLoading({ title: '正在删除...' });
        try {
          await request({
            url: `${apiConfig.BASE_URL}/shoppingCart/deleteProduct`,
            method: 'DELETE',
            data: selectedIds,
          });
          uni.showToast({ title: '删除成功', icon: 'success' });
          this.refresh(); // 重新加载数据
        } catch (error) {
          // 错误提示已由 request 函数处理
          console.error("Delete failed:", error);
        } finally {
          uni.hideLoading();
        }
      }
    },

    // 3. 改造 handleCheckout 方法
    async handleCheckout() {
      const selectedItems = this.cartList.filter(item => item.selected);
      if (selectedItems.length === 0) {
        uni.showToast({ title: '请选择要结算的商品', icon: 'none' });
        return;
      }
      
      const addressId = 1; // 假设的地址ID
      uni.showLoading({ title: '正在下单...' });
      try {
        const order = await request({
          url: `${apiConfig.BASE_URL}/order/createFromCart`,
          method: 'POST',
          data: { addressId },
        });

        uni.showToast({ title: '下单成功', icon: 'success', duration: 1500 });
        
        // 成功后可以跳转到订单详情页
        // setTimeout(() => {
        //   uni.navigateTo({
        //     url: `/pages/OrderConfirmation/OrderConfirmation?orderId=${order.orderId}`,
        //   });
        // }, 1500);

      } catch (error) {
        console.error("Checkout failed:", error);
      } finally {
        uni.hideLoading();
      }
    },

    // 4. 改造 fetchCartList 方法
    async fetchCartList(loadMore = false) {
      if (this.isLoading || (!loadMore && !this.hasMore)) return;
      this.isLoading = true;

      try {
        const newItemsData = await request({
          url: `${apiConfig.BASE_URL}/shoppingCart/getProduct`,
          method: 'GET',
          data: {
            page: this.page,
            pageSize: this.pageSize,
          },
        });

        const newItems = newItemsData.map(item => ({
          ...item, // 保留后端返回的所有字段
          id: item.id,
          image: item.imageUrl,
          color: item.colorName,
          size: item.sizeName,
          selected: true, // 默认选中
        }));

        this.cartList = loadMore ? [...this.cartList, ...newItems] : newItems;
        this.hasMore = newItems.length === this.pageSize;
        if (this.hasMore) {
          this.page++;
        }
      } catch (error) {
        console.error("Fetch cart failed:", error);
        this.hasMore = false; // 出错时停止加载更多
      } finally {
        this.isLoading = false;
      }
    },

    // 5. refresh 方法保持不变，但现在调用的是改造后的 fetchCartList
    async refresh() {
      this.page = 1;
      this.cartList = [];
      this.hasMore = true;
      await this.fetchCartList();
    },
  },
  onShow() {
    this.refresh();
  },
  onReachBottom() {
    if (this.hasMore && !this.isLoading) {
      this.fetchCartList(true);
    }
  },
  onPullDownRefresh() {
    this.refresh().then(() => {
      uni.stopPullDownRefresh();
    });
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
  margin: 0;
  margin-right: 40rpx;
}
/* 新增：删除按钮样式 */
.footer-delete {
  background: #fff;
  color: #e74c3c;
  font-size: 28rpx;
  border-radius: 40rpx;
  padding: 0 40rpx;
  height: 64rpx;
  line-height: 64rpx;
  border: 1rpx solid #e74c3c;
  margin-left: auto; /* 将其推到左边 */
  margin-right: 20rpx; /* 与结算按钮的间距 */
}

/* 新增：加载状态样式 */
.loading-status {
  padding: 20rpx 0;
}
</style>