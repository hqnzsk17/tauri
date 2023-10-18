<script setup lang="ts">
import Mid from "./components/mid.vue";
</script>

<template>
    <div style="background-image: url('/rectangle.png');background-size: cover;height: 100%;">
        <div style="height: 80px;"></div>
        <!-- <img src="/logowhite.png" class="logo tauri" alt="Tauri logo" /> -->
        <!-- <div class="row">
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" class="logo tauri" alt="Tauri logo" />
        </a>
      </div> -->
        <Mid />
        <div style="padding-bottom: 10px;">
            <h6 class="bt">技术支撑：西安以为电子科技有限公司<span style="margin-left: 10px;">客户端版本：V1.0.0</span></h6>
        </div>
    </div>
</template>
<style scoped>
.bt{
    color: #fff;
    font-weight: normal;
    margin: 0;
    text-align: center;
    position: fixed;
    width: 100%;
    bottom: 20px;
}

</style>