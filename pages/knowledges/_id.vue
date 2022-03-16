<template>
  <div class="knowledges-detail">
    <div class="captain flexc w100" v-viewer>
      <div class="info">
        <lazy-img :src="item.cover" alt="cover" :size="['150px', '250px']" viewer/>
        <div class="flexc">
          <h2>{{ item.title }}
            <a target="_blank" :href="item.link" v-if="item.link" title="链接"><svg-icon name="open-link"/></a>
          </h2>
          <p>{{ item.summary }}</p>
        </div>
      </div>
      <div class="divider">
        <div class="game" v-if="item.type === 'game'">
          <div class="pacman">
            <span class="top"></span>
            <span class="bottom"></span>
            <span class="left"></span>
            <div class="eye"></div>
          </div>
          <span></span>
        </div>
        <div class="book" v-else-if="item.type === 'book'">
          <img :src="bookDivide" alt="book"/>
          <span></span>
        </div>
        <div class="film" v-else>
          <svg-icon name="film-roll"/>
          <span></span>
        </div>
      </div>
      <article ref="markdown" class="--markdown" v-html="html"/>
      <span class="modify">更新于：<time>{{ item.modifyTime | formattime }}</time></span>
    </div>
  </div>
</template>

<script>
import '~/assets/style/markdown.scss';
import {knowledgeList} from "~/utils/data";
import {cloneDeep} from "lodash/lang";
import bookDivide from '~/assets/image/book-divide.png';
import filmDivide from '~/assets/image/film-divide.png';
import {afterInsertHtml} from "~/utils/markdown";

export default {
  name: "index",
  data() {
    return {
      bookDivide,
      filmDivide,
    }
  },
  head () {
    return {
      title: this.item?.title
    }
  },
  async asyncData({params}) {
    const id = parseInt(params.id);
    const item = cloneDeep(knowledgeList.find(md => md.id === id));
    const html = (await import(`!!raw-loader!~/rebuild/knowledges/${id}.html`)).default;
    return {
      html,
      item
    }
  },
  mounted() {
    this.$nextTick(() => {
      afterInsertHtml(this.$refs.markdown);
    })
  },
}
</script>

<style lang="scss">
@use "sass:math";
@import "assets/style/var";

.knowledges-detail{
  margin: 0 15px 80px 15px;
  .captain{
    margin: auto;
    position: relative;
    width: 900px;
    >.info {
      margin: 40px 0 20px 0;
      padding-bottom: 20px;
      position: relative;
      display: flex;
      .--lazy-img{
        flex-shrink: 0;
        border: 1px solid #919191;
        box-shadow: 0 0 16px #4f4f4f;
        align-self: center;
        img {
          width: 150px;
          object-fit: contain;
        }
      }
      div{
        h2{
          text-align: center;
          margin-bottom: 15px;
          position: relative;
          width: 100%;
          font-family: $font-title;
          word-break: break-word;
          a{
            position: absolute;
            display: none;
            margin-left: 8px;
            svg {
              width: 18px;
              height: 18px;
              fill: #002eff;
            }
          }
          &:hover {
            a {
              display: unset;
            }
          }
        }
        p{
          font-family: $font-source-han-sans;
          font-size: 13px;
          line-height: 24px;
          letter-spacing: .15px;
          padding-left: 20px;
          white-space: pre-wrap;
          color: #2c2c2c;
        }
      }
    }
    >.divider {
      width: 100%;
      height: 0;
      overflow: visible;
      margin-bottom: 40px;
      .game {
        position: relative;
        $size: 26px;
        $duration: 0.8s;
        .pacman{
          position: absolute;
          left: 0;
          top: 0;
          transform: translateY(-50%);
          height: $size;
          width: $size;
          z-index: 2;
          .eye{
            position: absolute;
            top: math.div($size, 6);
            left: math.div($size, 2.8);
            height: 4px;
            width: 4px;
            border-radius: 50%;
            background-color: #372c6c;
          }
          span{
            position: absolute;
            top: 0;
            left: 0;
            height: $size;
            width: $size;
            &:before{
              content: "";
              position: absolute;
              left: 0;
              height: math.div($size, 2);
              width: $size;
              background-color: #ffad4b;
            }
          }
          .top{
            -webkit-animation: animtop 0.5s infinite;
            animation: animtop $duration infinite;
            &:before{
              top: 0;
              border-radius: $size $size 0px 0px;
            }
          }
          .left:before{
            content: none;
          }
          .bottom{
            -webkit-animation: animbottom $duration infinite;
            animation: animbottom $duration infinite;
            &:before{
              bottom: 0;
              border-radius: 0px 0px $size $size;
            }
          }
          @-webkit-keyframes animtop{
            0%,
            100%{
              -webkit-transform: rotate(0deg);
              transform: rotate(0deg);
            }
            50%{
              -webkit-transform: rotate(-45deg);
              transform: rotate(-45deg);
            }
          }
          @keyframes animtop{
            0%,
            100%{
              -webkit-transform: rotate(0deg);
              transform: rotate(0deg);
            }
            50%{
              -webkit-transform: rotate(-45deg);
              transform: rotate(-45deg);
            }
          }
          @-webkit-keyframes animbottom{
            0%,
            100%{
              -webkit-transform: rotate(0deg);
              transform: rotate(0deg);
            }
            50%{
              -webkit-transform: rotate(45deg);
              transform: rotate(45deg);
            }
          }
          @keyframes animbottom{
            0%,
            100%{
              -webkit-transform: rotate(0deg);
              transform: rotate(0deg);
            }
            50%{
              -webkit-transform: rotate(45deg);
              transform: rotate(45deg);
            }
          }
        }
        >span{
          width: calc(100% - 20px);
          position: absolute;
          z-index: 1;
          right: 0;
          top: 0;
          transform: translateY(-50%) translateX(0);
          height: 0;
          border-top: 4px dotted #838383;
          animation: dotted-move $duration linear infinite;
          @keyframes dotted-move {
            0%{
              transform: translateY(-50%) translateX(0);
            }
            100%{
              transform: translateY(-50%) translateX(-8px);
            }
          }
        }
      }
      .book, .film {
        position: relative;
        width: 100%;
        img {
          width: 50px;
          position: absolute;
          right: 8px;
          bottom: 0;
        }
        span {
          position: absolute;
          bottom: 0;
          left: 0;
          display: block;
          width: 100%;
          height: 1px;
          background: black;
        }
      }
      .film {
        svg {
          width: 36px;
          height: 36px;
          position: absolute;
          right: 8px;
          bottom: 0;
          animation: rotate 5s linear infinite;
          @keyframes rotate{
            0% {
              transform: rotate(0);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        }
        span {
          width: calc(100% - 30px);
        }
      }
    }
    >article {
      width: 800px;
    }
    >.modify {
      font-size: 12px;
      margin-left: auto;
      margin-top: 40px;
      color: #ff6a00;
    }
  }
}
@include mobile{
  .knowledges-detail {
    width: 100%;
    margin: 0 0 80px 0;
    .captain {
      width: calc(100% - 20px) !important;
      max-width: unset;
      min-width: unset;
      >.info {
        flex-direction: column;
        .--lazy-img{
          margin-bottom: 30px;
          width: 60%;
          img {
            width: 100%;
          }
        }
        div {
          h2{
            a {
              display: unset;
              position: relative;
              top: 0;
              left: 0;
              margin-left: 0;
            }
          }
          p {
            padding-left: 0;
          }
        }
      }
      >article {
        width: 100%;
      }
    }
  }
}
</style>
