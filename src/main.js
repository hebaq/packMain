import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import {
  Button,
  Input,
  Form,
  FormItem,
  Icon,
  Card,
  Message,
  Switch,
  Row,
  Col,
} from 'element-ui';

const ws = process.env.NODE_ENV === `development` ? `ws://127.0.0.1:7788` : undefined

Vue.config.productionTip = false

Vue.use(Button).use(Input).use(Form).use(FormItem).use(Icon).use(Card).use(Switch).use(Row).use(Col)
Vue.prototype.$message = Message;

if(window.Sys) {
  new Sys(ws)
    .then(async (main) => {
      console.log(`sys 初始化完成`)
      main.form.show()
      window.main = main
      window.win = main.win
      window.vm = new Vue({
        router,
        store,
        render: (h) => h(App),
      }).$mount(`#app`)
    })
    .catch((err) => {
      console.log(err)
    })
} else {
  console.error(`请在 main.exe 中加载页面`)
}

