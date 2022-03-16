<template>
  <div class="article-detail">
    <div class="captain flex w100" :class="{'no-menu': !menu.length}">
      <div class="article-container">
        <h2>{{item.title}}</h2>
        <article v-viewer ref="markdown" class="--markdown" v-html="html"/>
      </div>
      <div class="menu flexc" v-if="menu.length">
        <ul ref="menu">
          <li v-for="anchor in menu" :key="anchor.url">
            <a :key="anchor.url" :href="anchor.url" :class="[anchor.size, {active: anchor.active}]">{{ anchor.text }}</a>
          </li>
        </ul>
      </div>
    </div>
    <div class="more-info flex">
      <div class="tag flex"><span>标签:</span><the-tag v-for="tag in item.tags" :href="'/articles?tag='+tag" :key="tag">{{tag}}</the-tag></div>
      <span class="time">更新于: <span>{{item.modifyTime|formattime}}</span></span>
    </div>
  </div>
</template>

<script>
import '~/assets/style/markdown.scss';
import 'perfect-scrollbar/css/perfect-scrollbar.css';
import {articleList} from "~/utils/data";
import {cloneDeep} from "lodash/lang";
import {decrypt} from "~/utils/utils";
import {afterInsertHtml} from "~/utils/markdown";
import {addScrollListener, rmScrollListener} from "~/utils/scroll-event";
import TheTag from "../../comps/tag";

export default {
  name: "index",
  components: {TheTag},
  data() {
    return {
    }
  },
  head () {
    return {
      title: this.item?.title
    }
  },
  async asyncData({params}) {
    const id = parseInt(params.id);
    const item = cloneDeep(articleList.find(md => md.id === id));
    const newMenu = cloneDeep(item.menu);
    newMenu.forEach(anchor => {
      anchor.active = false
    })
    const html = (await import(`!!raw-loader!~/rebuild/articles/${id}.html`)).default;
    return {
      html,
      item,
      menu: newMenu
    }
  },
  computed: {
    encryptor() {
      return this.encryptor_()
    },
  },
  inject: ['encryptor_'],
  watch: {
    encryptor: {
      immediate: true,
      handler () {
        if (this.item.encrypt) {
          this.item.title = decrypt(this.item.title, this.encryptor);
          this.html = decrypt(this.html, this.encryptor);
          this.menu = this.menu.map(m => ({
            active: m.active,
            size: m.size,
            text: decrypt(m.text, this.encryptor),
            url: decrypt(m.url, this.encryptor),
          }))
        }
      }
    }
  },
  mounted() {
    const hash = this.$route.hash;
    if (hash) {
      this.$nextTick(() => {
        try {
          window.scrollTo({top: document.getElementById(hash.slice(1)).getBoundingClientRect().y});
        }catch {}
      })
    } else {
      this.listenScroll();
    }
    this.$nextTick(() => {
      addScrollListener(this.listenScroll);
      afterInsertHtml(this.$refs.markdown);
    })
  },
  methods: {
    listenScroll() {
      try {
        const links = Array.from(this.$refs.markdown.querySelectorAll('h1>a, h2>a, h3>a, h4>a, h5>a, h6>a')).reverse();
        for (const link of links) {
          if (link.getBoundingClientRect().y <= 52) {
            const hash = link.getAttribute('href');
            this.menu.forEach(anchor => {
              anchor.active = anchor.url === hash;
            })
            return;
          }
        }
        // 未找到
        this.menu.forEach((anchor, idx) => {
          anchor.active = idx === 0;
        })
      }catch { }
    }
  },
  beforeDestroy() {
    rmScrollListener(this.listenScroll);
  }
}
</script>

<style lang="scss">
@import "assets/style/var";

