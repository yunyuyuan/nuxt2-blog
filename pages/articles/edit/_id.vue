<template>
  <div class="editor flexc">
    <edit-header :is-new="id==='new'" :draft-id="draftId" :acting="updating" :can-delete="!!item" @loadDraft="loadDraft" @saveDraft="saveDraft" @update="updateArticle" @delete="deleteArticle"/>
    <div class="body">
      <div class="edit flexc">
        <input class="title" v-model="title" placeholder="标题"/>
        <input class="tags" v-model="tags" placeholder="标签"/>
        <div class="action flex">
          <my-button v-if="isAuthor && item && item.encrypt" @click="decrypt" style="margin-right: 8px">解密</my-button>
          <b v-if="isAuthor" style="font-size: 13px">加密:</b>
          <input v-if="isAuthor" v-model="doEncrypt" type="checkbox" title="加密"/>
          <span @click="showTip=(showTip==='sticker')?false:'sticker'" title="表情"><img src="/sticker/yellow-face/18.png"/></span>
          <span @click="showTip=(showTip==='markdown')?false:'markdown'" title="markdown语法"><svg-icon name="markdown"/></span>
          <my-button @click="editing=!editing">{{ editing?'预览':'编辑' }}</my-button>
        </div>
        <div v-show="showTip==='markdown'&&editing" class="flex markdown-tips">
          <ul>
            <li v-for="tip in markdownTips" :key="tip.regx">
              <b>{{tip.regx}}</b>
              <span>{{tip.description}}</span>
            </li>
          </ul>
        </div>
        <div v-show="showTip==='sticker'&&editing" class="flex stickers" :style="{height: stickerHeight+'px'}">
          <div class="tab flexc">
            <span v-for="k in stickerKeys" @click="stickerNow=k" :key="k" :style="{height: 100/stickerKeys.length+'%'}" :class="{active: k===stickerNow}">{{stickers[k].name}}</span>
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
    </div>
  </div>
</template>

<script>
import EditHeader from "~/comps/edit-header";
import {afterInsertHtml, parseMarkdown} from "~/utils/markdown";
import pangu from "pangu";
import {
  decrypt,
  encrypt,
  inBrowser,
  insertAtCursor,
  markdownTips,
  notify,
  processJSON,
  randomId
} from "~/utils/utils";
import hljs from 'highlight.js';
import '~/assets/style/markdown.scss';
import {createCommit} from "~/utils/github";
import {articleList} from "~/utils/data";
import MyButton from "~/comps/button";
import {cloneDeep} from "lodash/lang";
import {getNow} from "~/utils/_dayjs";

