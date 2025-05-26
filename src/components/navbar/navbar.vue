<template>
  <view class="navbar">
    <view class="navbar-item" v-for="(item, index) in navItems" :key="index">
      <image :src="item.icon" class="navbar-icon" />
      <text class="navbar-text">{{ item.text }}</text>
    </view>
  </view>
</template>

<script>
export default {
  name: "Navbar",
  data() {
    return {
      navItems: [
        { icon: '/static/icon/icon-09.png', text: '每日推荐' },
        { icon: '/static/icon/icon-01.png', text: '我的衣橱' },
        { icon: '/static/icon/icon-03.png', text: '试衣搭配' },
        { icon: '/static/icon/icon-05.png', text: '购物商城' },
        { icon: '/static/icon/icon-07.png', text: '个人中心' }
      ]
    }
  }
}
</script>

<style scoped>
.navbar {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100vw;
  z-index: 999;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  background: #fff;
  height: 100rpx;
  border-top: 1px solid #eee;
}
.navbar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}
.navbar-icon {
  width: 40rpx;
  height: 40rpx;
  margin-bottom: 8rpx;
}
.navbar-text {
  font-size: 22rpx;
  color: #333;
}
</style>