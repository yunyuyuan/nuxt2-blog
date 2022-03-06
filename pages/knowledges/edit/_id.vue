<template>
  <div class="editor flexc">
    <edit-header :is-new="id==='new'" :draft-id="draftId" :acting="updating" :can-delete="!!item" @loadDraft="loadDraft" @saveDraft="saveDraft" @update="updateKnowledge" @delete="deleteKnowledge"/>
    <div class="body">
      <div class="edit flexc">
        <input class="title" v-model="title" placeholder="标题" title="标题"/>
        <input class="link" v-model="link" placeholder="链接" title="链接"/>
        <div class="sub flex">
          <input class="cover" v-model="cover" placeholder="封面" title="封面"/>
          <select class="type" v-model="type">
            <option :value="null">请选择</option>
            <option v-for="type in knowledgeTypeList" :key="type.key" :value="type.key">{{ type.name }}</option>
          </select>
        </div>
        <textarea class="summary" v-model="summary" placeholder="简介"></textarea>
        <div class="action flex">
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
import {inBrowser, insertAtCursor, markdownTips, notify, processJSON, randomId} from "~/utils/utils";
import hljs from 'highlight.js';
import '~/assets/style/markdown.scss';
import {createCommit} from "~/utils/github";
import {knowledgeList, knowledgeTypeList} from "~/utils/data";
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
      knowledgeTypeList,
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
    const item = cloneDeep(knowledgeList.find(v => v.id===id));
    return {
      id,
      draftId: `draft-knowledge-${id}`,
      item,
      title: item?item.title:'',
      link: item?item.link:'',
      cover: item?item.cover:'',
      type: item?item.type:null,
      summary: item?item.summary:'',
      text: item?(await import(`!!raw-loader!~/rebuild/knowledges/${id}.md`)).default:'',

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
        return new XMLSerializer().serializeToString(dom);
      }
      return ''
    },
    mdHTML () {
      return this.$refs.markdown.innerHTML;
    }
  },
  watch: {
    parsedMd (){
      this.$nextTick(() => {
        pangu.spacingElementByClassName('--markdown');
        afterInsertHtml(this.$refs.markdown, true);
      })
    }
  },
  methods: {
    loadDraft (data) {
      this.title = data.title;
      this.link = data.link;
      this.cover = data.cover;
      this.type = data.type;
      this.summary = data.summary;
      this.text = data.text;
    },
    saveDraft () {
      localStorage.setItem(this.draftId, JSON.stringify({
        title: this.title,
        link: this.link,
        cover: this.cover,
        type: this.type,
        summary: this.summary,
        text: this.text
      }));
    },
    insertSticker (alt) {
      this.text = insertAtCursor(`![sticker](${alt})`, this.$refs.input);
    },
    async updateKnowledge () {
      if (!this.text || !this.title || !this.cover || !this.summary || !this.type) {
        return notify({
          title: '字段错误',
          type: 'error',
          text: '标题或内容不能为空!'
        })
      }
      this.updating = true;
      const now = getNow();
      const newId = this.item ? this.id : randomId(knowledgeList.map(v => v.id));
      if (await createCommit(` update knowledge:${this.id}`, [processJSON('knowledge', knowledgeList, json => {
          const newData = {
            title: this.title,
            link: this.link || '',
            cover: this.cover,
            type: this.type,
            summary: this.summary,
            id: newId,
            time: this.item ? this.item.time : now,
            modifyTime: now,
          }
          if (this.item) {
            Object.assign(json.find(v => v.id === this.id), newData)
          } else {
            json.push(newData)
          }
        }),{
          path: `rebuild/knowledges/${newId}.md`,
          content: this.text
        },{
          path: `rebuild/knowledges/${newId}.html`,
          content: this.mdHTML
      }])) {
        notify({
          title: '完成！',
          type: 'success',
          text: '上传成功!',
        });
        this.$router.replace('/knowledges').then()
      }
      this.updating = false
    },
    async deleteKnowledge () {
      if (this.item && confirm('确认删除?')) {
        this.updating = true;
        if (await createCommit(` delete knowledge:${this.id}`, [processJSON('knowledge', knowledgeList, json => {
            json.splice(json.findIndex(v => v.id === this.id), 1);
          })], [
            {path: `rebuild/knowledges/${this.id}.html`},
            {path: `rebuild/knowledges/${this.id}.md`}
        ])) {
          notify({
            title: '完成！',
            type: 'success',
            text: '删除成功!',
          });
          this.$router.replace('/knowledges').then()
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
        padding: 4px 8px;
        &.title{
          font-size: 20px;
          border-width: 0 0 1px 0;
          border-radius: 0;
        }
        &.link{
          margin-top: 15px;
          font-size: 14px;
        }
      }
      >.sub {
        width: calc(60% + 16px);
        margin: 20px 0;
        input, select {
          padding: 5px 8px;
        }
        input {
          flex-grow: 1;
          margin-right: 10px;
          font-size: 14px;
        }
      }
      >.action {
        align-self: flex-end;
        justify-content: flex-end;
        margin: 15px 0 5px 0;
        padding-top: 15px;
        width: 100%;
        border-top: 2px solid;
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
      >textarea {
        font-size: 15px;
        padding: 5px;
        resize: vertical;
        align-self: stretch;
        &.text{
          height: 500px;
        }
        &.summary {
          width: 80%;
          height: 150px;
          margin: auto;
        }
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