export default {
  name: "edit",
  components: {MyButton, EditHeader},
  data () {
    return {
      editing: true,
      updating: false,
      showTip: false,
      stickerHeight: 200,
      markdownTips,
    }
  },
  head () {
    return {
      title: this.item?.title
    }
  },
  async asyncData({$stickers, params}) {
    const id = parseInt(params.id)||'new';
    const stickerKeys = Object.keys($stickers||{});
    const item = cloneDeep(articleList.find(v => v.id===id));
    return {
      id,
      draftId: `draft-article-${id}`,
      item,
      title: item?item.title:'',
      tags: item?item.tags.join(','):'',
      text: item?(await import(`!!raw-loader!~/rebuild/articles/${id}.md`)).default:'',
      menu: item?item.menu:[],
      doEncrypt: item?item.encrypt:false,

      stickerNow: stickerKeys[0],
      stickerKeys,
      stickers: $stickers,
    }
  },
  computed: {
    stickerOffset () {
      for (let i=0;i<this.stickerKeys.length;i++) {
        if (this.stickerKeys[i] === this.stickerNow) {
          return -i*this.stickerHeight+'px'
        }
      }
    },
    parsedMd () {
      if (inBrowser) {
        const dom = new DOMParser().parseFromString(parseMarkdown(this.text), 'text/html');
        // hljs
        dom.querySelectorAll('pre>code').forEach(el => {
          el.parentElement.insertBefore(document.createElement('div'), el);
          hljs.highlightBlock(el);
        })
        // menu
        this.menu = [];
        dom.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(el => {
          const size = ['H1', 'H2', 'H3'].includes(el.tagName) ? 'big':'small';
          this.menu.push({size, text: el.innerText, url: el.querySelector('a').getAttribute('href')})
        })
        return new XMLSerializer().serializeToString(dom);
      }
      return ''
    },
    mdHTML () {
      return this.$refs.markdown.innerHTML;
    },
    isAuthor() {
      return this.isAuthor_()
    },
    encryptor() {
      return this.encryptor_()
    },
  },
  watch: {
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
    showTip (){
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
    encrypt (text) {
      return this.doEncrypt ? encrypt(text, this.encryptor) : text;
    },
    decrypt () {
      this.title = decrypt(this.title, this.encryptor);
      this.text = decrypt(this.text, this.encryptor);
      this.menu = this.menu.map(m => ({
        size: m.size,
        text: decrypt(m.text, this.encryptor),
        url: decrypt(m.url, this.encryptor),
      }))
    },
    loadDraft (data) {
      this.title = data.title;
      this.tags = data.tags;
      this.text = data.text;
    },
    saveDraft () {
      localStorage.setItem(this.draftId, JSON.stringify({
        title: this.title,
        tags: this.tags,
        text: this.text
      }));
    },
    insertSticker (alt) {
      this.text = insertAtCursor(`![sticker](${alt})`, this.$refs.input);
    },
    async updateArticle () {
      if (!this.text || !this.title) {
        return notify({
          title: '字段错误',
          type: 'error',
          text: '标题或内容不能为空!'
        })
      }
      if (!this.encryptor && this.doEncrypt) {
        return notify({
          title: '密码为空',
          type: 'warn',
          text: '选择加密时密码不能为空!'
        })
      }
      this.updating = true;
      const now = getNow();
      const newId = this.item ? this.id : randomId(articleList.map(v => v.id));
      if (await createCommit(` update article:${this.id}`, [processJSON('article', articleList, json => {
          const newData = {
            title: this.encrypt(this.title),
            id: newId,
            time: this.item ? this.item.time : now,
            modifyTime: now,
            len: this.text.length,
            encrypt: this.doEncrypt,
            menu: this.menu.map(m => ({
              size: m.size,
              text: this.encrypt(m.text),
              url: this.encrypt(m.url),
            })),
            tags: this.doEncrypt?[]:this.tags.split(',')
          }
          if (this.item) {
            Object.assign(json.find(v => v.id === this.id), newData)
          } else {
            json.push(newData)
          }
        }),{
          path: `rebuild/articles/${newId}.md`,
          content: this.encrypt(this.text)
        },{
          path: `rebuild/articles/${newId}.html`,
          content: this.encrypt(this.mdHTML)
      }])) {
        notify({
          title: '完成！',
          type: 'success',
          text: '上传成功!',
        });
        this.$router.replace('/articles').then()
      }
      this.updating = false
    },
    async deleteArticle () {
      if (this.item && confirm('确认删除?')) {
        this.updating = true;
        if (await createCommit(` delete article:${this.id}`, [processJSON('article', articleList, json => {
            json.splice(json.findIndex(v => v.id === this.id), 1);
          })], [
            {path: `rebuild/articles/${this.id}.html`},
            {path: `rebuild/articles/${this.id}.md`}
        ])) {
          notify({
            title: '完成！',
            type: 'success',
            text: '删除成功!',
          });
          this.$router.replace('/articles').then()
        }
        this.updating = false
      }
    },
  }
}
</script>

<style scoped lang="scss">
@import "assets/style/var";

.editor {
  width: 800px;
  padding: 0 20px;
  margin: auto;
  align-items: stretch;
  >.body{
    margin: 20px 0;
    > .edit{
      >input{
        width: 60%;
        margin-bottom: 20px;
        font-size: 16px;
        padding: 4px 8px;
        &.title {
          font-size: 20px;
          border-width: 0 0 1px 0;
          border-radius: 0;
        }
      }
      >.action {
        align-self: flex-end;
        margin-bottom: 5px;
        input {
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
        span{
          cursor: pointer;
          width: 24px;
          height: 24px;
          margin-right: 15px;
          padding: 5px;
          transition: $common-transition;
          border-radius: 3px;
          &:hover {
            background: #e0e0e0;
          }
          img, svg {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
        }
      }
      .stickers {
        border: 1px solid gray;
        margin-bottom: 10px;
        .tab {
          height: 100%;
          align-self: stretch;
          span{
            cursor: pointer;
            text-align: center;
            writing-mode: tb;
            transition: $common-transition;
            font-size: 13px;
            padding: 0 3px;
            &:hover {
              background: #e7e7e7;
            }
            &.active {
              background: #4f4f4f;
              color: white;
            }
          }
        }
        .contain {
          overflow: hidden;
          height: 100%;
          >div {
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
                &:hover {
                  background: #e0e0e0;
                }
                img {
                  width: 100%;
                  height: 100%;
                  object-fit: contain;
                }
              }
            }
          }
        }
      }
      .markdown-tips {
        width: 100%;
        margin-bottom: 20px;
        ul {
          li {
            font-size: 13px;
            margin-bottom: 8px;
            b {
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
  }
}
@include mobile{
  .editor{
    width: calc(100% - 20px);
    padding: 0 10px;
    >.body{
      > .edit{
        >input{
          width: 92%;
        }
      }
    }
  }
}
</style>
