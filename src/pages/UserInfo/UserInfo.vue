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

<script>
// 1. 导入封装的 request 函数和 apiConfig
import request from '../../utils/request.js';
import apiConfig from '@/utils/api.js';
import BodyDataEdit from '../../components/BodyDataEdit/BodyDataEdit.vue';

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
        { icon: '/static/icon/微信图片_20250330204810.png', text: '浏览历史' },
        { icon: '/static/icon/微信图片_20250330204813.png', text: '收藏穿搭' }
      ]
    };
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
  },
  created() {
    // console.log('UserInfo.vue created');
  },
  mounted() {
    // console.log('UserInfo.vue mounted');
    // --- 开始修改：将数据获取逻辑移回到 mounted ---
    // 当组件被 v-if 渲染并挂载到页面上时，mounted 会被调用。
    // 这是获取初始数据的正确时机。
    this.getUserInfo(); 
    // --- 结束修改 ---
  },
  onShow() {
    // console.log('UserInfo.vue onShow');
    // --- 开始修改：可以保留 onShow 用于页面切换时的数据刷新 ---
    // 比如用户修改了信息从其他页面返回时，可以在这里重新获取数据保证同步
    // 但首次加载必须依赖 mounted
    if (uni.getStorageSync('token')) {
      // this.getUserInfo(); // 首次加载的调用已移至 mounted
    }
    // --- 结束修改 ---
  },
  methods: {
    // --- 开始修改：新增缺失的辅助函数 ---
    percentageWidth(min, max, value) {
      // 确保 value 是一个有效的数字
      const numValue = Number(value);
      if (isNaN(numValue) || numValue <= min) {
        return 0;
      }
      if (numValue >= max) {
        return 100;
      }
      // 避免除以零
      if (max === min) {
        return 0;
      }
      return ((numValue - min) / (max - min)) * 100;
    },
    // --- 结束修改 ---

    // 3. 改造 getUserInfo 方法
    async getUserInfo() {
      try {
        const userData = await request({
          url: `${apiConfig.BASE_URL}/user/getUserInfo`,
          method: 'GET',
        });

        if (!userData) {
          uni.showToast({ title: '无法加载用户信息', icon: 'none' });
          return;
        }

        // --- 开始修改：根据API报文格式，更新所有字段的赋值 ---
        this.userName = userData.username;
        this.userAvatar = userData.avatarUrl || '/static/logo.png';
        this.userGender = userData.gender;
        this.userHeight = userData.height;
        this.userWeight = userData.weight;
        this.userBust = userData.bust;
        this.userWaist = userData.waist;
        // API返回的是 hips，组件使用的是 userHip
        this.userHip = userData.hips; 
        // API返回的是 shoulderWidth，组件使用的是 userShoulder
        this.userShoulder = userData.shoulderWidth; 
        // API返回的是 armLength，组件使用的是 userArm
        this.userArm = userData.armLength; 
        // API返回的是 legLength，组件使用的是 userLeg
        this.userLeg = userData.legLength; 
        // API返回的是 neckCircumference，组件使用的是 userNeck
        this.userNeck = userData.neckCircumference; 
        // --- 结束修改 ---

      } catch (error) {
        console.error("getUserInfo failed:", error);
        // 错误提示已由 request 函数统一处理
      }
    },

    // 4. 改造 submitUsernameEdit 方法
    async submitUsernameEdit() {
      if (!this.newUserName.trim()) {
        uni.showToast({ title: '昵称不能为空', icon: 'none' });
        return;
      }
      uni.showLoading({ title: '正在保存...' });
      try {
        await request({
          url: `${apiConfig.BASE_URL}/user/updateUsername`,
          method: 'POST',
          data: { username: this.newUserName }
        });
        
        this.userName = this.newUserName;
        this.closeUsernameEdit();
        uni.showToast({ title: '昵称修改成功', icon: 'success' });

      } catch (error) {
        console.error("submitUsernameEdit failed:", error);
      } finally {
        uni.hideLoading();
      }
    },

    // 5. 改造 changeAvatar 方法
    async changeAvatar() {
      try {
        const chooseRes = await uni.chooseImage({ count: 1, sourceType: ['album', 'camera'] });
        const tempFilePath = chooseRes.tempFilePaths[0];
        
        uni.showLoading({ title: '正在上传...' });

        const uploadRes = await uni.uploadFile({
          url: `${apiConfig.BASE_URL}/user/uploadAvatar`, // 假设的上传头像API
          filePath: tempFilePath,
          name: 'file',
          header: { 'Authorization': `Bearer ${uni.getStorageSync('token')}` },
        });

        // uni.uploadFile 返回的是字符串，需要解析
        const responseData = JSON.parse(uploadRes.data);
        
        // 判断业务 code
        if (responseData.code === 200) {
          this.userAvatar = responseData.data.avatarUrl; // 更新为新头像URL
          uni.showToast({ title: '头像更换成功', icon: 'success' });
        } else {
          // 手动处理上传接口的业务失败
          uni.showToast({ title: responseData.message || '上传失败', icon: 'none' });
        }

      } catch (error) {
        // uni.chooseImage 用户取消等情况会进入这里
        console.log("Avatar selection/upload cancelled or failed:", error);
      } finally {
        uni.hideLoading();
      }
    },

    // 6. 改造 logout 方法
    async logout() {
      try {
        const res = await uni.showModal({ title: '提示', content: '确定要退出登录吗？' });
        
        // --- 开始修改：兼容不同的返回值格式 ---
        // 处理可能的数组格式返回值
        let modalResult;
        if (Array.isArray(res)) {
          // 如果返回的是数组格式 [error, result]
          modalResult = res[1];
        } else {
          // 如果返回的是直接的对象格式
          modalResult = res;
        }
        
        if (modalResult && modalResult.confirm) {
          // 1. 清除本地的 token
          uni.removeStorageSync('token');
          
          // 2. 发出一个 'logged-out' 事件，通知父组件（UserInfoEntry）状态已改变
          this.$emit('logged-out');
        }
        // --- 结束修改 ---
      } catch (error) {
        console.error("Logout failed:", error);
        uni.showToast({ title: '退出失败，请稍后再试', icon: 'none' });
      }
    },

    // 7. 其他方法
    handleSelection(item) {
      if (item.text === '浏览历史') {
        uni.navigateTo({ url: '/pages/History/History' });
      } else if (item.text === '收藏穿搭') {
        uni.navigateTo({ url: '/pages/Favourite/Favourite' });
      }
    },
    showActionMenu() {
      uni.showActionSheet({
        itemList: ['更换头像', '修改昵称', '退出登录'],
        success: (res) => {
          if (res.tapIndex === 0) this.changeAvatar();
          else if (res.tapIndex === 1) this.showUsernameEdit();
          else if (res.tapIndex === 2) this.logout();
        }
      });
    },
    showBodyDataEdit() { this.isBodyDataEditVisible = true; },
    closeBodyDataEdit() { this.isBodyDataEditVisible = false; },
    showUsernameEdit() {
      this.newUserName = this.userName;
      this.isUsernameEditVisible = true;
    },
    closeUsernameEdit() {
      this.isUsernameEditVisible = false;
      this.newUserName = '';
    },
    async submitBodyDataEdit(editedData) {
      uni.showLoading({ title: '正在保存...' });
      try {
        // 1. 构建API请求所需的数据结构，注意字段映射
        const apiData = {
          height: editedData.height,
          weight: editedData.weight,
          gender: editedData.gender,
          bust: editedData.bust,
          waist: editedData.waist,
          hips: editedData.hip,
          shoulderWidth: editedData.shoulder,
          armLength: editedData.arm,
          legLength: editedData.leg,
          neckCircumference: editedData.neck,
        };

        // 2. 发送POST请求到更新身材数据的接口
        await request({
          url: `${apiConfig.BASE_URL}/user/updateBodyData`, // 假设的API端点
          method: 'POST',
          data: apiData
        });

        // 3. 请求成功后，更新本地数据
        this.userHeight = editedData.height;
        this.userWeight = editedData.weight;
        this.userGender = editedData.gender;
        this.userBust = editedData.bust;
        this.userWaist = editedData.waist;
        this.userHip = editedData.hip;
        this.userShoulder = editedData.shoulder;
        this.userArm = editedData.arm;
        this.userLeg = editedData.leg;
        this.userNeck = editedData.neck;

        // 4. 关闭弹窗并提示成功
        this.closeBodyDataEdit();
        uni.showToast({ title: '身材数据更新成功', icon: 'success' });

      } catch (error) {
        console.error("submitBodyDataEdit failed:", error);
        // 错误提示已由 request 函数统一处理
      } finally {
        uni.hideLoading();
      }
    },
    showError(error) {
      // ...
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
  width: 300rpx;
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
