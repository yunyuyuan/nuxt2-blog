<template>
  <div :class="{'in-about': inAbout}">
    <Header @prompt="inputPwd" @goto-author="encryptor=true"/>
    <section id="body">
      <Nuxt />
    </section>
    <Footer/>
    <notification/>
    <the-dialog @cancel="showPrompt=false" @ok="showPrompt=false;encryptor=$event" :value="encryptor" v-show="showPrompt"/>
  </div>
</template>

<script>
import Header from '~/comps/header';
import Footer from '~/comps/footer';
import Notification from "~/comps/notification";
import {inBrowser} from "~/utils/utils";
import 'assets/style/viewer.css';
import {isAuthor} from "~/utils/github";
import TheDialog from "~/comps/dialog";
import {initScrollTrigger} from "~/utils/scroll-event";

export default {
  name: "default",
  components: {TheDialog, Notification, Header, Footer},
  data () {
    return {
      isAuthor: false,
      encryptor: '',
      showPrompt: false
    }
  },
  computed: {
    isAuthor__ () {
      return this.isAuthor
    },
    encryptor__ () {
      return this.encryptor
    },
    inAbout () {
      return this.$route.path.startsWith('/about')
    }
  },
  provide() {
    return {
      encryptor_: () => this.encryptor__,
      isAuthor_: () => this.isAuthor__
    }
  },
  async mounted() {
    if (inBrowser) {
      initScrollTrigger();
      // init code theme
      document.body.setAttribute('code-theme', localStorage.getItem('code-theme') || 'light');
      if (await isAuthor()) {
        this.isAuthor = true;
      }
    }
  },
  methods: {
    inputPwd (){
      if (this.isAuthor) {
        this.showPrompt = true;
      }
    }
  }
}
</script>
