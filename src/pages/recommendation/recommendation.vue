<template>
  <view class="container">
    <customer_service />
    <!-- 渲染多个 display_card -->
    <view
      class="card-stack"
      ref="cardStack"
    >
      <display_card
        v-for="(card, index) in cards"
        :key="index"
        :ref="`card-${index}`"
        class="display_card"
        :frontImage="card.frontImage"
        :backText="card.backText"
        :style="getCardStyle(index)"
        :canInteract="index === 0"
        @swipeLeft="handleSwipeLeft(index)"
        @swipeRight="handleSwipeRight(index)"
        @click="handleCardClick(index)"
      />
      <view
        v-if="cards.length === 0"
        class="no-cards"
      >
        <text>看完啦</text>
      </view>
    </view>
  </view>
</template>

<script>
import Customer_service from '../../components/CustomerService/CustomerService.vue';
import display_card from '../../components/DisplayCard/DisplayCard.vue';

export default {
  components: { display_card, Customer_service },
  name: 'Recommendation',
  data() {
    return {
      cards: [
        {
          frontImage: '/static/example_pictures/sample1.png',
          backText: '这是第一张卡片的背面内容'
        },
        {
          frontImage: '/static/example_pictures/sample2.png',
          backText: '这是第二张卡片的背面内容'
        },
        {
          frontImage: '/static/example_pictures/sample3.png',
          backText: '这是第三张卡片的背面内容'
        },
        {
          frontImage: '/static/example_pictures/sample4.png',
          backText: '这是第四张卡片的背面内容'
        },
        {
          frontImage: '/static/example_pictures/sample5.png',
          backText: '这是第五张卡片的背面内容'
        }
      ]
    };
  },
  methods: {
    getCardStyle(index) {
      return {
        top: `${index * 100}rpx`,
        zIndex: this.cards.length - index
      };
    },
    handleSwipeLeft(index) {
      if (index === 0) {
        console.log('喜欢当前卡片');
        this.cards.shift();
        this.resetCardPosition();
      }
    },
    handleSwipeRight(index) {
      if (index === 0) {
        console.log('不喜欢当前卡片');
        this.cards.shift();
        this.resetCardPosition();
      }
    },
    resetCardPosition() {
      // 获取 ref 数组（可能包含多个元素）
      const refName = `card-0`;
      const cardRefs = this.$refs[refName];
      
      // 确保存在有效的引用
      if (cardRefs && cardRefs.length > 0) {
        // 取数组中的第一个元素（实际组件实例）
        const nextCardRef = cardRefs[0];
        console.log('nextCardRef:', nextCardRef);
        
        nextCardRef.isSwiping = false;
        nextCardRef.swipedLeft = false;
        nextCardRef.swipedRight = false;
        nextCardRef.isFlipped = false; // 重置翻转状态
        nextCardRef.transformX = 0; // 重置横向位移
      }
    },
    handleCardClick(index) {
      if (index === 0) {
        console.log('点击翻转卡片');
        // 触发翻转逻辑
      }
    }
  }
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center; /* 水平方向居中 */
  justify-content: center; /* 垂直方向居中 */
  padding: 20rpx;
  width: 100%;
  box-sizing: border-box;
}

.card-stack {
  position: relative;
  width: 100%; /* 确保容器宽度占满 */
  display: flex;
  flex-direction: column;
  align-items: center; /* 水平方向居中 */
  justify-content: center; /* 垂直方向居中 */
}

.display_card {
  position: absolute;
  width: 100%;
  max-width: 600rpx;
  transform: translateX(0); /* 确保初始位置为 0 */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.no-cards {
  width: 100%;
  text-align: center;
  margin-top: 200rpx;
  color: #666;
}
</style>