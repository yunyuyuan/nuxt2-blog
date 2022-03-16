<template>
  <div class="article-list flexc">
    <div class="head flex">
      <div class="tags flex">
        <the-tag v-for="tag in articleTagList" :key="tag" :active="tags.includes(tag)" @click="toggleTags(tag)">
          {{ tag }}
        </the-tag>
      </div>
      <span class="num"><b>{{ filteredList.length }}</b>篇</span>
    </div>
    <div class="body flexc">
      <ul class="w100">
        <li v-for="item in filteredList" :key="item.id">
          <NuxtLink :to="'/articles/'+String(item.id)">
            <b>{{ item.encrypt?decrypt(item.title):item.title }}</b>
            <div class="foot flex">
              <span :title="$options.filters.formattime(item.time)">{{ item.time | time }}</span>
              <b></b>
              <span>{{ item.len }}字</span>
            </div>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import {articleList, articleTagList} from '~/utils/data'
import {decrypt} from "~/utils/utils";
import TheTag from "../../comps/tag";

export default {
  name: "index",
  components: {TheTag},
  data() {
    return {
      articleTagList
    }
  },
  computed: {
    filteredList() {
      return articleList.filter(item =>
        this.tags.every(tag => item.tags.includes(tag))
        &&
        (!item.encrypt || (item.encrypt&&this.isAuthor)))
    },
    tags () {
      try {
        const tags = this.$route.query.tag;
        return tags ? (tags.split(',')) : [];
      } catch (e) {
        return []
      }
    },
    isAuthor() {
      return this.isAuthor_()
    },
    encryptor() {
      this.$forceUpdate();
      return this.encryptor_()
    },
  },
  inject: ['encryptor_', 'isAuthor_'],
  methods: {
    decrypt (text) {
      return decrypt(text, this.encryptor)
    },
    toggleTags(tag) {
      const newTags = this.tags;
      if (newTags.includes(tag)) {
        newTags.splice(newTags.findIndex(v=>v===tag), 1)
      } else {
        newTags.push(tag);
      }
      this.$router.replace('/articles?tag=' + newTags.join(','))
    }
  }
}
</script>

<style lang="scss">
@import "assets/style/var";
.article-list{
  width: 800px;
  margin: 0 auto 40px 0;
  align-items: flex-start;
  .head{
    margin: 10px 20px;
    align-self: stretch;
    .tags{
      flex-wrap: wrap;
      .common-tag {
        margin: 0 10px 10px 0;
      }
    }
    .num {
      font-size: 12px;
      margin-left: auto;
      b{
        margin-right: 3px;
        color: #ff8100;
      }
    }
  }
  .body{
    $footer-color: #7c7c7c;
    $footer-hover: black;
    align-self: stretch;
    margin: 0 20px;
    ul{
      list-style: none;
      li{
        &:not(:last-of-type){
          margin-bottom: 16px;
        }
        > a{
          border-bottom: 1px solid #e1e1e1;
          padding: 8px 0 12px 8px;
        }
        &:hover{
          > a{
            b{
              text-decoration: underline;
            }
            .foot{
              color: $footer-hover;
              b{
                background: $footer-hover;
              }
            }
          }
        }
        >a{
          transition: $common-transition;
          display: block;
          text-decoration: none;
          &:active b{
            text-decoration: underline;
          }
          b{
            color: $title-color;
            font-size: 16px;
            min-height: 20px;
            line-height: 20px;
            display: block;
            transition: $common-transition;
            word-break: break-word;
            font-family: $font-title;
            letter-spacing: 0.2px;
          }
          .foot{
            margin-top: 5px;
            font-size: 13px;
            color: $footer-color;
            transition: $common-transition;
            height: 18px;
            span{
            }
            b{
              height: 60%;
              margin: 0 8px;
              width: 1px;
              background: $footer-color;
            }
          }
        }
      }
    }
  }
}
@include mobile{
  .article-list {
    width: 100%;
    .head, .body {
      margin-left: 10px;
      margin-right: 10px;
    }
  }
}
</style>
