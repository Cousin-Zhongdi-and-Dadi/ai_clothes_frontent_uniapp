<template>
  <view class="content">
    <!-- BodyDataEdit 弹窗 -->
    <view
      v-if="isBodyDataEditVisible"
      class="popup-overlay"
      @click="closeBodyDataEdit"
    >
      <!-- 修改：将 .popup-content 样式应用到这个容器上 -->
      <view
        class="popup-content"
        @click.stop
      >
        <BodyDataEdit
          ref="bodyDataEdit"
          :initial-data="currentUserData"
          @success="submitBodyDataEdit"
          @failed="(error) => showError(error)"
        />
      </view>
    </view>

    <!-- 新增：修改昵称弹窗 -->
    <view
      v-if="isUsernameEditVisible"
      class="popup-overlay"
      @click="closeUsernameEdit"
    >
      <view
        class="popup-content"
        @click.stop
      >
        <text class="popup-title">修改昵称</text>
        <input
          class="popup-input"
          v-model="newUserName"
          placeholder="请输入新的昵称"
        />
        <button
          class="popup-button"
          @click="submitUsernameEdit"
        >确定</button>
      </view>
    </view>

    <!-- 修改：将点击事件移到这个容器上 -->
    <view
      class="user_info_row"
      @click="showActionMenu"
    >
      <image
        class="user_avatar"
        :src="userAvatar"
        alt=""
      />
      <text class="user_name">{{ userName }}</text>
    </view>
    <view class="selection_panel">
      <view
        class="selection_item"
        v-for="(item, index) in selectionItems"
        :key="index"
        @click="handleSelection(item)"
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
  </view>
</template>

<script scoped>
import BodyDataEdit from '../../components/BodyDataEdit/BodyDataEdit.vue';
import apiConfig from '@/utils/api.js';

