<template>
  <view class="favourite-container">
    <view class="favourite-list">
      <view
        class="favourite-row"
        v-for="(row, rowIndex) in rows"
        :key="rowIndex"
      >
        <view
          class="favourite-item"
          v-for="(item, colIndex) in row"
          :key="colIndex"
        >
          <image
            :src="item.img"
            mode="aspectFill"
            class="favourite-img"
          />
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'Favourite',
  data() {
    return {
      // 示例图片数据
      images: [
        { img: '/static/example_pictures/sample1.png' },
        { img: '/static/example_pictures/sample2.png' },
        { img: '/static/example_pictures/sample3.png' },
        { img: '/static/example_pictures/sample4.png' },
        { img: '/static/example_pictures/sample5.png' },
        { img: '/static/example_pictures/sample1.png' },
        { img: '/static/example_pictures/sample2.png' },
        { img: '/static/example_pictures/sample3.png' },
        { img: '/static/example_pictures/sample4.png' }
      ]
    };
  },
  computed: {
    rows() {
      // 将图片数组按每行3个进行分组
      const result = [];
      const arr = this.images;
      for (let i = 0; i < arr.length; i += 3) {
        result.push(arr.slice(i, i + 3));
      }
      return result;
    }
  }
};
</script>

<style scoped>
.favourite-container {
  background: #fafafa;
  min-height: 100vh;
  padding: 16rpx;
}
.favourite-list {
  margin-top: 16rpx;
}
.favourite-row {
  display: flex;
  flex-direction: row;
  justify-content: flex-start; /* 修改为左对齐 */
  gap: 12rpx; /* 使用 gap 添加间距 */
  margin-bottom: 12rpx;
}
.favourite-item {
  width: calc((100% - 24rpx) / 3);
  aspect-ratio: 1/1; /* 保持正方形 */
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.03);
}
.favourite-img {
  width: 100%;
  height: 100%;
  display: block;
}
</style>