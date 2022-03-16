<template>
  <div class="md-editor flexc">
    <div class="action flex">
      <template v-if="canEncrypt">
        <my-button v-if="isAuthor && encrypted" @click="decrypt" style="margin-right: 8px">解密</my-button>
        <b v-if="isAuthor" style="font-size: 13px;">加密:</b>
        <input v-if="isAuthor" v-model="doEncrypt" type="checkbox" title="加密"/>
      </template>
      <span @click="showTip=(showTip==='sticker')?false:'sticker'" style="margin-left: auto;" title="表情"><img src="/sticker/yellow-face/18.png"
                                                                                   alt="sticker"/></span>
      <span @click="showTip=(showTip==='markdown')?false:'markdown'" title="markdown语法"><svg-icon
        name="markdown"/></span>
      <my-button @click="$emit('update:editing', !editing)">{{ editing ? '预览' : '编辑' }}</my-button>
    </div>
    <div v-show="showTip==='markdown'&&editing" class="flex markdown-tips">
      <ul>
        <li v-for="tip in markdownTips" :key="tip.regx">
          <b>{{ tip.regx }}</b>
          <span>{{ tip.description }}</span>
        </li>
      </ul>
    </div>
    <div v-show="showTip==='sticker'&&editing" class="flex stickers" :style="{height: stickerHeight+'px'}">
      <div class="tab flexc">
        <span v-for="k in stickerKeys" @click="stickerNow=k" :key="k" :style="{height: 100/stickerKeys.length+'%'}"
              :class="{active: k===stickerNow}">{{ stickers[k].name }}</span>
      </div>
      <div class="contain">
        <div :style="{transform: 'translateY('+stickerOffset+')'}">
          <div v-for="sticker in stickerKeys" :key="sticker" class="flex" :style="{height: stickerHeight+'px'}">
            <span v-for="i in stickers[sticker].len" :key="i" @click="insertSticker(sticker+'/'+i)">
              <img :src="'/sticker/'+sticker+'/'+i+'.png'" :alt="sticker+i"/>
            </span>
          </div>
        </div>
      </div>
    </div>
    <textarea ref="input" v-show="editing" class="text" v-model="text" placeholder="内容"></textarea>
    <article v-show="!editing" v-viewer ref="markdown" class="--markdown" v-html="parsedMd"/>
  </div>
</template>

<script>
import {afterInsertHtml, parseMarkdown} from "~/utils/markdown";
import pangu from "pangu";
import {
  decrypt,
  encrypt,
  inBrowser,
  insertAtCursor,
  markdownTips,
  notify,
} from "~/utils/utils";
import hljs from 'highlight.js';
import '~/assets/style/markdown.scss';
import MyButton from "~/comps/button";

