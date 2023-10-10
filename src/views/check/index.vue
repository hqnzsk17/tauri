<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useStore } from '@/store/index'
import { ref } from "vue";
import { VXETable, VxeFormInstance, VxeFormPropTypes, VxeFormEvents, VxeGridProps, VxeGridInstance, VxeButtonEvents } from 'vxe-table'
import { reactive } from 'vue'
import deviceJson from '@/assets/device.json'
import { exists, writeBinaryFile, BaseDirectory } from '@tauri-apps/api/fs';
// import { save } from '@tauri-apps/api/dialog';
import { wordExport } from "./exportDocx";
const deviceList: any = deviceJson.data
// console.log('deviceList', deviceList)
const store = useStore()
const router = useRouter();
const xGrid = ref<VxeGridInstance<RowVO>>()
const sinput = ref()
let storeData: any = store.state.userInfo
let btloading = false
// const queryData:any = router.currentRoute.value.query
// console.log('getstore=>',store.state.userInfo)
const fanhui = () => {
  router.push({
    path: '/',
    query: {},
  });
}
//
const securityList = ref([
  { id: '非密', name: '非密' },
  { id: '内部', name: '内部' },
  { id: '秘密', name: '秘密' },
  { id: '机密', name: '机密' },
  { id: '绝密', name: '绝密' }
])
//
interface FormDataVO {
  deviceName: string
  specifications: number
  securityClass: string
  brandModel: string
  serialNumber: string
  speciaNumber: string
  remarks: string
}

const formRef = ref<VxeFormInstance>()

const loading = ref(false)

const formData = ref<FormDataVO>({
  deviceName: '',
  specifications: 1,
  securityClass: '',
  brandModel: '',
  serialNumber: '',
  speciaNumber: '',
  remarks: ''
})

const formRules = ref<VxeFormPropTypes.Rules>({
  deviceName: [
    { required: true, message: '请选择或填写清点设备' }
  ],
  securityClass: [
    { required: true, message: '请选择密级' }
  ],
  specifications: [
    { required: true, message: '请填写数量' }
  ]
  // serialNumber: [
  //   { required: true, message: '请填写序列号' }
  // ]
})

const changeEvent = (params: any) => {
  const $form = formRef.value
  if ($form) {
    $form.updateStatus(params)
  }
}

const submitEvent: VxeFormEvents.Submit = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    let data: any = formData.value
    // let data2: any = store.state.userInfo
    // console.log('subdata', data)
    // console.log('subdata2', data2)
    let gridData = (xGrid as any).value.getTableData().fullData
    let datalen = gridData.filter((item: any) => item.serialNumber == data.serialNumber)
    const $grid = xGrid.value
    //
    console.log('datalen', datalen)
    console.log('gridData', gridData)
    let numArray = []
    let maxId = 0
    if (gridData.length > 0) {
      for (const item of gridData) {
        numArray.push(item.id)
      }
      console.log('numArray', numArray)
      maxId = Math.max.apply(null, numArray);
      console.log('maxId', maxId)
    }
    //
    if (datalen.length > 0 && data.serialNumber != "") {
      VXETable.modal.confirm(`检测到列表中有相同序列号 ${data.serialNumber}，是否继续添加？`).then((res: any) => {
        if (res == 'confirm') {
          if ($grid) {
            $grid.insert({
              id: maxId + 1,
              deviceName: data.deviceName,
              brandModel: data.brandModel,
              securityClass: data.securityClass,
              specifications: data.specifications,
              serialNumber: data.serialNumber,
              speciaNumber: data.speciaNumber,
              remarks: data.remarks
            })
            formData.value.serialNumber = '';
          }
        } else {
        }
        sinput.value.focus()
      })
    } else {
      if ($grid) {
        $grid.insert({
          id: maxId + 1,
          deviceName: data.deviceName,
          brandModel: data.brandModel,
          securityClass: data.securityClass,
          specifications: data.specifications,
          serialNumber: data.serialNumber,
          speciaNumber: data.speciaNumber,
          remarks: data.remarks
        })
        formData.value.serialNumber = ''
        sinput.value.focus()
      }
    }
  }, 200)
}

