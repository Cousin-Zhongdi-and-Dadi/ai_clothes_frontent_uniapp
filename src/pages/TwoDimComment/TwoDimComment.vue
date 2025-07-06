<template>
  <view class="container">
    <view class="chat-title">客服会话</view>
    <view class="image-placeholder"></view>
    <view class="desc-box">
      你需要选择两个性别和目标。我建议你可以尝试一下衣橱体验的效果：<br />
      1.牛仔夹克+休闲长裤或长裙可以同时，适合各种场合，也可以在穿搭体验区找到类似的风格，搭配T恤或者印花卫衣。<br />
      2.在选择搭配时，加入一些单品的变化，常常会带来意想不到的惊喜。可以根据搭配的目的自行调整穿搭的正式化。
    </view>
    <button
      class="btn btn-grey"
      disabled
    >重新搭配</button>
    <button class="btn btn-primary">收藏穿搭</button>
  </view>
</template>

<script setup>
// 这里可以添加交互逻辑
</script>

<style scoped>
.container {
  background: #fafafa;
  min-height: 100vh;
  padding: 0 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.chat-title {
  font-size: 17px;
  font-weight: 500;
  text-align: center;
  margin-top: 16px;
  margin-bottom: 16px;
  color: #222;
}
.image-placeholder {
  width: 220px;
  height: 280px;
  background: #6c63ff;
  border-radius: 12px;
  margin-bottom: 16px;
}
.desc-box {
  background: #fff;
  border-radius: 10px;
  padding: 12px 10px;
  font-size: 13px;
  color: #222;
  margin-bottom: 24px;
  line-height: 1.6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  width: 100%;
  max-width: 260px;
}
.btn {
  width: 100%;
  max-width: 260px;
  height: 40px;
  border-radius: 8px;
  font-size: 15px;
  margin-bottom: 12px;
  border: none;
}
.btn-grey {
  background: #e5e5e5;
  color: #aaa;
}
.btn-primary {
  background: #6c63ff;
  color: #fff;
  margin-bottom: 0;
}
</style>