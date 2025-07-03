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
// 1. 导入API配置文件
import apiConfig from '@/utils/api.js';

export default {
  data() {
    return {
      // 1. 修改数据结构以支持分页
      cartList: [],
      page: 1, // 当前页码
      pageSize: 10, // 每页加载的数量
      hasMore: true, // 是否还有更多数据
      isLoading: false, // 是否正在加载中，防止重复请求
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
    // 新增：处理删除选中商品的逻辑
    async handleDeleteSelected() {
      // 1. 找出所有被选中商品的ID
      const selectedIds = this.cartList
        .filter(item => item.selected)
        .map(item => item.id);

      // 2. 如果没有选中任何商品，则提示用户并退出
      if (selectedIds.length === 0) {
        uni.showToast({ title: '请选择要删除的商品', icon: 'none' });
        return;
      }

      // 3. 弹窗确认，防止用户误操作
      const modalRes = await uni.showModal({
        title: '确认删除',
        content: `确定要删除这 ${selectedIds.length} 件商品吗？`,
      });

      // 4. 如果用户点击了“确定”
      if (modalRes.confirm) {
        try {
          // 发起DELETE请求
          const res = await uni.request({
            url: `${apiConfig.BASE_URL}/shoppingCart/deleteProduct`,
            method: 'DELETE',
            data: selectedIds, // 将ID数组作为请求体发送
          });

          // 5. 检查后端返回结果
          if (res.statusCode === 200 && res.data && res.data.code === 0) {
            uni.showToast({ title: '删除成功', icon: 'success' });
            // 6. 删除成功后，立即重新获取购物车列表以刷新页面
            this.refresh();
          } else {
            throw new Error(res.data.message || '删除失败');
          }
        } catch (e) {
          uni.showToast({ title: e.message || '网络请求异常', icon: 'none' });
        }
      }
    },
    // 新增：处理结算和下单的逻辑
    async handleCheckout() {
      // 1. 检查是否选择了商品
      const selectedItems = this.cartList.filter(item => item.selected);
      if (selectedItems.length === 0) {
        uni.showToast({ title: '请选择要结算的商品', icon: 'none' });
        return;
      }

      // 2. 模拟获取地址ID
      // 在真实应用中，此处应跳转到地址选择页或从全局状态获取
      const addressId = 1; 

      try {
        // 3. 发起下单请求
        const res = await uni.request({
          url: `${apiConfig.BASE_URL}/order/createFromCart`, // 假设的购物车下单API端点
          method: 'POST',
          data: {
            addressId: addressId,
          },
        });

        // 4. 检查后端返回结果
        if (res.statusCode === 200 && res.data && res.data.code === 0) {
          const order = res.data.data;
          uni.showToast({
            title: '下单成功',
            icon: 'success',
            duration: 1500,
          });

          // 5. 下单成功后，跳转到订单确认页面
          setTimeout(() => {
            uni.navigateTo({
              url: `/pages/OrderConfirmation/OrderConfirmation?orderId=${order.orderId}`,
            });
          }, 1500);
        } else {
          throw new Error(res.data.message || '下单失败');
        }
      } catch (e) {
        uni.showToast({ title: e.message || '网络请求异常', icon: 'none' });
      }
    },
    // 2. 重构 fetchCartList 方法以处理分页
    async fetchCartList(loadMore = false) {
      // 如果正在加载或没有更多数据了，则直接返回
      if (this.isLoading || !this.hasMore) {
        return;
      }

      this.isLoading = true;

      try {
        const res = await uni.request({
          url: `${apiConfig.BASE_URL}/shoppingCart/getProduct`,
          method: 'GET',
          data: {
            page: this.page,
            pageSize: this.pageSize,
          },
        });

        if (res.statusCode === 200 && res.data && res.data.code === 0 && Array.isArray(res.data.data)) {
          const newItems = res.data.data.map(item => ({
            id: item.id,
            image: item.imageUrl,
            color: item.colorName,
            size: item.sizeName,
            price: item.price,
            quantity: item.quantity,
            productName: item.productName,
            selected: true,
          }));

          // 如果是加载更多，则追加数据；否则，直接替换
          this.cartList = loadMore ? [...this.cartList, ...newItems] : newItems;
          
          // 判断是否还有更多数据
          this.hasMore = newItems.length === this.pageSize;
          
          // 如果还有数据，页码+1
          if (this.hasMore) {
            this.page++;
          }

        } else {
          throw new Error(res.data.message || '加载购物车失败');
        }
      } catch (e) {
        uni.showToast({ title: e.message || '网络请求异常', icon: 'none' });
      } finally {
        this.isLoading = false;
      }
    },
    // 3. 新增：重置并重新加载数据的方法
    async refresh() {
        this.page = 1;
        this.cartList = [];
        this.hasMore = true;
        await this.fetchCartList();
    },
  },
  // 4. 使用 onShow 生命周期钩子，确保每次进入页面都刷新数据
  onShow() {
    this.refresh();
  },
  // 5. 新增：页面滚动到底部时触发
  onReachBottom() {
    console.log('触底，加载下一页');
    this.fetchCartList(true); // 传入 true 表示加载更多
  },
  // 6. 新增：下拉刷新时触发
  onPullDownRefresh() {
    this.refresh().then(() => {
        uni.stopPullDownRefresh(); // 结束下拉刷新动画
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