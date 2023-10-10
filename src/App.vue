<template>
  <div class="container">
    <router-view></router-view>
  </div>
</template>
<style scoped>
/* 定义滚动条宽高及背景，宽高分别对应横竖滚动条的尺寸 */
.container {
  overflow-y: auto;
}
/* 定义滚动条宽高及背景，宽高分别对应横竖滚动条的尺寸 */
.container::-webkit-scrollbar {
    width: 10px; /* 对垂直滚动条有效 */
     /* height: 10px;  对水平滚动条有效 */
}
 
/* 定义滚动条的轨道颜色、内阴影及圆角 */
.container::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, .3);
    background-color: #ececec;
    border-radius: 5px;
}
 
/* 定义滑块颜色、内阴影及圆角 */
.container::-webkit-scrollbar-thumb {
    border-radius: 5px;
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, .3);
    background-color: rgba(0, 0, 0, .1);
}
 
 
/* 光标移到滚动滑块上样式颜色变深 */
.container::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, .2);
}
 
/* 定义两端按钮的样式 */
.container::-webkit-scrollbar-button {
    height: 0px;
    background-color: rgba(0, 0, 0, .1);
}
 
/* 定义右下角汇合处的样式 */
.container::-webkit-scrollbar-corner {
    background: #ececec;
}
</style>