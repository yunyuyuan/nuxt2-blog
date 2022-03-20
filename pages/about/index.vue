<template>
  <div class="about">
    <img :src="outerwilds" alt="bg"/>
    <div class="flexc">
      <p v-for="p in paragraphs">{{p}}</p>
    </div>
  </div>
</template>

<script>
import outerwilds from '~/assets/image/outerwilds.jpg'

export default {
  name: "index",
  head () {
    return {
      title: '关于'
    }
  },
  data() {
    return {
      outerwilds,
      paragraphs: [
        '己所不欲勿施于人',
        '——2022.3.20',
      ]
    }
  }
}
</script>

<style lang="scss">
@import "assets/style/var";
.in-about{
  #header{
    background: rgba($background, .1);
    backdrop-filter: blur(1px);
  }
  #body{
    padding-top: 0;
    .about {
      width: 100vw;
      height: 100vh;
      position: relative;
      img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: right;
        z-index: 1;
      }
      div {
        position: relative;
        z-index: 2;
        padding-top: 100px + $header-height;
        justify-content: center;
        p{
          font-size: 16px;
          letter-spacing: 0.8px;
          color: white;
          font-weight: 300;
          font-family: "Source Han Sans", unset, monospace;
          &:not(:last-of-type){
            margin-bottom: 20px;
          }
        }
      }
    }
  }
  #footer{
    position: fixed;
    width: 100%;
    left: 0;
    bottom: 0;
    z-index: 2;
    .middle{
      color: #a1a1a1;
    }
    &:hover{
      .middle{
        color: #e7e7e7;
      }
    }
    a {
      color: #49b6a3;
      transition: $common-transition;
      &:hover {
        color: #50e5d4;
      }
    }
  }
}
</style>
