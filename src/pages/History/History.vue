<template>
  <view class="history-page">
    <view
      v-for="(group, date) in groupedHistory"
      :key="date"
      class="date-group"
    >
      <view class="date-title">{{ date }}</view>
      <view
        v-for="(row, rowIndex) in group"
        :key="rowIndex"
        class="image-row"
      >
        <view
          v-for="(img, imgIndex) in row"
          :key="imgIndex"
          class="image-cell"
        >
          <image
            :src="img"
            mode="aspectFill"
            class="history-image"
          />
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
    name: "History",
    data() {
        return {
            // 示例数据，实际应从后端获取
            historyList: [
                {
                    date: "2024-12-26",
                    images: [
                        "/static/example_pictures/sample1.png",
                        "/static/example_pictures/sample2.png",
                        "/static/example_pictures/sample3.png",
                        "/static/example_pictures/sample4.png",
                        "/static/example_pictures/sample5.png",
                    ],
                },
                {
                    date: "2024-12-25",
                    images: [
                        "/static/example_pictures/sample1.png",
                        "/static/example_pictures/sample2.png",
                        "/static/example_pictures/sample3.png",
                        "/static/example_pictures/sample4.png",
                        "/static/example_pictures/sample1.png",
                        "/static/example_pictures/sample2.png",
                        "/static/example_pictures/sample3.png",
                        "/static/example_pictures/sample4.png",
                    ],
                },
                {
                    date: "2024-12-24",
                    images: [
                        "/static/example_pictures/sample1.png",
                        "/static/example_pictures/sample2.png",
                        "/static/example_pictures/sample3.png",
                        "/static/example_pictures/sample4.png",
                        "/static/example_pictures/sample1.png",
                        "/static/example_pictures/sample2.png",
                        "/static/example_pictures/sample3.png",
                        "/static/example_pictures/sample4.png",
                    ],
                },
            ],
        };
    },
    computed: {
        groupedHistory() {
            // 将每个日期下的图片按3个一组分行
            const result = {};
            this.historyList.forEach((item) => {
                const rows = [];
                for (let i = 0; i < item.images.length; i += 3) {
                    rows.push(item.images.slice(i, i + 3));
                }
                result[item.date] = rows;
            });
            return result;
        },
    },
};
</script>

<style scoped>
.history-page {
  padding: 0 16rpx;
  background: #fafbfc;
}
.date-group {
  margin-bottom: 32rpx;
}
.date-title {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin: 32rpx 0 16rpx 0;
}
.image-row {
  display: flex;
  flex-direction: row;
  justify-content: flex-start; /* 修改对齐方式为左对齐 */
  gap: 12rpx; /* 使用 gap 属性添加间距 */
  margin-bottom: 16rpx;
}
.image-cell {
  width: calc((100% - 24rpx) / 3);
  height: 0;
  padding-bottom: calc((100% - 24rpx) / 3);
  position: relative;
}
.image-cell:last-child {
  margin-right: 0;
}
.history-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 16rpx;
  background: #eee;
  display: block;
}
</style>