export default {
  components: { BodyDataEdit },
  name: 'UserInfo',
  data() {
    return {
      isBodyDataEditVisible: false,
      isUsernameEditVisible: false,
      userName: '用户昵称',
      newUserName: '',
      userAvatar: '/static/logo.png',
      userGender: 'female',
      userHeight: 0,
      userWeight: 0,
      userBust: 0,
      userWaist: 0,
      userHip: 0,
      userShoulder: 0,
      userArm: 0,
      userLeg: 0,
      userNeck: 0,
      selectionItems: [
        { icon: '/static/icon/微信图片_20250330204817.png', text: '我的订单' },
        { icon: '/static/icon/微信图片_20250330204810.png', text: '浏览历史' },
        { icon: '/static/icon/微信图片_20250330204813.png', text: '收藏穿搭' }
      ]
    };
  },
  // 修改：移除 onShow 钩子，将获取数据的逻辑移到 mounted 或者由父组件调用
  mounted() {
    this.getUserInfo();
  },
  methods: {
    // 新增：获取用户信息的核心方法
    getUserInfo() {
      const token = uni.getStorageSync('token');
      // 注意：这里的 token 检查可以保留，作为最后一道防线，但不再执行跳转
      if (!token) {
        console.error("UserInfo component loaded without a token.");
        return;
      }

      uni.request({
        url: `${apiConfig.BASE_URL}/user/getUserInfo`, // 假设的获取用户信息API
        method: 'GET',
        header: {
          'Authorization': `Bearer ${token}` // 在请求头中携带token
        },
        success: (res) => {
          // 1. 无论成功失败，都先打印出从服务器收到的原始响应
          console.log('服务器响应:', res);

          // 2. 恢复并使用严格的成功判断条件
          if (res.data && res.data.code === 0) {
            const userData = res.data.data;

            // 3. 增加一个对 userData 存在的检查，防止后续代码因数据为空而出错
            if (!userData) {
              console.error('获取用户信息失败: res.data.data 为空');
              this.showError('返回的用户数据为空');
              return;
            }

            // 更新所有用户信息
            this.userName = userData.username;
            this.userAvatar = userData.avatarUrl;
            this.userGender = userData.gender;
            this.userHeight = userData.height;
            this.userWeight = userData.weight;
            this.userBust = userData.bust;
            this.userWaist = userData.waist;
            this.userHip = userData.hips;
            this.userShoulder = userData.shoulderWidth;
            this.userArm = userData.armLength;
            this.userLeg = userData.legLength;
            this.userNeck = userData.neckCircumference;

            console.log('获取用户信息成功:', userData);
          } else {
            // 明确打印出失败原因
            console.error('获取用户信息失败:', res.data);
            this.showError((res.data && res.data.message) || '获取用户信息失败');
          }
        },
        fail: (err) => {
          this.showError('网络错误，请稍后重试');
        }
      });
    },
    handleSelection(item) {
      if (item.text === '浏览历史') {
        uni.navigateTo({ url: '/pages/History/History' });
      } else if (item.text === '收藏穿搭') {
        uni.navigateTo({ url: '/pages/Favourite/Favourite' });
      }
    },
    showActionMenu() {
      uni.showActionSheet({
        itemList: ['修改头像', '修改昵称', '登出'],
        success: (res) => {
          switch (res.tapIndex) {
            case 0: this.changeAvatar(); break;
            case 1: this.showUsernameEdit(); break;
            case 2: this.logout(); break;
          }
        }
      });
    },
    logout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            uni.removeStorageSync('token');
            uni.reLaunch({ url: '/pages/LoginSelection/LoginSelection' });
          }
        }
      });
    },
    showBodyDataEdit() { this.isBodyDataEditVisible = true; },
    closeBodyDataEdit() { this.isBodyDataEditVisible = false; },
    showUsernameEdit() {
      this.newUserName = this.userName;
      this.isUsernameEditVisible = true;
    },
    closeUsernameEdit() { this.isUsernameEditVisible = false; },
    submitUsernameEdit() {
      const newName = this.newUserName.trim();
      if (!newName) {
        this.showError('昵称不能为空');
        return;
      }
      uni.showLoading({ title: '正在修改...' });
      uni.request({
        url: `${apiConfig.BASE_URL}/user/updateName?username=${encodeURIComponent(newName)}`,
        method: 'POST',
        header: { 'Authorization': `Bearer ${uni.getStorageSync('token')}` },
        success: (res) => {
          if (res.data && res.data.data === true) {
            uni.showToast({ title: '修改成功', icon: 'success' });
            this.closeUsernameEdit();
            this.getUserInfo(); // 修改成功后，重新获取所有信息
          } else {
            this.showError((res.data && res.data.message) || '修改失败');
          }
        },
        fail: () => this.showError('网络请求失败'),
        complete: () => uni.hideLoading()
      });
    },
    changeAvatar() {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          uni.showLoading({ title: '正在上传...' });
          uni.uploadFile({
            url: `${apiConfig.BASE_URL}/user/updateAvatar`,
            filePath: res.tempFilePaths[0],
            name: 'file',
            header: { 'Authorization': `Bearer ${uni.getStorageSync('token')}` },
            success: (uploadRes) => {
              const data = JSON.parse(uploadRes.data);
              if (data.code === 0) {
                uni.showToast({ title: '上传成功', icon: 'success' });
                this.getUserInfo(); // 上传成功后，重新获取所有信息
              } else {
                this.showError(data.message || '上传失败');
              }
            },
            fail: () => this.showError('上传失败'),
            complete: () => uni.hideLoading()
          });
        }
      });
    },
    submitBodyDataEdit(newData) {
      uni.showLoading({ title: '正在更新...' });
      uni.request({
        url: `${apiConfig.BASE_URL}/user/updateStature`,
        method: 'POST',
        header: { 'Authorization': `Bearer ${uni.getStorageSync('token')}` },
        data: {
          height: newData.height,
          weight: newData.weight,
          gender: newData.gender,
          bust: newData.bust,
          waist: newData.waist,
          hips: newData.hip,
          shoulderWidth: newData.shoulder,
          armLength: newData.arm,
          legLength: newData.leg,
          neckCircumference: newData.neck
        },
        success: (res) => {
          if (res.data && res.data.data === true) {
            uni.showToast({ title: '数据已更新', icon: 'success' });
            this.closeBodyDataEdit();
            this.getUserInfo(); // 更新成功后，重新获取所有信息
          } else {
            this.showError((res.data && res.data.message) || '更新失败');
          }
        },
        fail: () => this.showError('网络请求失败'),
        complete: () => uni.hideLoading()
      });
    },
    percentageWidth(min, max, value) {
      const clamped = Math.min(Math.max(value, min), max);
      return ((clamped - min) / (max - min)) * 100;
    },
    showError(error) {
      uni.showToast({ title: error, icon: 'none' });
    }
  },
  computed: {
    currentUserData() {
      return {
        height: this.userHeight,
        weight: this.userWeight,
        gender: this.userGender,
        bust: this.userBust,
        waist: this.userWaist,
        hip: this.userHip,
        shoulder: this.userShoulder,
        arm: this.userArm,
        leg: this.userLeg,
        neck: this.userNeck,
      };
    },
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
  background-color: rgba(0, 0, 0, 0.5); /* 半透明黑色遮罩 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99; /* 确保在最上层 */
}

.popup-content {
  width: 90%; /* 使用百分比宽度，适应不同屏幕 */
  max-width: 600rpx; /* 限制最大宽度 */
  padding: 40rpx; /* 增加内边距 */
  background-color: #fff; /* 明确的白色背景 */
  border-radius: 20rpx; /* 圆角 */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  box-sizing: border-box; /* 确保padding不会撑大宽度 */
}

/* 新增：弹窗内部通用样式 */
.popup-title {
  font-size: 32rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 40rpx;
  display: block;
}

.popup-input {
  border: 1rpx solid #ddd;
  border-radius: 10rpx;
  font-size: 28rpx;
  width: 100%;
  box-sizing: border-box;
  text-align: left;

  /* --- 修改开始 --- */
  height: 80rpx; /* 1. 恢复并固定一个明确的高度 */
  line-height: 80rpx; /* 2. 强制行高等于高度，实现垂直居中 */
  padding: 0 20rpx; /* 3. 重新设置内边距，垂直为0，水平为20rpx */
  /* --- 修改结束 --- */
}

.popup-button {
  margin-top: 40rpx;
  background-color: #6753e7;
  color: #fff;
  border-radius: 50rpx;
}
</style>
