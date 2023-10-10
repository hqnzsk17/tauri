import docxtemplater from 'docxtemplater'

import PizZip from 'pizzip'

import PizZipUtils from 'pizzip/utils'

// import { saveAs } from 'file-saver'

import ImageModule from 'docxtemplater-image-module-free'

import { writeBinaryFile } from '@tauri-apps/api/fs';

import { save } from '@tauri-apps/api/dialog';
// import { resolve } from 'path'

//导出word文件(docData为处理好的数据)

export const wordExport = (docData: any,type: any) => {
  let filepath = type =='总台账'?'/tzmuban.docx':'/mxmuban.docx'
  // word导出 - 编译
  const loadFile = function loadFile(url: any, callback: any) {
    PizZipUtils.getBinaryContent(url, callback)
  }
  loadFile(filepath, function (error: any, content: any) {
    if (error) {
      throw error
    }
    // 有图片的话，需加上下面这段代码
    let opts: any = {}
    opts.centered = false
    opts.fileType = 'docx'
    opts.getImage = function (tagValue: any) {
      return new Promise(function (resolve, reject) {
        PizZipUtils.getBinaryContent(tagValue, function (error: any, content: any) {
          if (error) {
            return reject(error)
          }
          return resolve(content)
        })
      })
    }
    opts.getSize = function () {
      return [255, 195]//这里是生成的word文件里图片的宽和高
    }
    let imageModule = new ImageModule(opts)
    var zip = new PizZip(content)
    let doc = new docxtemplater().loadZip(zip).attachModule(imageModule).compile()
    // 有图片的话,需加载图片处理模块
    doc.resolveData(docData).then(function () {
      console.log('ready')
      doc.render() //apply them (replace all occurences of {first_name} by Hipp, ...)
      var out = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      }) //Output the document using Data-URI
      // saveAs(out, '总台账' + '.docx')
      let reader: any = new FileReader();
      let blob = out;
      reader.readAsArrayBuffer(blob);
      // 设置FileReader对象的onloadend属性
      reader.onloadend = async function () {
        // 在这里处理二进制数据
        let name: string = showtime()
        var fileArray = new Uint8Array(reader.result)
        console.log('fileArray', fileArray);
        let selPath = await save({
          title: `导出`,
          defaultPath: `${type}${name}`,
          filters: [{
            name: 'docx',
            extensions: ['docx']
          }]
        });
        //
        // await writeBinaryFile({ contents: fileArray, path: `${selPath}` })
        writeBinaryFile({ contents: fileArray, path: `${selPath}` }).then((res: any) => {
          console.log(res)
        }).catch(() => {
        });
      }
    })
  })
}

var showtime = function () {
  var nowdate = new Date();
  // var year = nowdate.getFullYear(),
  //     month = nowdate.getMonth() + 1,
  //     date = nowdate.getDate(),
  //     day = nowdate.getDay(),
  //     week = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
  var h = nowdate.getHours(),
    m = nowdate.getMinutes(),
    s = nowdate.getSeconds();
  return h + '' + m + '' + s;
}