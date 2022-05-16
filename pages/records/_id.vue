<template>
  <div class="record-detail">
    <div v-viewer class="images" ref="img">
      <lazy-img
        viewer
        v-for="img in item.images"
        :key="img.src"
        :alt="img.alt"
        :src="img.src"
        :size="['300px', '300px']"
        :title="img.alt"
      />
    </div>
    <div class="text">
      <p
        :title="'作成于 ' + $options.filters.formattime(item.time) + '，更新于 ' + $options.filters.formattime(item.modifyTime)"
      >
        <svg-icon name="write" />
        <time>{{ item.time | time }}</time>
      </p>
      <article ref="markdown" class="--markdown" v-html="html"></article>
    </div>
  </div>
</template>

<script>
import { recordList } from "~/utils/data";
import { cloneDeep } from "lodash/lang";
import { afterInsertHtml, parseMarkdown } from "~/utils/markdown";

export default {
  name: "index",
  async asyncData({ params }) {
    const id = parseInt(params.id);
    const item = recordList.find(record => record.id === id);
    const markdown = (await import(`!!raw-loader!~/rebuild/records/${id}.md`)).default;
    const html = parseMarkdown(markdown);
    return {
      item: cloneDeep(item),
      html
    }
  },
  mounted() {
    afterInsertHtml(this.$refs.markdown);
  }
}
</script>

<style lang="scss">
@import "assets/style/var";
.record-detail {
  margin: 30px 20px 80px 20px;
  min-width: 800px;
  .images {
    display: flex;
    flex-wrap: wrap;
    img {
      margin: 0 10px 10px 0;
      max-width: 600px;
      max-height: 300px;
    }
  }
  .text {
    margin-top: 10px;
    > p {
      border-bottom: 1px solid #b9b9b9;
      svg {
        width: 16px;
        height: 16px;
      }
      time {
        font-size: 12px;
        line-height: 16px;
      }
    }
    article {
      padding: 8px;
    }
  }
}
@include mobile {
  .record-detail {
    min-width: unset;
  }
}
</style>
