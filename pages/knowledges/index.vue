<template>
  <div class="knowledge-list">
    <nav class="flex">
      <span :class="{active: !typeNow}" @click="typeNow=null">全部<b>{{ getFilteredListLength() }}</b></span>
      <span v-for="type in knowledgeTypeList"
            :key="type.key"
            :class="{active: type.key === typeNow}"
            @click="typeNow=type.key">
        {{ type.name }}
        <b>{{ getFilteredListLength(type.key) }}</b>
      </span>
    </nav>
    <div class="body flexc">
      <NuxtLink v-for="item in filteredList" :key="item.id" :to="'/knowledges/'+item.id">
        <svg-icon :name="item.type"/>
        <span>《<b>{{ item.title }}</b>》</span>
        <time :title="$options.filters.formattime(item.time)">{{ item.time | time }}</time>
      </NuxtLink>
    </div>
  </div>
</template>

<script>
import {knowledgeList, knowledgeTypeList} from "~/utils/data";

export default {
  name: "index",
  data () {
    return {
      knowledgeTypeList,
      typeNow: null
    }
  },
  computed: {
    filteredList () {
      if (!this.typeNow) return knowledgeList;
      return knowledgeList.filter(item => item.type === this.typeNow);
    }
  },
  methods: {
    getFilteredListLength (type) {
      if (!type) return knowledgeList.length;
      return knowledgeList.filter(item => item.type === type).length;
    }
  }
}
</script>

<style lang="scss">
@import "assets/style/var";

.knowledge-list{
  width: 800px;
  nav{
    width: 100%;
    border-bottom: 1px solid #b4b4b4;
    justify-content: center;
    margin: 40px auto 10px auto;
    >span{
      cursor: pointer;
      transition: $common-transition;
      border-radius: 6px 6px 0 0;
      font-size: 15px;
      padding: 5px 10px;
      display: flex;
      align-items: center;
      &:hover {
        background: #e1e1e1;
      }
      &.active {
        background: #2eb1c9;
        color: white;
        box-shadow: 0 0 6px rgba(0, 0, 0, .3);
      }
      b{
        font-size: 12px;
        width: 25px;
        height: 17px;
        line-height: 17px;
        text-align: center;
        background: #e28d5b;
        color: white;
        border-radius: 8px;
        margin-left: 4px;
      }
    }
  }
  .body {
    width: 88%;
    margin: auto;
    a {
      display: flex;
      align-items: center;
      width: 100%;
      text-decoration: none;
      padding: 25px 0 15px 0;
      transition: $common-transition;
      border-radius: 5px;
      position: relative;
      &:after {
        content: '';
        width: 100%;
        height: 1px;
        position: absolute;
        bottom: 0;
        left: 0;
        background: #e1e1e1;
      }
      &:not(:last-of-type) {
        margin-bottom: 8px;
      }
      svg{
        width: 22px;
        height: 22px;
        margin: 0 8px;
        flex-shrink: 0;
      }
      span{
        position: relative;
        font-size: 10px;
        &:after {
          position: absolute;
          left: 10px;
          bottom: -3px;
          content: '';
          width: calc(100% - 20px);
          height: 1.5px;
          background: #00a4a4;
          opacity: 0;
          transition: $common-transition;
        }
        b{
          font-size: 18px;
          color: $title-color;
          margin: 0 4px;
          line-height: 22px;
          font-family: $font-title;
        }
      }
      time {
        font-size: 12px;
        color: #696969;
        margin: 0 5px 0 auto;
        align-self: flex-end;
        transition: $common-transition;
        word-break: keep-all;
      }
      &:hover {
        span:after {
          opacity: 1;
        }
        time {
          color: #000000;
        }
      }
    }
  }
}
@include mobile{
  .knowledge-list {
    width: 100%;
    nav, .body {
      width: calc(100% - 20px);
    }
  }
}
</style>
