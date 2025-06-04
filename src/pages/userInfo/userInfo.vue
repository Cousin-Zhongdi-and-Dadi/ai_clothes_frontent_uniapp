<template>
  <view class="content">
    <!-- BodyDataEdit 弹窗 -->
    <view
      v-if="isBodyDataEditVisible"
      class="popup-overlay"
    >
      <BodyDataEdit
        ref="bodyDataEdit"
        class="popup-content"
        @signal="() => closeBodyDataEdit()"
      />
    </view>
    <view class="user_info_row">
      <image
        class="user_avatar"
        src="/static/logo.png"
        alt=""
      />
      <text class="user_name">{{ userName }}</text>
    </view>
    <view class="selection_panel">
      <view
        class="selection_item"
        v-for="(item, index) in selectionItems"
        :key="index"
      >
        <image
          :src="item.icon"
          class="selection_icon"
          mode="aspectFit"
        />
        <text class="selection_text">{{ item.text }}</text>
      </view>
    </view>
    <view
      class="user_data_panel"
      @click="showBodyDataEdit"
    >
      <view class="percentage_bar_container">
        <text class="explanation_text">身高</text>
        <view class="percentage_bar_wrapper">
          <view
            class="percentage_bar"
            :style="{ width: percentageWidths.height + '%' }"
          ></view>
        </view>
      </view>
      <view class="percentage_bar_container">
        <text class="explanation_text">体重</text>
        <view class="percentage_bar_wrapper">
          <view
            class="percentage_bar"
            :style="{ width: percentageWidths.weight + '%' }"
          ></view>
        </view>
      </view>
      <view class="percentage_bar_container">
        <text class="explanation_text">腰围</text>
        <view class="percentage_bar_wrapper">
          <view
            class="percentage_bar"
            :style="{ width: percentageWidths.waist + '%' }"
          ></view>
        </view>
      </view>
      <view class="percentage_bar_container">
        <text class="explanation_text">臀围</text>
        <view class="percentage_bar_wrapper">
          <view
            class="percentage_bar"
            :style="{ width: percentageWidths.hip + '%' }"
          ></view>
        </view>
      </view>
      <view class="percentage_bar_container">
        <text class="explanation_text">肩长</text>
        <view class="percentage_bar_wrapper">
          <view
            class="percentage_bar"
            :style="{ width: percentageWidths.shoulder + '%' }"
          ></view>
        </view>
      </view>
      <view class="percentage_bar_container">
        <text class="explanation_text">臂长</text>
        <view class="percentage_bar_wrapper">
          <view
            class="percentage_bar"
            :style="{ width: percentageWidths.arm + '%' }"
          ></view>
        </view>
      </view>
      <view class="percentage_bar_container">
        <text class="explanation_text">腿长</text>
        <view class="percentage_bar_wrapper">
          <view
            class="percentage_bar"
            :style="{ width: percentageWidths.leg + '%' }"
          ></view>
        </view>
      </view>
      <view class="percentage_bar_container">
        <text class="explanation_text">颈围</text>
        <view class="percentage_bar_wrapper">
          <view
            class="percentage_bar"
            :style="{ width: percentageWidths.neck + '%' }"
          ></view>
        </view>
      </view>
    </view>
    <navbar />
  </view>
</template>

<script scoped>
import BodyDataEdit from '../../components/body_data_edit/body_data_edit.vue';

