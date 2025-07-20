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
import request from '../../utils/request.js';
import apiConfig from '@/utils/api.js';
import BodyDataEdit from '../../components/BodyDataEdit/BodyDataEdit.vue';

/**
 * UserInfo page
 * Displays and edits user profile, body data, avatar, and navigation to history/favorites.
 */
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
    
  },
  mounted() {
    
                this.getUserInfo(); 
      },
  onShow() {
    
                if (uni.getStorageSync('token')) {
          }
      },
  methods: {
        percentageWidth(min, max, value) {
            const numValue = Number(value);
      if (isNaN(numValue) || numValue <= min) {
        return 0;
      }
      if (numValue >= max) {
        return 100;
      }
            if (max === min) {
        return 0;
      }
      return ((numValue - min) / (max - min)) * 100;
    },
    
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

                this.userName = userData.username;
        this.userAvatar = userData.avatarUrl || '/static/logo.png';
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
        
      } catch (error) {
        console.error("getUserInfo failed:", error);
              }
    },

        async submitUsernameEdit() {
      if (!this.newUserName.trim()) {
        uni.showToast({ title: '昵称不能为空', icon: 'none' });
        return;
      }
      uni.showLoading({ title: '正在保存...' });
    /**
     * Calculate percentage width for progress bars
     */
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
    /**
     * Fetch user info from backend
     */
      } finally {
        uni.hideLoading();
      }
    },

        async changeAvatar() {
      try {
        const chooseRes = await uni.chooseImage({ count: 1, sourceType: ['album', 'camera'] });
        const tempFilePath = chooseRes.tempFilePaths[0];
        
        uni.showLoading({ title: '正在上传...' });

        const uploadRes = await uni.uploadFile({
          url: `${apiConfig.BASE_URL}/user/uploadAvatar`,           filePath: tempFilePath,
          name: 'file',
          header: { 'Authorization': `Bearer ${uni.getStorageSync('token')}` },
        });

                const responseData = JSON.parse(uploadRes.data);
        
                if (responseData.code === 200) {
          this.userAvatar = responseData.data.avatarUrl;           uni.showToast({ title: '头像更换成功', icon: 'success' });
        } else {
                    uni.showToast({ title: responseData.message || '上传失败', icon: 'none' });
        }

    /**
     * Submit username edit to backend
     */
      } catch (error) {
                
      } finally {
        uni.hideLoading();
      }
    },

        async logout() {
      try {
        const res = await uni.showModal({ title: '提示', content: '确定要退出登录吗？' });
        
                        let modalResult;
        if (Array.isArray(res)) {
                    modalResult = res[1];
        } else {
                    modalResult = res;
        }
        
        if (modalResult && modalResult.confirm) {
                    uni.removeStorageSync('token');
          
    /**
     * Change user avatar by uploading image
     */
                    this.$emit('logged-out');
        }
              } catch (error) {
        console.error("Logout failed:", error);
        uni.showToast({ title: '退出失败，请稍后再试', icon: 'none' });
      }
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
        itemList: ['更换头像', '修改昵称', '退出登录'],
        success: (res) => {
          if (res.tapIndex === 0) this.changeAvatar();
          else if (res.tapIndex === 1) this.showUsernameEdit();
          else if (res.tapIndex === 2) this.logout();
        }
      });
    /**
     * Logout user and emit event
     */
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
                const apiData = {
          height: editedData.height,
          weight: editedData.weight,
          gender: editedData.gender,
    /**
     * Handle selection panel navigation
     */
          bust: editedData.bust,
          waist: editedData.waist,
          hips: editedData.hip,
          shoulderWidth: editedData.shoulder,
          armLength: editedData.arm,
          legLength: editedData.leg,
          neckCircumference: editedData.neck,
    /**
     * Show action menu for avatar, nickname, logout
     */
        };

                await request({
          url: `${apiConfig.BASE_URL}/user/updateBodyData`,           method: 'POST',
          data: apiData
        });

                this.userHeight = editedData.height;
        this.userWeight = editedData.weight;
        this.userGender = editedData.gender;
    /**
     * Show body data edit popup
     */
        this.userBust = editedData.bust;
    /**
     * Close body data edit popup
     */
        this.userWaist = editedData.waist;
    /**
     * Show username edit popup
     */
        this.userHip = editedData.hip;
        this.userShoulder = editedData.shoulder;
        this.userArm = editedData.arm;
        this.userLeg = editedData.leg;
    /**
     * Close username edit popup
     */
        this.userNeck = editedData.neck;

                this.closeBodyDataEdit();
        uni.showToast({ title: '身材数据更新成功', icon: 'success' });
    /**
     * Submit body data edit to backend
     */

      } catch (error) {
        console.error("submitBodyDataEdit failed:", error);
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
  position: relative;
  left: 33.207rpx;
  top: 50rpx;
  width: 239.946rpx;
  height: 87.754rpx;
  opacity: 1;
}

.user_avatar {
  position: absolute;
  left: 0rpx;
  top: 0rpx;
  width: 87.754rpx;
  height: 87.754rpx;
  border-radius: 43.877rpx;
  /**
     * Show error message from child component
     */
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
  border-radius: 20rpx;
}

.selection_item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
  align-items: center;
  width: 80%;
  margin: 40rpx auto;
}

.explanation_text {
  font-size: 28rpx;
  color: #333;
  margin-right: 20rpx;
}

.percentage_bar_wrapper {
  flex: 1;
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
  border-radius: 20rpx;
  cursor: pointer;
}

.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99;
}

.popup-content {
  width: 90%;
  max-width: 600rpx;
  padding: 40rpx;
  background-color: #fff;
  border-radius: 20rpx;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

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

  height: 80rpx;
  line-height: 80rpx;
  padding: 0 20rpx;
}

.popup-button {
  margin-top: 40rpx;
  background-color: #6753e7;
  color: #fff;
  border-radius: 50rpx;
}
</style>
