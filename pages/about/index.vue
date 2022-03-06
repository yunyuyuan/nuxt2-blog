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
        '幽深宇宙已岁逾百亿，惟闪烁星光点缀生机',
        '我常仰望浩瀚天际，思念在同一颗星球的你',
        '想，那转瞬的迷人流星，也许就是你的回眸',
        '光坠之地，吾之忧祈',
        '——2021.12.4',
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