const resetEvent: VxeFormEvents.Reset = () => {
  // VXETable.modal.message({ content: '重置事件', status: 'info' })
}
const showPull = ref(false)
const focusEvent = () => {
  showPull.value = true
}

// const keyupEvent = () => {
// list.value = formData.value.deviceName ? mockData.filter((item) => item.label.indexOf(searchName.value) > -1) : mockData
// }

const selectEvent = (item: any) => {
  showPull.value = false
  formData.value.deviceName = item.cjqrdName
  console.log('formData.value', formData.value)
}

//vxe-table
interface RowVO {
  id: number
  deviceName: string
  securityClass: string
  specifications: number
  brandModel: string
  speciaNumber: string
  remarks: string
  serialNumber: string
}

const gridOptions: any = reactive<VxeGridProps<RowVO>>({
  border: true,
  // height: 300,
  align: null,
  columnConfig: {
    resizable: true
  },
  columns: [
    { type: 'seq', width: 50, title: '序号' },
    { field: 'deviceName', title: '设备名称' },
    { field: 'brandModel', title: '品牌型号' },
    { field: 'securityClass', title: '密级' },
    { field: 'speciaNumber', title: '特殊编号' },
    { field: 'specifications', title: '数量' },
    { field: 'remarks', title: '备注' },
    { field: 'serialNumber', title: '序列号' },
    { title: '操作', slots: { default: 'operate' }, width: 80, align: 'center' }
  ],
  // exportConfig: {
  //   type: 'csv',
  //   filename: '总台账'
  // },
  toolbarConfig: {
    // export: true,
    slots: {
      buttons: 'toolbar_buttons'
    }
  },
  data: [
    // { id: 10001, deviceName: 'Test1', brandModel: 'T1', securityClass: 'Develop', serialNumber: 'Man', brandModel: 'Shenzhen' },
  ]
})

gridOptions.data = store.state.tableData

const removeRowEvent = async (row: RowVO) => {
  const type = await VXETable.modal.confirm('您确定要删除该数据?')
  const $grid = xGrid.value
  if ($grid) {
    if (type === 'confirm') {
      await $grid.remove(row)
    }
  }
}

const qingKong = async () => {
  const type = await VXETable.modal.confirm('是否清空所有数据?')
  const $grid = xGrid.value
  if ($grid) {
    if (type === 'confirm') {
      $grid.reloadData([])
    }
  }
}

const dctaizhang = async () => {
  saveInfo()
  let gridData = (xGrid as any).value.getTableData().fullData
  gridData.forEach((item: any, index: any) => {
    item.sort = index + 1
  });
  console.log("gridData", gridData)
  const gridDataArr = JSON.parse(JSON.stringify(gridData))
  //
  var newdata: any = []
  const myfun = (arr: any, obj: any) => {
    let index = arr.findIndex((item: any) => item.deviceName == obj.deviceName && item.securityClass == obj.securityClass)
    if (index > -1) {
      arr[index].specifications = parseInt(arr[index].specifications) + parseInt(obj.specifications)
    }else{
      arr.push(obj)
    }
  }
  for (const item of gridDataArr) {
    // newfun(newdata, item)
    myfun(newdata, item)
  }
  const list = {
    "unitName": storeData.unitName,
    "contacts": storeData.contacts,
    "phone": storeData.phone,
    "tableList": newdata
  }
  wordExport(list,'总台账')
}

const saveInfo = async () => {
  const isFile = await exists(`everest`, { dir: BaseDirectory.Data })
  if (isFile) {
    let gridData = (xGrid as any).value.getTableData().fullData
    let res = {
      userInfo: store.state.userInfo,
      tableData: gridData
    }
    let data = JSON.stringify(res, undefined, 4);
    var blob = new Blob([data], { type: "text/json" });
    let reader: any = new FileReader();
    // let blob = res.blob;
    reader.readAsArrayBuffer(blob);
    // 设置FileReader对象的onloadend属性
    reader.onloadend = async function () {
      // 在这里处理二进制数据
      var fileArray = new Uint8Array(reader.result);
      // console.log('fileArray', fileArray);
      // const contents = await exists(`data.json`, { dir: BaseDirectory.AppData })
      await writeBinaryFile({ path: `data.json`, contents: fileArray }, { dir: BaseDirectory.AppData });
      VXETable.modal.message({ content: '数据已保存！', status: 'success' })
    }
  }
}