export default {
  name: "mdEditor",
  components: {MyButton},
  props: {
    editing: {
      type: Boolean,
      default: true
    },
    canEncrypt: {
      type: Boolean,
      default: false
    },
    encrypted: {
      type: Boolean,
      default: false
    },
    textInput: {
      type: String,
      default: ''
    },
    hasMenu: {
      type: Boolean,
      default: false
    },
    stickers: Object
  },
  data() {
    const stickerKeys = Object.keys(this.stickers || {});
    return {
      showTip: false,
      stickerHeight: 200,
      markdownTips,
      menu: [],
      text: this.textInput,
      doEncrypt: this.$props.encrypted,
      stickerKeys,
      stickerNow: stickerKeys[0],
    }
  },
  computed: {
    stickerOffset() {
      for (let i = 0; i < this.stickerKeys.length; i++) {
        if (this.stickerKeys[i] === this.stickerNow) {
          return -i * this.stickerHeight + 'px'
        }
      }
    },
    parsedMd() {
      if (inBrowser) {
        const dom = new DOMParser().parseFromString(parseMarkdown(this.text), 'text/html');
        // hljs
        dom.querySelectorAll('pre>code').forEach(el => {
          const dotes = document.createElement('div');
          const lang = document.createElement('small');
          const language = el.className.replace(/^.*?language-([^ ]+).*?$/, '$1');
          lang.innerText = (hljs.getLanguage(language) || {name: language}).name;
          el.parentElement.insertBefore(dotes, el);
          el.parentElement.insertBefore(lang, dotes);
          hljs.highlightBlock(el);
        })
        // menu
        if (this.hasMenu) {
          this.menu = [];
          dom.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(el => {
            const size = ['H1', 'H2', 'H3'].includes(el.tagName) ? 'big' : 'small';
            this.menu.push({size, text: el.innerText, url: el.querySelector('a').getAttribute('href')})
          })
        }
        return new XMLSerializer().serializeToString(dom);
      }
      return ''
    },
    isAuthor() {
      return this.isAuthor_()
    },
    encryptor() {
      return this.encryptor_()
    },
  },
  watch: {
    textInput() {
      this.text = this.textInput;
    },
    parsedMd: {
      immediate: true,
      handler() {
        this.$nextTick(() => {
          if (!inBrowser) return;
          pangu.spacingElementByClassName('--markdown');
          afterInsertHtml(this.$refs.markdown, true);
        })
      }
    },
    showTip() {
      if (this.showTip && !this.editing) {
        notify({
          title: '警告',
          type: 'warn',
          text: '请先打开编辑！'
        })
      }
    }
  },
  inject: ['encryptor_', 'isAuthor_'],
  methods: {
    insertSticker(alt) {
      this.text = insertAtCursor(`![sticker](${alt})`, this.$refs.input);
    },
    encrypt(text) {
      return this.doEncrypt ? encrypt(text, this.encryptor) : text;
    },
    decrypt() {
      if (this.doEncrypt && !this.encryptor) {
        return notify({
          title: '警告',
          type: 'warn',
          text: '选择加密时，密码不能为空！'
        })
      }
      this.text = decrypt(this.text, this.encryptor);
      this.menu = this.hasMenu ? this.menu.map(m => ({
        size: m.size,
        text: decrypt(m.text, this.encryptor),
        url: decrypt(m.url, this.encryptor),
      })) : [];
      this.$emit('decrypt');
    },
    getData() {
      return {
        doEncrypt: this.doEncrypt,
        text: this.encrypt(this.text),
        mdHtml: this.encrypt(this.$refs.markdown.innerHTML),
        menu: this.hasMenu ? this.menu.map(m => ({
          size: m.size,
          text: this.encrypt(m.text),
          url: this.encrypt(m.url),
        })) : []
      }
    }
  }
}
</script>

<style lang="scss">
@import "assets/style/var";
.md-editor{
  width: 88vw;
  margin: 20px 0;
  > .action{
    align-self: stretch;
    margin-bottom: 5px;
    padding: 0 8px;
    input{
      margin-right: 8px;
      &:not([type]){
        font-size: 14px;
        padding: 4px 8px;
        width: 100px;
      }
      &[type]{
        width: 16px;
        height: 16px;
      }
    }
    > span{
      cursor: pointer;
      width: 24px;
      height: 24px;
      margin-right: 15px;
      padding: 5px;
      transition: $common-transition;
      border-radius: 3px;
      &:hover{
        background: #e0e0e0;
      }
      img, svg{
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }
  }
  .stickers{
    border: 1px solid gray;
    margin-bottom: 10px;
    .tab{
      height: 100%;
      flex-shrink: 0;
      align-items: start;
      align-self: stretch;
      width: 22px;
      span{
        cursor: pointer;
        text-align: center;
        writing-mode: tb;
        transition: $common-transition;
        font-size: 13px;
        padding: 0 3px;
        &:hover{
          background: #e7e7e7;
        }
        &.active{
          background: #4f4f4f;
          color: white;
        }
      }
    }
    .contain{
      overflow: hidden;
      height: 100%;
      > div{
        div{
          flex-wrap: wrap;
          overflow: auto;
          span{
            width: 30px;
            height: 30px;
            padding: 5px;
            display: flex;
            align-items: center;
            cursor: pointer;
            transition: $common-transition;
            &:hover{
              background: #e0e0e0;
            }
            img{
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
          }
        }
      }
    }
  }
  .markdown-tips{
    width: 100%;
    margin-bottom: 20px;
    ul{
      li{
        font-size: 13px;
        margin-bottom: 8px;
        b{
          color: #2eb1c9;
          margin-right: 8px;
          white-space: break-spaces;
          display: inline-block;
        }
        span{
        }
      }
    }
  }
  textarea{
    font-size: 15px;
    padding: 5px;
    align-self: stretch;
    height: 80vh;
    resize: vertical;
  }
}
@include mobile{
  .md-editor {
    width: 95vw;
  }
}
</style>
