import App from './App'
import Vue from 'vue'
const Towxml = require('./wxcomponents/towxml/index.js');

Vue.prototype.$towxmlFun = Towxml

Vue.config.productionTip = false
App.mpType = 'app'

const app = new Vue({
    ...App
})
app.$mount()
