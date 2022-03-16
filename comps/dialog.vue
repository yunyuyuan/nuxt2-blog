<template>
  <div class="dialog" @click.self="$emit('cancel')">
    <div class="flexc">
      <b>输入密码</b>
      <input v-model="val" @keydown.enter="$emit('ok', val)"/>
      <div class="btns flex">
        <my-button theme="default" @click="$emit('cancel')">取消</my-button>
        <my-button @click="$emit('ok', val)">确认</my-button>
      </div>
    </div>
  </div>
</template>

<script>
import MyButton from "~/comps/button";
export default {
  name: "the-dialog",
  props: ['value'],
  components: {MyButton},
  data () {
    return {
      val: this.$props.value
    }
  }
}
</script>

<style lang="scss">
@import "assets/style/var";

.dialog {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: $z-index-dialog;
  background: rgba(0, 0, 0, .4);
  >div{
    background: white;
    padding: 20px 60px;
    border-radius: 10px;
    margin: 100px auto 0 auto;
    max-width: 200px;
    width: 200px;
    box-shadow: 0 0 20px rgba(0, 0, 0, .2);
    b{
      font-size: 20px;
    }
    input {
      font-size: 16px;
      margin: 20px 0;
      padding: 4px 8px;
      width: 160px;
    }
    .btns{
      button {
        width: 60px;
        &:first-of-type {
          margin-right: 10px;
        }
      }
    }
  }
}
@include mobile {
.dialog {
  >div {
    width: calc(80% - 120px);
    padding: 20px 60px;
  }
}
}
</style>
