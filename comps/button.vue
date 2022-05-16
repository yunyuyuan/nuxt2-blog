<template>
  <button class="common-button flex" :disabled="disabled" :class="[size, theme]" @click="$emit('click', $event)">
    <svg-icon v-if="icon||loading" :name="loading?'loading':icon"/>
    <span><slot/></span>
  </button>
</template>

<script>
export default {
  name: "my-button",
  props: {
    icon: String,
    loading: Boolean,
    disabled: Boolean,
    theme: {
      type: 'default'|'primary'|'danger',
      default: 'primary'
    },
    size: {
      type: String,
      default: 'medium'
    }
  },
}
</script>

<style lang="scss">
@import "assets/style/var";

button.common-button {
  padding: 0 10px;
  height: 30px;
  border-radius: 3px;
  justify-content: center;
  border: none;
  background: #2eb1c9;
  transition: $common-transition;
  box-shadow: 0 0 4px rgb(0 135 255 / 52%);
  cursor: pointer;
  color: white;
  &:hover {
    background: #2695a9;
  }
  &:active {
    background: #32c2dc;
  }
  &.default {
    background: #ffffff;
    box-shadow: 0 0 4px rgba(84, 70, 70, 0.2);
    color: black;
    border: 1px solid #9a9a9a;
    svg {
      fill: black;
    }
    &:hover {
      background: #f6f6f6;
    }
    &:active {
      background: #f6fffe;
    }
  }
  &.danger {
    background: #ff4c4c;
    box-shadow: 0 0 4px rgb(255 0 0 / 45%);
    &:hover {
      background: #dc4040;
    }
    &:active {
      background: #ff5e5e;
    }
  }
  &:disabled {
    background: gray;
    box-shadow: 0 0 4px rgba(0, 0, 0, .4);
    cursor: not-allowed;
    color: white;
    border: none;
    &:hover {
      color: white;
      background: gray;;
    }
  }
  svg {
    width: 20px;
    height: 20px;
    fill: white;
  }
  span {
    font-size: 14px;
    line-height: 14px;
    word-break: keep-all;
  }
  &.small {
    padding: 0 6px;
    height: 25px;
    svg {
      width: 16px;
      height: 16px;
    }
    span {
      font-size: 12px;
      line-height: 12px;
    }
  }
}
</style>
