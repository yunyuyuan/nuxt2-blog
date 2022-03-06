<template>
  <svg class="icon-svg" aria-hidden="true">
    <use :href="icon"></use>
  </svg>
</template>

<script>
export default {
  name: "svg-icon",
  props: {
    name: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      icon: ''
    }
  },
  watch: {
    name: {
      handler() {
        import(`~/assets/svg/${this.name}.svg`).then(res => {
          this.icon = `#icon-${this.name}`;
        })
      },
      immediate: true
    }
  }
}
</script>

<style scoped lang="scss">
svg {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
