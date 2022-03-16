<template>
  <div class="records-editor flexc">
    <edit-header :is-new="id==='new'" :draft-id="draftId" :acting="updating" :can-delete="!!item" @loadDraft="loadDraft" @saveDraft="saveDraft" @update="updateArticle" @delete="deleteArticle"/>
    <div class="body">
      <div class="edit flexc">
        <div v-if="!editing" class="preview flex" v-viewer>
          <lazy-img viewer v-for="img in images" :size="['100px', '100px']" :key="img.uid" :alt="img.alt" :src="img.src"/>
        </div>
        <template v-else>
          <label v-for="(img,idx) in images" :key="img.uid">
            <input class="src" placeholder="url" :value="img.src" @change="img.src=$event.target.value"/>
            <input class="alt" placeholder="alt" :value="img.alt" @change="img.alt=$event.target.value"/>
            <my-button theme="danger" size="small" icon="remove" @click="images.splice(idx, 1)" title="移除"/>
            <my-button theme="default" v-if="idx>0" size="small" icon="up" @click="upSrc(idx-1, idx)" title="上移"/>
          </label>
        </template>
        <div class="button flex">
          <my-button icon="add" @click="images.push({src: '', alt: '', uid: uid++})" title="添加"/>
        </div>
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
import {notify, processJSON, randomId} from "~/utils/utils";
import {createCommit} from "~/utils/github";
import {recordList} from "~/utils/data";
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
      preview: false
    }
  },
  async asyncData({$stickers, params}) {
    const id = parseInt(params.id)||'new';
    const item = cloneDeep(recordList.find(v => v.id===id));
    let uid = 0;
    const images = item?item.images.map(i => {
      return Object.assign(i, {
        uid: uid++,
      })
    }):[];
    return {
      stickers: $stickers,
      id,
      draftId: `draft-record-${id}`,
      uid,
      item,
      images,
      text: item?(await import(`!!raw-loader!~/rebuild/records/${id}.md`)).default:'',
    }
  },
  methods: {
    upSrc (idx1, idx2) {
      const tmp = this.images[idx1];
      this.images[idx1] = this.images[idx2];
      this.images[idx2] = tmp;
      this.images[idx1].uid = this.uid ++;
      this.images[idx2].uid = this.uid ++;
    },
    loadDraft (data) {
      this.images = data.images;
      this.text = data.text;
    },
    saveDraft () {
      const { text } = this.$refs.mdEditor.getData();
      localStorage.setItem(this.draftId, JSON.stringify({
        images: this.images,
        text,
      }));
    },
    async updateArticle () {
      const { text, mdHtml } = this.$refs.mdEditor.getData();
      if (!text || !this.images.length || this.images.some(i => !i.src)) {
        return notify({
          title: '字段错误',
          type: 'error',
          text: '图片或内容不能为空!'
        })
      }
      this.updating = true;
      const now = getNow();
      const newId = this.item ? this.id : randomId(recordList.map(v => v.id));
      if (await createCommit(` update record:${this.id}`, [processJSON('record', recordList, json => {
        const newData = {
          id: newId,
          time: this.item ? this.item.time : now,
          modifyTime: now,
          images: this.images.map(i => {return {src: i.src, alt: i.alt}})
        }
        if (this.item) {
          Object.assign(json.find(v => v.id === this.id), newData)
        } else {
          json.push(newData)
        }
      }),{
        path: `rebuild/records/${newId}.md`,
        content: text
      },{
        path: `rebuild/records/${newId}.html`,
        content: mdHtml
      }])) {
        notify({
          title: '完成！',
          type: 'success',
          text: '上传成功!',
        });
        this.$router.replace('/records').then()
      }
      this.updating = false
    },
    async deleteArticle () {
      if (this.item && confirm('确认删除?')) {
        this.updating = true;
        if (await createCommit(` delete record:${this.id}`, [processJSON('record', recordList, json => {
          json.splice(json.findIndex(v => v.id === this.id), 1);
        })], [
          {path: `rebuild/records/${this.id}.md`},
          {path: `rebuild/records/${this.id}.html`},
        ])) {
          notify({
            title: '完成！',
            type: 'success',
            text: '删除成功!',
          });
          this.$router.replace('/records').then()
        }
        this.updating = false
      }
    }
  }
}
</script>

<style lang="scss">
@import "assets/style/var";

.records-editor {
  max-width: 800px;
  padding: 0 20px;
  margin: auto;
  align-items: stretch;
  >.body{
    margin: 20px 0;
    > .edit{
      label{
        display: flex;
        align-items: center;
        width: 100%;
        margin-bottom: 18px;
        input {
          font-size: 13px;
          padding: 6px;
          flex-grow: 0;
          &.src{
            width: 500px;
            margin-right: 8px;
          }
          &.alt{
            width: 100px;
          }
        }
        button {
          margin-left: 10px;
        }
      }
      .preview {
        width: 100%;
        flex-wrap: wrap;
        img {
          margin: 0 8px 8px 0;
          max-width: 200px;
          max-height: 100px;
        }
      }
      >.button {
        margin-bottom: 30px;
        align-self: flex-start;
        button{
          width: 80px;
          margin-right: 10px;
        }
      }
      textarea{
        font-size: 15px;
        padding: 5px;
        align-self: stretch;
        height: 300px;
        resize: vertical;
      }
    }
  }
}
@include mobile{
  .records-editor{
    width: calc(100% - 20px);
    padding: 0 10px;
    >.body{
      > .edit{
      }
    }
  }
}
</style>
