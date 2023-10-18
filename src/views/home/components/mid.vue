<script setup lang="ts">
import { ref } from "vue";
// import { invoke } from "@tauri-apps/api/tauri";
import { useRouter } from 'vue-router';
import { VxeFormInstance, VxeFormPropTypes, VxeFormEvents } from 'vxe-table'
import { useStore } from '@/store/index'
import { createDir, readTextFile, exists, BaseDirectory, writeBinaryFile } from '@tauri-apps/api/fs';

const store = useStore()
const router = useRouter();
// const greetMsg = ref("");
// const name = ref("");
// const tableData = ref([]);
// const gridOptions = ref({});

const setFile = async () => {
  const isFile = await exists(`everest`, { dir: BaseDirectory.Data })
  if (!isFile) {
    await createDir('everest', { dir: BaseDirectory.Data, recursive: true });
  }
}
setFile()

const readFile = async () => {
  const isFile = await exists(`data.json`, { dir: BaseDirectory.AppData })
  if (isFile) {
    let res: any = await readTextFile('data.json', { dir: BaseDirectory.AppData });
    console.log('readFile', res)
    let data = JSON.parse(res)
    console.log('data',data)
    store.state.userInfo = data.userInfo;
    store.state.tableData = data.tableData;
    if( data.userInfo){
      formData.value = data.userInfo
    }
    console.log('formData.value',formData.value)
  }
}
readFile()

const record: any = async () => {
  let res = {
    userInfo: formData.value,
    tableData: store.state.tableData
  }
  let data = JSON.stringify(res, undefined, 4);
  var blob = new Blob([data], { type: "text/json" });
  // await createDir('everest', { dir: BaseDirectory.AppData, recursive: true });
  // let aaa = await readTextFile('导出明细14519', { dir: BaseDirectory.AppData })
  let reader: any = new FileReader();
  // let blob = res.blob;
  reader.readAsArrayBuffer(blob);
  // 设置FileReader对象的onloadend属性
  reader.onloadend = async function () {
    // 在这里处理二进制数据
    var fileArray = new Uint8Array(reader.result);
    console.log('fileArray', fileArray);
    
    // const contents = await exists(`data.json`, { dir: BaseDirectory.AppData })
    // console.log('contents', contents)
    // if (contents) {
    // await removeFile(`data.json`, { dir: BaseDirectory.AppData });
    // }
    // await removeFile('导出明细-AxA.csv', { dir: BaseDirectory.Desktop });
    await writeBinaryFile({ path: `data.json`, contents: fileArray }, { dir: BaseDirectory.AppData });
  }
}

// async function greet() {
//   // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
//   greetMsg.value = await invoke("greet", { name: name.value });
// }
//
interface FormDataVO {
  unitName: string
  contacts: string
  phone: string
}

const formRef = ref<VxeFormInstance>()

const loading = ref(false)

const formData: any = ref<FormDataVO>({
  unitName: '',
  contacts: '',
  phone: ''
})


const formRules = ref<VxeFormPropTypes.Rules>({
  unitName: [
    { required: true, message: '请输入单位' }
  ],
  contacts: [
    { required: true, message: '请输入联系人' }
  ],
  phone: [
    { required: true, message: '请输入电话' }
  ]
})

const changeEvent = (params: any) => {
  const $form = formRef.value
  if ($form) {
    $form.updateStatus(params)
  }
}

const submitEvent: VxeFormEvents.Submit = () => {
  record()
  loading.value = true
  setTimeout(() => {
    loading.value = false
    // console.log('formData',formData.value)
    let data: any = formData.value
    store.state.userInfo = data;
    // console.log('setstore=>',store.state.userInfo)
    router.push({
      path: '/check',
      query: {},
    });
  }, 500)
}

const resetEvent: VxeFormEvents.Reset = () => {
  // VXETable.modal.message({ content: '重置事件', status: 'info' })
}
</script>

<template>
  <div
    style="display: flex;justify-content: center;flex-direction: column;align-items: center;height: calc(100% - 180px);">
    <div style="margin-bottom: 10px;">
      <h1>设备清点建账系统</h1>
      <h4>陕西省保密技术服务中心</h4>
    </div>
    <vxe-form
      style="width: 400px;height: 300px;border-radius: 8px;padding: 40px 50px 20px 50px;box-shadow: 0px 12px 20px 0px #4184F914;"
      title-colon ref="formRef" title-align="right" title-width="60" :data="formData" :rules="formRules"
      :loading="loading" @submit="submitEvent" @reset="resetEvent">
      <vxe-form-gather span="24">
        <vxe-form-item title="单位" field="unitName" span="24" :item-render="{}" title-overflow="title">
          <template #default="params">
            <vxe-input v-model="params.data.unitName" placeholder="请输入单位" clearable
              @change="changeEvent(params)"></vxe-input>
          </template>
        </vxe-form-item>
        <vxe-form-item title="联系人" field="contacts" span="24" :item-render="{}" title-overflow="title">
          <template #default="params">
            <vxe-input v-model="params.data.contacts" placeholder="请输入年龄" clearable
              @change="changeEvent(params)"></vxe-input>
          </template>
        </vxe-form-item>
        <vxe-form-item title="电话" field="phone" span="24" :item-render="{}" title-overflow="title">
          <template #default="params">
            <vxe-input v-model="params.data.phone" placeholder="请输入年龄" clearable
              @change="changeEvent(params)"></vxe-input>
          </template>
        </vxe-form-item>
      </vxe-form-gather>
      <vxe-form-item align="center" span="24">
        <template #default>
          <vxe-button style="margin-top: 25px;" type="submit" status="primary" content="下一步"></vxe-button>
          <vxe-button type="reset" content="重置"></vxe-button>
        </template>
      </vxe-form-item>
    </vxe-form>
  </div>
</template>
<style scoped>
::v-deep(.vxe-form--item-title-content:before) {
  display: none !important;
}

h1,
h4 {
  color: #fff;
}

h4 {
  font-weight: normal;
}
</style>