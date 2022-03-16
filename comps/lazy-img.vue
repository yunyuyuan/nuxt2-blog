<template>
  <span class="--lazy-img" :style="style" :class="{loading, err}" :title="title" @click="containerClick">
    <span v-if="loading || err" class="svg flexc s100">
      <svg-icon :name="err? 'img-error':'loading'"/>
      <span class="tips" v-show="err">click to reload</span>
    </span>
    <img v-if="!outView && !err" :style="imgStyle" :alt="alt" v-bind:[viewerAttr]="viewer" :src="src" @error="loadFinish(true)" @load="loadFinish(false)" @abort="loadFinish(true)"/>
  </span>
</template>

<script>
import {viewerAttr} from "~/plugins/viewer";
import {addScrollListener, rmScrollListener} from "~/utils/scroll-event";

export default {
  name: "lazy-img",
  props: {
    src: String,
    alt: String,
    size: Array,
    viewer: Boolean,
    compStyle: String,
    imgStyle: String,
    title: String,
  },
  data () {
    return {
      viewerAttr,
      outView: true,
      err: false,
      imgLoading: true,
      height: 0,
      width: 0,
    }
  },
  computed: {
    loading () {
      return this.outView||this.imgLoading;
    },
    style() {
      if (!this.loading && !this.err) {
        return this.$props.compStyle;
      }
      return this.$props.compStyle || (this.size ? {
          width: this.size[0],
          height: this.size[1]
        } : '');
    }
  },
  mounted() {
    this.height = this.$el.scrollHeight;
    this.width = this.$el.scrollWidth;
    this.refreshView();
    this.$nextTick(() => {
      addScrollListener(this.refreshView);
    })
  },
  methods: {
    containerClick () {
      if (this.err) {
        this.err = false;
        this.imgLoading = true;
      }
    },
    loadFinish (err){
      this.imgLoading = false;
      this.err = err;
    },
    refreshView () {
      if (!this.outView) return;
      const height = window.innerHeight,
            contractY = this.$el.getBoundingClientRect().y - height;
      const width = window.innerWidth,
            contractX = this.$el.getBoundingClientRect().x - width;
      if (contractY < 0 && contractY > (-height-this.height)
          &&
          contractX < 0 && contractX > (-width-this.width)
        ) {
        this.outView = false;
        // 取消监听
        rmScrollListener(this.refreshView);
      }
    }
  }
}
</script>

<style lang="scss">
@import "assets/style/var";

.--lazy-img {
  overflow: hidden;
  position: relative;
  display: inline-flex;
  &.err {
    cursor: pointer;
  }
  .svg {
    background: rgba($background, 0.5);
    justify-content: center;
    position: absolute;
    top: 0;
    left: 0;
    svg {
      width: 30px;
      height: 30px;
    }
  }
  .tips {
    font-size: 12px;
    height: 12px;
    color: #ff4444;
  }
}
</style>
