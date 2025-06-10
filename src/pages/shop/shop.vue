<template>
  <view class="shop-page">
    <!-- 分类标签栏（可根据实际需求扩展） -->
    <view class="shop-tabs">
      <text class="tab active">推荐</text>
      <text class="tab">品牌</text>
      <text class="tab">男装</text>
      <text class="tab">女装</text>
      <text class="tab">上衣</text>
      <text class="tab">下装</text>
      <text class="tab">连体衣</text>
    </view>
    <!-- 商品流式两列布局 -->
    <view class="goods-list">
      <view
        class="goods-item"
        v-for="item in goods"
        :key="item.id"
      >
        <image
          :src="item.image"
          class="goods-image"
          mode="aspectFill"
        />
        <view class="goods-info">
          <text class="goods-name">{{ item.name }}</text>
          <text class="goods-desc">经典复古 时尚特物</text>
        </view>
        <text class="goods-price">￥{{ item.price }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ShopPage',
  data() {
    return {
      goods: [
        { id: 1, name: 'New Balance NB 530单层', price: 350, image: '/static/goods/goods1.png' },
        { id: 2, name: 'New Balance NB 530单层', price: 350, image: '/static/goods/goods2.png' },
        { id: 3, name: 'New Balance NB 530单层', price: 350, image: '/static/goods/goods3.png' },
        { id: 4, name: 'New Balance NB 530单层', price: 350, image: '/static/goods/goods1.png' },
        { id: 5, name: 'New Balance NB 530单层', price: 350, image: '/static/goods/goods2.png' },
        { id: 6, name: 'New Balance NB 530单层', price: 350, image: '/static/goods/goods3.png' }
      ]
    };
  }
};
</script>

<style scoped>
.shop-page {
  background: #fafafa;
  min-height: 100vh;
  padding-bottom: 120rpx;
}
.shop-header {
  padding: 30rpx 0 10rpx 0;
  text-align: center;
  background: #fff;
}
.shop-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #222;
}
.shop-tabs {
  display: flex;
  flex-direction: row;
  background: #fff;
  padding: 0 20rpx;
  border-bottom: 1rpx solid #eee;
  overflow-x: auto;
}
.tab {
  font-size: 28rpx;
  color: #999;
  margin-right: 32rpx;
  padding: 20rpx 0;
}
.tab.active {
  color: #6753e7;
  font-weight: bold;
  border-bottom: 4rpx solid #6753e7;
}
.goods-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 20rpx 20rpx 0 20rpx;
}
.goods-item {
  width: 47%;
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 20rpx;
}
.goods-image {
  width: 100%;
  height: 240rpx;
  border-radius: 16rpx 16rpx 0 0;
  object-fit: cover;
}
.goods-info {
  width: 90%;
  margin: 16rpx 0 0 0;
}
.goods-name {
  font-size: 26rpx;
  color: #222;
  font-weight: 500;
  display: block;
}
.goods-desc {
  font-size: 22rpx;
  color: #888;
  margin-top: 4rpx;
  display: block;
}
.goods-price {
  color: #6753e7;
  font-size: 28rpx;
  font-weight: bold;
  margin-top: 12rpx;
}
</style>