.article-detail{
  $min-article-size: 500px;
  $menu-size: 240px;
  $menu-margin: 20px;
  margin-bottom: 80px;
  .captain{
    margin: auto;
    position: relative;
    max-width: 1050px;
    min-width: $min-article-size + $menu-size + $menu-margin;
    >.article-container{
      position: relative;
      width: 880px;
      min-width: $min-article-size;
      margin: 0 $menu-size + $menu-margin 0 20px;
      >h2 {
        margin: 30px 0 40px 0;
        text-align: center;
        color: #1d1d1d;
        word-break: break-word;
        letter-spacing: .5px;
        font-family: $font-title;
      }
      article{
        position: relative;
        z-index: 2;
      }
    }
    &.no-menu {
      width: $min-article-size + $menu-size + $menu-margin;
      >.article-container {
        margin: 0 auto;
      }
      ~ .more-info {
        margin-right: 20px;
      }
    }
    >.menu{
      position: absolute;
      top: 0;
      right: 0;
      width: $menu-size + $menu-margin;
      ul{
        position: fixed;
        top: $header-height;
        padding: 40px 0 0 $menu-margin;
        width: $menu-size - $menu-margin;
        min-width: $menu-size - $menu-margin;
        height: calc(100vh - #{$header-height+40px});
        list-style: none;
        $mouse-out-color: #929292;
        $mouse-in-color: #6b6363;
        &:hover{
          a{
            color: $mouse-in-color;
            &:before{
              background: $mouse-in-color;
            }
            &.small{
              &:before{
                border: 1px solid $mouse-in-color;
              }
            }
          }
        }
        a{
          text-decoration: none;
          font-size: 14px;
          line-height: 18px;
          padding: 6px 6px 6px 18px;
          display: flex;
          align-items: center;
          transition: $common-transition;
          position: relative;
          color: $mouse-out-color;
          border-radius: 4px;
          word-break: break-word;
          &:before{
            position: absolute;
            content: '';
            border-radius: 50%;
            width: 7px;
            height: 7px;
            background: $mouse-out-color;
            left: 5px;
            flex-shrink: 0;
            transition: $common-transition;
          }
          &:nth-of-type(:last-of-type){
            margin-bottom: 8px;
          }
          &.small{
            font-size: 0.8em;
            padding-left: 32px;
            &:before{
              left: 16px;
              width: 7px;
              height: 7px;
              background: transparent !important;
              border: 1px solid $mouse-out-color;
            }
          }
          &:hover{
            background: #f5f5f5;
            color: black;
            &:before{
              background: black;
              border-color: black;
            }
          }
          &.active{
            $active-color: #006fff;
            background: #e3efff;
            color: $active-color;
            &:before{
              background: $active-color;
              border-color: $active-color;
            }
          }
        }
      }
    }
  }
  .more-info {
    margin: 60px 260px 0 20px;
    padding-top: 8px;
    text-align: center;
    border-top: 1px solid #c7c7c7;
    font-size: 12px;
    div {
      flex-wrap: wrap;
      span{
        word-break: keep-all;
        margin-right: 8px;
      }
      a {
        margin: 0 8px 8px 0;
        &:not(:last-of-type){
          margin-right: 8px;
        }
      }
    }
    >span {
      margin-left: auto;
      span{
        color: #ff6a00;
      }
    }
  }
}
@media screen and (min-width: 768px) and (max-width: 1050px) {
  .article-detail {
    width: 100%;
    .captain {
      width: 100vw !important;
      max-width: unset;
      min-width: unset;
      >.article-container {
        width: calc(100% - 120px);
        max-width: unset;
        min-width: unset;
        margin: 0 60px;
      }
      >.menu {
        display: none;
        ul{
          display: none;
        }
      }
    }
    .more-info {
      width: calc(100% - 120px);
      margin: 60px 60px 0 60px;
      div {
        margin-left: 8px;
      }
      >span{
        margin-right: 8px;
      }
    }
  }
}
@include mobile {
  .article-detail {
    width: 100%;
    .captain {
      width: 100% !important;
      max-width: unset;
      min-width: unset;
      >.article-container {
        width: calc(100% - 20px);
        max-width: unset;
        min-width: unset;
        margin: 0 10px;
      }
      >.menu {
        display: none;
        ul{
          display: none;
        }
      }
    }
    .more-info {
      width: 100%;
      margin: 60px 0 0 0;
      div {
        margin-left: 8px;
      }
      >span{
        margin-right: 8px;
      }
    }
  }
}
</style>