export default {
    components: { BodyDataEdit },
    name: 'UserInfo',
  data() {
    return {
      isBodyDataEditVisible: false, // 控制 BodyDataEdit 显示状态
      userName: '用户昵称',
      userHeight: 170,
      userWeight: 60,
      userWaist: 70,
      userHip: 90,
      userShoulder: 40,
      userArm: 30,
      userLeg: 80,
      userNeck: 35,
      selectionItems: [
        { icon: '/static/icon/微信图片_20250330204817.png', text: '我的订单' },
        { icon: '/static/icon/微信图片_20250330204803.png', text: '地址管理' },
        { icon: '/static/icon/微信图片_20250330204810.png', text: '浏览历史' },
        { icon: '/static/icon/微信图片_20250330204813.png', text: '收藏穿搭' }
      ]
    };
  },
  methods: {
    showBodyDataEdit() {
      this.isBodyDataEditVisible = true; // 显示弹窗
    },
    closeBodyDataEdit() {
      this.isBodyDataEditVisible = false; // 关闭弹窗
    },
    percentageWidth(min, max, value) {
      const clamped = Math.min(Math.max(value, min), max);
      return ((clamped - min) / (max - min)) * 100;
    }
  },
  computed: {
    percentageWidths() {
      return {
        height: this.percentageWidth(140, 250, this.userHeight),
        weight: this.percentageWidth(30, 200, this.userWeight),
        waist: this.percentageWidth(10, 100, this.userWaist),
        hip: this.percentageWidth(10, 100, this.userHip),
        shoulder: this.percentageWidth(10, 100, this.userShoulder),
        arm: this.percentageWidth(10, 200, this.userArm),
        leg: this.percentageWidth(50, 150, this.userLeg),
        neck: this.percentageWidth(0, 50, this.userNeck),
      };
    }
  }
};
</script>

<style>
.content {
  display: flex;
  flex-direction: column;
  position: relative;
  background-color: rgba(247, 247, 247, 1);
}

.user_info_row {
  position: relative; /* 作为定位参考 */
  left: 33.207rpx;
  top: 50rpx;
  width: 239.946rpx;
  height: 87.754rpx;
  opacity: 1;
}

.user_avatar {
  position: absolute; /* 绝对定位，相对user_info_row */
  left: 0rpx;
  top: 0rpx;
  width: 87.754rpx;
  height: 87.754rpx;
  border-radius: 43.877rpx; /* 圆形头像 */
  opacity: 1;
  background: rgba(109, 109, 109, 1);
}

.user_name {
  position: absolute;
  left: 108.4rpx;
  top: 28.364rpx;
  width: 131.546rpx;
  height: 31.027rpx;
  opacity: 1;
}

.selection_panel {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: stretch;
  width: 700rpx;
  height: 169.347rpx;
  opacity: 1;
  padding: 20rpx 0;
  background: rgba(255, 255, 255, 1);
  margin-left: auto;
  margin-right: auto;
  margin-top: 100rpx;
  border-radius: 20rpx; /* 圆角 */
}

.selection_item {
  flex: 1;
  display: flex;
  flex-direction: column; /* 纵向排列 */
  align-items: center;
  justify-content: center;
  /* 可选：为每个item添加左右间距 */
}

.selection_icon {
  width: 48rpx;
}

.selection_text {
  font-size: 30rpx;
  color: #333;
  text-align: center;
}

.percentage_bar_container {
  display: flex;
  align-items: center; /* 垂直居中 */
  width: 80%;
  margin: 40rpx auto;
}

.explanation_text {
  font-size: 28rpx;
  color: #333;
  margin-right: 20rpx; /* 与百分比条的间距 */
}

.percentage_bar_wrapper {
  flex: 1; /* 百分比条占据剩余空间 */
  height: 40rpx;
  background-color: #f7f7f7;
  overflow: hidden;
}

.percentage_bar {
  height: 100%;
  background-color: #c4c4c4;
}

.user_data_panel {
  width: 650rpx;
  margin: 20rpx auto 40rpx auto;
  padding: 20rpx;
  background: #fff;
  border-radius: 20rpx; /* 圆角 */
  cursor: pointer; /* 鼠标指针样式，提示可点击 */
}

.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* 背景灰度 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* 确保浮于其他内容之上 */
}

.popup-content {
  padding: 20px;
  max-width: 400px;
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  z-index: 1001; /* 确保浮于遮罩层之上 */
}
</style>
