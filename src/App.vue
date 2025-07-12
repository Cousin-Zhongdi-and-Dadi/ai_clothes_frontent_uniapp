<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
      console.log('运行环境:', process.env.UNI_PLATFORM);
      console.log('微信基础库版本:', wx.getSystemInfoSync().SDKVersion);
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
/*每个页面公共css */
</style>
