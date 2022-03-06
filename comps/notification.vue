<template>
  <div id="--notification" class="flexc">
    <div v-for="item in list" :key="item.id" :class="item.type" @animationend="animationend(item, $event)">
      <b v-if="item.title" :class="{'not-content': !item.text}">{{item.title}}</b>
      <span>{{item.text}}</span>
      <a @click="clickClose(item, $event)">
        <svg-icon name="close"/>
      </a>
    </div>
  </div>
</template>

<script>
import Vue from "vue";

export default {
  name: "notification",
  data () {
    return {
      id: 0,
      list: []
    }
  },
  created() {
    Vue.prototype.$notify = this.notify;
  },
  methods: {
    notify ({title, type, text}) {
      this.list.forEach(item => item.timeout?clearTimeout(item.timeout):null);
      this.list = [];
      this.list.push({
        id: this.id++,
        title,
        type,
        text
      })
    },
    clickClose (item, e) {
      if (item.timeout) {
        clearTimeout(item.timeout)
      }
      e.currentTarget.parentElement.classList.add('leaving', 'force')
    },
    animationend (item, e){
      if (e.target.classList.contains('leaving')) {
        this.list.splice(this.list.findIndex(v=>v===item));
      } else {
        e.target.classList.add('down');
        item.timeout = setTimeout(() => {
          e.target.classList.add('leaving')
        }, 3000)
      }
    }
  }
}
</script>

<style lang="scss">
@import "assets/style/var";

#--notification{
  position: fixed;
  overflow: visible;
  top: 0;
  right: 0;
  left: 0;
  height: 0;
  z-index: $z-index-notify;
  div{
    position: absolute;
    top: 0;
    min-width: 240px;
    max-width: 480px;
    border-radius: 5px;
    box-shadow: 0 0 8px rgba(0, 0, 0, .6);
    animation: fade-in .15s ease-out forwards;
    background: white;
    padding: 8px 50px 8px 15px;
    overflow: hidden;
    &.leaving {
      animation: fade-out .15s ease-out forwards;
    }
    &.down:not(.force):hover {
      animation-play-state: paused;
    }
    &.success {
      background: linear-gradient(90deg, #f0ffef, #ffffff);
      a {
        background: #a1ffc3;
        &:hover {
         background: #7dffaa;
        }
      }
    }
    &.error {
      background: linear-gradient(90deg, #ffefef, #ffffff);
    }
    &.warn {
      background: linear-gradient(90deg, #fff7ef, #ffffff);
      a {
        background: #ffbc95;
        &:hover {
          background: #ffa46d;
        }
      }
    }
    b{
      display: block;
      font-size: 14px;
      word-break: keep-all;
      margin-bottom: 6px;
      &.not-content {
        margin-bottom: 0;
      }
    }
    span{
      font-size: 12px;
    }
    a{
      position: absolute;
      right: 0;
      top: 0;
      height: 100%;
      width: 30px;
      background: #ffb1b1;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: $common-transition;
      box-shadow: 0 0 5px rgb(0 0 0 / 18%);
      &:hover {
        background: #ff8484;
      }
      svg{
        width: 10px;
        height: 10px;
        fill: black;
      }
    }
  }
  @keyframes fade-in{
    0%{
      transform: translateY(-100%);
      opacity: .2;
    }
    100%{
      transform: translateY(20px);
      opacity: 1;
    }
  }
  @keyframes fade-out{
    100%{
      transform: translateY(-100%);
      opacity: .2;
    }
    0%{
      transform: translateY(20px);
      opacity: 1;
    }
  }
}
</style>
