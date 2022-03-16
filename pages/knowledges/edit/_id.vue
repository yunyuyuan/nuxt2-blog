<template>
  <div class="knowledges-editor flexc">
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
        <md-editor
          ref="mdEditor"
          :editing.sync="editing"
          :canEncrypt="false"
          :has-menu="false"
          :text-input="text"
          :stickers="stickers"/>
      </div>
    </div>
  </div>
</template>

<script>
import EditHeader from "~/comps/edit-header";
import { markdownTips, notify, processJSON, randomId} from "~/utils/utils";
import {createCommit} from "~/utils/github";
import {knowledgeList, knowledgeTypeList} from "~/utils/data";
import MyButton from "~/comps/button";
import {cloneDeep} from "lodash/lang";
import {getNow} from "~/utils/_dayjs";
import MdEditor from "~/comps/mdEditor";

export default {
  name: "edit",
  components: {MdEditor, MyButton, EditHeader},
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

      stickers: $stickers,
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
      const { text } = this.$refs.mdEditor.getData();
      localStorage.setItem(this.draftId, JSON.stringify({
        title: this.title,
        link: this.link,
        cover: this.cover,
        type: this.type,
        summary: this.summary,
        text,
      }));
    },
    async updateKnowledge () {
      const { text, mdHtml } = this.$refs.mdEditor.getData();
      if (!text || !this.title || !this.cover || !this.summary || !this.type) {
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
          content: text
        },{
          path: `rebuild/knowledges/${newId}.html`,
          content: mdHtml
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

<style lang="scss">
@import "assets/style/var";

.knowledges-editor {
  max-width: 800px;
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
      >textarea {
        font-size: 15px;
        padding: 5px;
        resize: vertical;
        align-self: stretch;
        width: 80%;
        height: 150px;
        margin: auto;
      }
    }
  }
}
@include mobile{
  .knowledges-editor{
    width: calc(100% - 20px);
    padding: 0 10px;
    >.body{
      > .edit{
        >input, >.sub, >textarea{
          width: 92%;
        }
      }
    }
  }
}
</style>
