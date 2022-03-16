<template>
  <div class="edit-header flex w100">
    <svg-icon name="new" v-if="isNew"/>
    <div class="input flex">
      <input v-model="token" placeholder="输入token" @change="updateToken"/>
      <input type="checkbox" v-model="saveToken" title="记住token"/>
    </div>
    <div class="draft flex">
      <my-button theme="default" size="small" @click="emit('loadDraft')" :disabled="!hasDraft" title="加载草稿">加载</my-button>
      <my-button theme="default" size="small" @click="emit('saveDraft')" title="保存草稿">保存</my-button>
      <my-button theme="danger" size="small" @click="emit('delDraft')" :disabled="!hasDraft" title="删除草稿">删除</my-button>
    </div>
    <div class="action flex">
      <my-button :loading="acting&&action==='update'" @click="emit('update')" :disabled="acting">上传</my-button>
      <my-button theme="danger" :loading="acting&&action==='delete'" @click="emit('delete')" :disabled="acting||!canDelete">删除</my-button>
    </div>
  </div>
</template>

<script>
import MyButton from "~/comps/button";
import {token} from "~/utils/data";
import {inBrowser} from "~/utils/utils";

export default {
  name: "edit-header",
  components: {MyButton},
  props: {
    isNew: Boolean,
    draftId: String,
    canDelete: Boolean,
    acting: Boolean,
  },
  data() {
    return {
      saveToken: !!token.value,
      token: token.value||'',
      hasDraft: false,
      action: null
    }
  },
  watch: {
    saveToken() {
      if (this.saveToken) {
        localStorage.setItem('token', token.value);
      } else {
        localStorage.removeItem('token');
      }
    }
  },
  created() {
    this.refreshDraft()
  },
  methods: {
    refreshDraft (){
      this.hasDraft = inBrowser?localStorage.getItem(this.draftId):false;
    },
    emit (event) {
      switch (event) {
        case 'loadDraft':
          this.$emit(event, JSON.parse(localStorage.getItem(this.draftId)))
          this.refreshDraft()
          break
        case 'delDraft':
          localStorage.removeItem(this.draftId);
          this.refreshDraft()
          break
        case 'saveDraft':
          this.$emit(event);
          this.refreshDraft()
          break
        case 'update':
        case 'delete':
          this.$emit(event);
          this.action = event;
          break
      }
    },
    updateToken (e) {
      token.value = e.target.value;
    }
  }
}
</script>

<style lang="scss">
@import "assets/style/var";

.edit-header{
  margin: 10px 0;
  justify-content: flex-end;
  svg {
    width: 36px;
    height: 36px;
    fill: #ff6300;
    margin-right: auto;;
  }
  .input{
    input:not([type]){
      align-self: stretch;
      padding: 4px 6px;
      margin: 5px 0;
      width: 200px;
    }
    input[type]{
      margin-left: 5px;
      width: 16px;
      height: 16px;
    }
  }
  .draft{
    margin: 0 20px 0 10px;
    button {
      margin-left: 7px;
    }
  }
  .action{
    button {
      margin-left: 10px;
    }
  }
}
@include mobile{
  .edit-header {
    flex-wrap: wrap;
    .input {
      width: calc(100% - 45px);
      input:not([type]) {
        flex-grow: 1;
      }
    }
  }
}
</style>
