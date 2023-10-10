import { createApp } from "vue";
import "./styles.css";
import App from "./App.vue";
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'
import router from "./router/index";
import { store, key} from './store/index'

function useTable (app: any) {
    app.use(VXETable)
  }

createApp(App).use(store,key).use(router).use(useTable).mount("#app");
