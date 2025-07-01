<template>
  <view>
    <web-view :src="url"></web-view>
  </view>
</template>

<script>
export default {
    name: 'ThreeDimDisplay',
    data() {
        return {
            // 在这里替换成你想要显示的网页地址
            url: 'https://cloud.style3d.com/cd/product/2457242?share_state_id=83518&func=resproduct&is_share_page=1' 
        };
    },
    methods: {
        // Add your methods here
    }
};
</script>

<style scoped>
/* Add your styles here */
</style>