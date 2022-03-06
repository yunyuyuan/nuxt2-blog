<template>
  <div class="record-detail">
    <div v-viewer class="images" ref="img">
      <lazy-img viewer v-for="img in item.images" :key="img.src" :alt="img.alt" :src="img.src" :size="['300px', '300px']" :title="img.alt"/>
    </div>
    <div class="text">
      <p :title="'作成于 '+$options.filters.formattime(item.time)+'，更新于 '+$options.filters.formattime(item.modifyTime)">
        <svg-icon name="write"/>
        <time>{{ item.time | time }}</time>
      </p>
      <span v-html="text"></span>
    </div>
  </div>
</template>

<script>
import {recordList} from "~/utils/data";
import {cloneDeep} from "lodash/lang";

export default {
  name: "index",
  data() {
    return {
    }
  },
  async asyncData({params}) {
    const id = parseInt(params.id);
    const item = recordList.find(record => record.id === id);
    const text = (await import(`!!raw-loader!~/rebuild/records/${id}.txt`)).default;
    return {
      item: cloneDeep(item),
      text
    }
  },
  methods: {
  }
}
</script>

<style scoped lang="scss">
@import "assets/style/var";
.record-detail{
  margin: 30px 20px 80px 20px;
  min-width: 800px;
  .images {
    display: flex;
    flex-wrap: wrap;
    ::v-deep img {
      margin: 0 10px 10px 0;
      max-width: 600px;
      max-height: 300px;
    }
  }
  .text{
    margin-top: 10px;
    p {
      border-bottom: 1px solid #b9b9b9;
      svg {
        width: 16px;
        height: 16px;
      }
      time{
        font-size: 12px;
        line-height: 16px;
      }
    }
    span{
      font-size: 15px;
      letter-spacing: .5px;
      line-height: 28px;
      font-family: $font-source-han-sans;
      padding: 8px;
      display: block;
      word-break: break-word;
      white-space: pre-line;
    }
  }
}
@include mobile{
  .record-detail{
    min-width: unset;
  }
}
</style>