const exportDataEvent: VxeButtonEvents.Click = async () => {
  saveInfo()
  const $grid = xGrid.value
  console.log('$grid', $grid)
  if ($grid) {
    let gridData = (xGrid as any).value.getTableData().fullData
    gridData.forEach((item: any, index: any) => {
      item.sort = index + 1
    });
    if (gridData.length < 1) {
      VXETable.modal.message({ content: '请添加数据！', status: 'error' })
    } else {
      let list = {
        "unitName": storeData.unitName,
        "contacts": storeData.contacts,
        "phone": storeData.phone,
        "tableList": gridData
      }
      wordExport(list,'明细')
      // let res = await $grid.exportData({ type: 'csv', isHeader: true, download: false });
      // console.log('res', res)
      // let reader: any = new FileReader();
      // let blob = res.blob;
      // reader.readAsArrayBuffer(blob);
      // // 设置FileReader对象的onloadend属性
      // reader.onloadend = async function () {
      //   // 在这里处理二进制数据
      //   let name: string = showtime()
      //   var fileArray = new Uint8Array(reader.result)
      //   let selPath = await save({
      //     title: `导出`,
      //     defaultPath: `导出明细${name}`,
      //     filters: [{
      //       name: 'xlsx',
      //       extensions: ['xlsx', 'csv']
      //     }]
      //   });
      //   //
      //   writeBinaryFile({ contents: fileArray, path: `${selPath}` }).then((res: any) => {
      //     console.log(res)
      //     VXETable.modal.message({ content: '明细已导出！', status: 'success' });
      //   })
      //   // .catch(err => {
      //   // VXETable.modal.message({ content: '导出失败！', status: 'success' });
      //   // })
      //   // await writeBinaryFile({ path: `导出明细${name}.csv`, contents: fileArray }, { dir: BaseDirectory.Desktop });
      //   // VXETable.modal.message({ content: '明细已导出！', status: 'success' });
      // }
    }
  }
}
// var showtime = function () {
//   var nowdate = new Date();
//   // var year = nowdate.getFullYear(),
//   //     month = nowdate.getMonth() + 1,
//   //     date = nowdate.getDate(),
//   //     day = nowdate.getDay(),
//   //     week = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
//   var h = nowdate.getHours(),
//     m = nowdate.getMinutes(),
//     s = nowdate.getSeconds();
//   return h + '' + m + '' + s;
// }
</script>
<template>
  <div style="padding-bottom: 50px;">
    <div class="title">涉密设备清点建账系统</div>
    <div class="top-box">
      <div class="t-title">
        <span class="t-left">{{ storeData.unitName }}</span>
        <span class="t-right" @click="fanhui">上一页</span>
      </div>
      <div class="midbox">
        <div style="text-align: center;margin-bottom: 10px;color: #4184F9;font-weight: 400;font-size: 20px;">当前清点设备：{{
          formData.deviceName }}</div>
        <vxe-form style="border-radius: 8px;" title-colon ref="formRef" title-align="right" title-width="85"
          :data="formData" :rules="formRules" :loading="loading" @submit="submitEvent" @reset="resetEvent">
          <vxe-form-gather span="24">
            <vxe-form-item title="清点设备" field="deviceName" span="6" :item-render="{}" title-overflow="title">
              <vxe-pulldown v-model="showPull" style="width: 100%;">
                <template #default>
                  <vxe-input v-model="formData.deviceName" placeholder="下拉框" @focus="focusEvent"></vxe-input>
                </template>
                <template #dropdown>
                  <div class="my-dropdown1">
                    <div class="list-item1" v-for="item in deviceList" :key="item.id" @click="selectEvent(item)">
                      <!-- <i class="vxe-icon-user-fill"></i> -->
                      <span>{{ item.cjqrdName }}</span>
                    </div>
                  </div>
                </template>
              </vxe-pulldown>
              <!-- <template #default="params">
                <vxe-select v-model="params.data.deviceName" placeholder="请选择设备" clearable filterable @change="changeEvent(params)">
                  <vxe-option v-for="item of deviceList" :key="item.id" :value="item.cjqrdName"
                    :label="item.cjqrdName"></vxe-option>
                </vxe-select>
              </template> -->
            </vxe-form-item>
            <vxe-form-item title="设备密级" field="securityClass" span="6" :item-render="{}" title-overflow="title">
              <template #default="params">
                <vxe-select v-model="params.data.securityClass" placeholder="请选择" clearable @change="changeEvent(params)">
                  <vxe-option v-for="item of securityList" :key="item.id" :value="item.name"
                    :label="item.name"></vxe-option>
                </vxe-select>
              </template>
            </vxe-form-item>
            <vxe-form-item title="设备数量" field="specifications" span="6" :item-render="{}" title-overflow="title">
              <template #default="params">
                <vxe-input type="number" v-model="params.data.specifications" placeholder="" @change="changeEvent(params)"></vxe-input>
              </template>
            </vxe-form-item>
            <vxe-form-item title="品牌型号" field="brandModel" span="6" :item-render="{}" title-overflow="title">
              <template #default="params">
                <vxe-input v-model="params.data.brandModel" placeholder="" clearable
                  @change="changeEvent(params)"></vxe-input>
              </template>
            </vxe-form-item>
            <vxe-form-item title="特殊编号" field="speciaNumber" span="6" :item-render="{}" title-overflow="title">
              <template #default="params">
                <vxe-input v-model="params.data.speciaNumber" placeholder="" clearable
                  @change="changeEvent(params)"></vxe-input>
              </template>
            </vxe-form-item>
            <vxe-form-item title="备注" field="remarks" span="6" :item-render="{}" title-overflow="title">
              <template #default="params">
                <vxe-input v-model="params.data.remarks" placeholder="" clearable
                  @change="changeEvent(params)"></vxe-input>
              </template>
            </vxe-form-item>
            <vxe-form-item title="序列号" field="serialNumber" span="6" :item-render="{}" title-overflow="title">
              <template #default="params">
                <vxe-input ref="sinput" v-model="params.data.serialNumber" placeholder="" clearable
                  @change="changeEvent(params)"></vxe-input>
              </template>
            </vxe-form-item>
            <vxe-form-item field="" span="6">
              <template #default>
                <vxe-button style="margin-left: 13px;" type="submit" status="primary" content="确定"></vxe-button>
                <!-- <vxe-button type="reset" content="重置"></vxe-button> -->
              </template>
            </vxe-form-item>
          </vxe-form-gather>
        </vxe-form>
      </div>
    </div>
    <div class="bot-box">
      <!-- <div class="t-left">电子台账</div> -->
      <vxe-grid ref="xGrid" v-bind="gridOptions">
        <template #toolbar_buttons>
          <vxe-button :loading="btloading" @click="dctaizhang">导出总台账</vxe-button>
          <vxe-button :loading="btloading" @click="exportDataEvent">导出明细</vxe-button>
          <vxe-button :loading="btloading" @click="qingKong">清空数据</vxe-button>
          <vxe-button :loading="btloading" @click="saveInfo">保存数据</vxe-button>
        </template>
        <template #operate="{ row }">
          <vxe-button status="danger" content="删除" @click="removeRowEvent(row)"></vxe-button>
        </template>
      </vxe-grid>
    </div>
  </div>
</template>
<style scoped lang="less">
.my-dropdown1 {
  height: 200px;
  overflow: auto;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  background-color: #fff;
}

.list-item1:hover {
  background-color: #f5f7fa;
}

.t-title {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .t-right {
    padding: 5px 10px;
    // border: 1px solid #DFDFDF;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
  }
}

.t-left {
  color: #323232;
  font-weight: 400;
  font-size: 14px;
}

.title {
  text-align: center;
  font-size: 16px;
  color: #323232;
  padding: 15px 0;
}

.top-box {
  background: #fff;
  margin: 0 10px;
  padding: 15px;
  // box-shadow: 0px 12px 20px 0px #4184F914;
}

.bot-box {
  margin: 0 10px;
  margin-top: 10px;
  background: #fff;
  padding: 5px 15px 15px 15px;
}
</style>