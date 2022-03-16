<template>
  <nav id="header" class="flex w100">
    <NuxtLink class="item" v-for="item in items" :to="item.url" :key="item.name">
      {{ item.name }}
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </NuxtLink>
    <a v-if="isAuthor" class="item" @click="$emit('prompt')">
      密码
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </a>
    <del/>
<!--    <input />-->
    <a class="home flex" v-if="openEdit.startsWith('https://')" target="_blank" href="https://github.com/yunyuyuan/nuxt2-blog" title="Go to Github">
      <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path d="M511.5462931 17.79975521C231.04199992 17.68632849 3.84826793 244.76663375 3.84826793 525.04407347 3.84826793 746.67989589 145.97195549 935.08168762 343.90159221 1004.27199045c26.65528059 6.69217682 22.57191847-12.2500864 22.57191843-25.18073315v-87.90571258c-153.92006706 18.03484941-160.15853699-83.82235045-170.48036902-100.83635934C175.12262405 754.73319344 125.78199828 745.65905537 140.52747263 728.64504646c35.0488583-18.03484941 70.77827695 4.53706903 112.17903194 65.67407432 29.94465564 44.34984982 88.3594195 36.86368593 117.96379494 29.49094874 6.46532338-26.65528059 20.30338393-50.47489304 39.35907389-68.96344935-159.47797662-28.58353493-225.94603801-125.90366575-225.94603801-241.59892618 0-56.14622932 18.48855632-107.75538961 54.78510862-149.38299803-23.13905209-68.62316917 2.1551078-127.37821319 5.55790957-136.11207109 65.90092774-5.89818975 134.41067021 47.18551799 139.74172632 51.38230684 37.43081954-10.0949786 80.1926952-15.42603472 128.05877355-15.42603472 48.09293177 0 90.96823417 5.55790959 128.7393339 15.76631491 12.81722003-9.75469843 76.33618654-55.35224222 137.58661852-49.79433268 3.28937506 8.7338579 28.01640129 66.1277812 6.23846995 133.84353656 36.75025919 41.74103513 55.46566898 93.80390232 55.46566896 150.0635584 0 115.92211387-66.92176828 213.35567144-226.85345181 241.48549945 26.65528059 26.3150004 43.21558257 62.83840617 43.21558254 103.21832055v127.60506666c0.9074138 10.20840532 0 20.30338393 17.01400891 20.30338395 200.87873158-67.71575538 345.49780712-257.4786678 345.49780714-481.04274459 0-280.39086644-227.30715873-507.35774499-507.58459846-507.35774499z"></path></svg>
    </a>
    <NuxtLink v-else class="home flex" :to="openEdit" title="🚀">
      <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path d="M1017.513599 83.329295c-2.85229 94.564393-23.184 185.325732-57.338348 273.381052-40.66342 105.315333-100.268973 197.905064-183.863019 274.478087a23.403407 23.403407 0 0 0-8.044921 21.648152c2.925426 28.376631 5.265767 56.753263 8.191192 85.056759 6.801615 66.04149-16.382385 120.16187-69.625137 158.484949-57.118941 41.17537-116.505087 79.205907-175.525555 117.748394a55.144279 55.144279 0 0 1-86.958285-41.906727 6562.315429 6562.315429 0 0 1-11.994247-152.049012c-1.755256-25.37807-1.023899-25.597477-25.597477-28.815445-65.236998-8.630006-116.28568-39.566386-151.390791-95.807699a212.605329 212.605329 0 0 1-30.058751-94.564393c-0.950763-10.019584-4.973224-12.579331-14.480859-13.091281-52.877074-2.925426-105.607876-5.997123-158.265542-9.946449-43.881389-3.36424-66.114626-49.585969-42.564947-88.201591 16.528656-27.06019 34.008076-53.60843 51.121818-80.376077l54.924871-86.592608c33.715534-52.730802 82.35074-81.180569 144.442905-81.765654 35.617061-0.292543 71.234121 5.997123 106.778046 9.800177 6.801615 0.731356 11.555432-0.146271 16.162979-5.338903C466.070813 153.173839 568.314449 90.789131 684.015044 49.101811a848.373517 848.373517 0 0 1 201.708118-46.075458c34.812568-3.583647 69.844544-4.900088 104.583976 1.462713 19.015268 3.583647 19.966032 4.388139 22.891458 22.891458 2.925426 18.503319 5.265767 37.079774 4.388139 55.875635z m-199.221505 233.010174c0.731356-62.311572-50.829275-115.920002-112.190084-116.943901-63.628014-1.023899-118.845428 45.344102-120.308141 117.602122-1.316442 60.33691 53.315887 114.896103 114.237882 115.334917a117.017037 117.017037 0 0 0 118.260343-115.993138z"></path></svg>
    </NuxtLink>
    <sub></sub>
    <NuxtLink class="about" to="/about" :title="festival?festival.tips:'关于'">
      <img :style="festival?festival.imgStyle:false" class="s100" src="/favicon.jpg" alt="头像"/>
      <svg-icon v-if="festival" :style="festival?festival.svgStyle:false" :name="festival.icon"/>
    </NuxtLink>
  </nav>
