<template>
  <div class="articles-editor flexc">
    <edit-header :is-new="id==='new'" :draft-id="draftId" :acting="updating" :can-delete="!!item" @loadDraft="loadDraft" @saveDraft="saveDraft" @update="updateArticle" @delete="deleteArticle"/>
    <div class="body">
      <div class="edit flexc">
        <input class="title" v-model="title" placeholder="标题"/>
        <input class="tags" v-model="tags" placeholder="标签"/>
        <md-editor
          ref="mdEditor"
          :editing.sync="editing"
          :canEncrypt="true"
          :has-menu="true"
          :encrypted="doEncrypt"
          :text-input="text"
          :stickers="stickers"
          @decrypt="decrypt"/>
      </div>
    </div>
  </div>
</template>

<script>
import EditHeader from "~/comps/edit-header";
import {
  encrypt,
  decrypt,
  notify,
  processJSON,
  randomId
} from "~/utils/utils";
import {createCommit} from "~/utils/github";
import {articleList} from "~/utils/data";
import MyButton from "~/comps/button";
import {cloneDeep} from "lodash/lang";
import {getNow} from "~/utils/_dayjs";
import MdEditor from "~/comps/mdEditor";

export default {
  name: "edit",
  components: {MdEditor, MyButton, EditHeader},
  data () {
    return {
      updating: false,
      editing: true
    }
  },
  head () {
    return {
      title: this.item?.title
    }
  },
  async asyncData({$stickers, params}) {
    const id = parseInt(params.id)||'new';
    const item = cloneDeep(articleList.find(v => v.id===id));
    return {
      stickers: $stickers,
      id,
      draftId: `draft-article-${id}`,
      item,
      title: item?item.title:'',
      tags: item?item.tags.join(','):'',
      text: item?(await import(`!!raw-loader!~/rebuild/articles/${id}.md`)).default:'',
      menu: item?item.menu:[],
      doEncrypt: item?item.encrypt:false,
    }
  },
  computed: {
    encryptor() {
      return this.encryptor_()
    },
  },
  inject: ['encryptor_'],
  methods: {
    decrypt () {
      this.title = decrypt(this.title, this.encryptor);
    },
    loadDraft (data) {
      this.title = data.title;
      this.tags = data.tags;
      this.text = data.text;
    },
    saveDraft () {
      const { doEncrypt, text } = this.$refs.mdEditor.getData();
      const title = this.title;
      localStorage.setItem(this.draftId, JSON.stringify({
        title: doEncrypt ? encrypt(title, this.encryptor) : title,
        tags: this.tags,
        text,
      }));
    },
    async updateArticle () {
      const { doEncrypt, text, mdHtml, menu } = this.$refs.mdEditor.getData();
      const title = this.title;
      if (!text || !title) {
        return notify({
          title: '字段错误',
          type: 'error',
          text: '标题或内容不能为空!'
        })
      }
      this.updating = true;
      const now = getNow();
      const newId = this.item ? this.id : randomId(articleList.map(v => v.id));
      if (await createCommit(` update article:${this.id}`, [processJSON('article', articleList, json => {
          const newData = {
            title: doEncrypt ? encrypt(title, this.encryptor) : title,
            id: newId,
            time: this.item ? this.item.time : now,
            modifyTime: now,
            len: text.length,
            encrypt: doEncrypt,
            menu,
            tags: doEncrypt ? [] : this.tags.split(',')
          }
          if (this.item) {
            Object.assign(json.find(v => v.id === this.id), newData)
          } else {
            json.push(newData)
          }
        }),{
          path: `rebuild/articles/${newId}.md`,
          content: text
        },{
          path: `rebuild/articles/${newId}.html`,
          content: mdHtml
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

<style lang="scss">
@import "assets/style/var";

.articles-editor {
  max-width: 800px;
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
    }
  }
}
@include mobile{
  .articles-editor{
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