</template>

<script>
import Headroom from "headroom.js";
import {articleList, recordList, knowledgeList, festivals} from '~/utils/data';
import dayjs from "~/utils/_dayjs";

export default {
  name: "the-header",
  data() {
    return {
      // 节日
      festival: false,
      items: [{
        name: '文章',
        url: '/articles'
      },
        {
          name: '记录',
          url: '/records'
        },
        {
          name: '文化',
          url: '/knowledges'
        }]
    }
  },
  computed: {
    openEdit() {
      const paths = this.$route.path.split('/').slice(1);
      let json = {};
      switch (paths[0]) {
        case 'articles':
          json = articleList;
          break
        case 'records':
          json = recordList;
          break
        case 'knowledges':
          json = knowledgeList;
          break;
        case 'about':
          return 'https://github.com/yunyuyuan/nuxt2-blog'
        default:
          return '/'
      }
      if (!paths[1]) {
        return `/${paths[0]}/edit/new`
      }
      const inEdit = paths[1] === 'edit';
      if (json.find(v => v.id === parseInt(inEdit?paths[2]:paths[1]))) {
        if (inEdit) {
          return `/${paths[0]}/${paths[2]}`
        }
        return `/${paths[0]}/edit/${paths[1]}`
      }
      return '/'
    },
    isAuthor() {
      return this.isAuthor_()
    }
  },
  inject: ['isAuthor_'],
  created() {
    const now = dayjs.utc();
    for (const i of festivals) {
      let targetDay = typeof i.days == 'string' ? [-1, 0, 1].map(v => `${now.year()+v}-${i.days}`) : i.days;
      for (const d of targetDay) {
        if (Math.abs(now.diff(dayjs.utc(d), 'day')) <= 3) {
          this.festival = i;
          return;
        }
      }
    }
  },
  mounted() {
    const headroom = new Headroom(this.$el, {
      offset: 48,
    });
    headroom.init();
  },
  methods: {
  }
}
</script>

<style lang="scss">
@import "../assets/style/var";
@keyframes swing{
  0%{
    transform: rotate(0deg) translateY(100%);
  }
  30%{
    transform: rotate(-55deg) translateY(100%);
  }
  60%{
    transform: rotate(0deg) translateY(100%);
  }
  80%{
    transform: rotate(30deg) translateY(100%);
  }
  100%{
    transform: rotate(0deg) translateY(100%);
  }
}
#header{
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: $header-height;
  background: #303947;
  z-index: $z-index-header;
  transition: $common-transition;
  .item{
    color: white;
    text-decoration: none;
    margin-left: 16px;
    transition: $common-transition;
    position: relative;
    $padding: 2px;
    font-weight: bold;
    padding: 2px 5px;
    word-break: keep-all;
    cursor: pointer;
    font: {
      size: 20px;
      family: "Source Code Pro", serif;
    }
    span{
      position: absolute;
      background: white;
      $offset: 4px;
      transition: $common-transition;
      &:nth-child(1){
        height: 1px;
        width: 0;
        top: -$padding;
        left: -$padding;
        transform: translateX(-$offset);
      }
      &:nth-child(2){
        width: 1px;
        height: 0;
        top: -$padding;
        left: -$padding;
        transform: translateY(-$offset);
      }
      &:nth-child(3){
        height: 1px;
        width: 0;
        bottom: -$padding;
        right: -$padding;
        transform: translateX($offset);
      }
      &:nth-child(4){
        width: 1px;
        height: 0;
        bottom: -$padding;
        right: -$padding;
        transform: translateY($offset);
      }
    }
    &:not(.nuxt-link-active):hover{
      text-shadow: 0 0 10px #ffffff;
      span{
        $size: calc(100% + #{$padding*3});
        &:nth-child(1){
          width: $size;
        }
        &:nth-child(2){
          height: $size;
        }
        &:nth-child(3){
          width: $size;
        }
        &:nth-child(4){
          height: $size;
        }
      }
    }
    &.nuxt-link-active{
      background: #f6fbff;
      color: #303947;
    }
  }
  del{
    margin: auto;
  }
  .home, .about{
    width: 28px;
    height: 28px;
    transition: $common-transition;
  }
  .home:hover{
    svg{
      fill: white;
    }
  }
  svg{
    fill: #d3d3d3;
    width: 100%;
    height: 100%;
  }
  sub{
    width: 1px;
    height: 50%;
    background: white;
    margin: 0 12px;
  }
  .about{
    margin-right: 10px;
    position: relative;
    opacity: .85;
    svg {
    }
    img{
      position: relative;
      border-radius: 2px;
    }
    &:hover{
      opacity: 1;
    }
  }
  &.headroom--not-top{
    box-shadow: 0 0 8px #4c4c4c;
    height: $header-height - 6px;
    .item{
      font-size: 18px;
    }
    .home, .about{
      width: 23px;
      height: 23px;
    }
  }
}
</style>
