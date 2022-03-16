import path from "path";
import config from "./config";
import * as fs from "fs";
import dayjs from "./utils/_dayjs";

export default {
  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    meta: [
      {charset: 'utf-8'},
      {
        name: 'viewport',
        content: 'width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no'
      },
      {name: 'description', content: config.SEO_description},
      {name: 'keywords', content: config.SEO_keywords}
    ],
    link: [
      {rel: 'shortcut icon', href: '/favicon.jpg'},
    ],
    script: [
      {
        src: 'https://static.cloudflareinsights.com/beacon.min.js',
        async: false,
        defer: true,
        'data-cf-beacon': `{"token": "${config.CloudflareAnalyze}"}`
      }
    ],
    title: config.title
  },
  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '~/assets/style/main.scss'
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    {src: '~/plugins/filters'},
    {src: '~/plugins/viewer'},
    {src: '~/plugins/global-comp'},
    {src: '~/plugins/stickers.server'},
  ],

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [],
  hooks: {
    generate: {
      done(builder) {
        fs.writeFileSync(path.resolve(__dirname, './dist/sitemap.xml'),
          genRss(JSON.parse(fs.readFileSync(path.resolve(__dirname, './rebuild/json/article.json')).toString())));
        console.log('√ sitemap.xml generated');
      }
    }
  },
  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    extend(config, {isDev, isClient}) {
      if (isClient) {
        config.node = {
          // 跳过dependence检查
          fs: 'empty',
        }
      }
      const svgFolder = path.resolve(__dirname, 'assets/svg');

      const svgRule = config.module.rules.find(rule => rule.test.test('.svg'))
      svgRule.exclude = [svgFolder]

      config.module
        .rules.push({
        test: /\.svg$/,
        loader: 'svg-sprite-loader',
        include: [svgFolder],
        options: {
          symbolId: 'icon-[name]'
        }
      })
    }
  },
}

export function escapeHtml(s) {
  return s.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

class Node {
  tag;
  content;
  children = [];

  constructor(tag, content) {
    this.tag = tag;
    this.content = content;
  }

  addChild(node) {
    this.children.push(node)
  }

  toString() {
    if (this.children.length) {
      return `<${this.tag}>${
        this.children.map(node => node.toString()).join('\n')
      }</${this.tag}>`
    }
    return `<${this.tag}>${escapeHtml(this.content)}</${this.tag}>`
  }
}

function genRss(json) {
  const origin = config.domain,
    startStr = '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0">',
    endStr = '</rss>';

  const channel = new Node('channel');
  channel.addChild(new Node('title', config.title))
  channel.addChild(new Node('link', origin))
  channel.addChild(new Node('description', config.SEO_description))
  channel.addChild(new Node('language', 'zh-cn'))

  for (const i of json.filter(i => !i.encrypt)) {
    const item = new Node('item');
    item.addChild(new Node('author', config.githubName));
    item.addChild(new Node('title', i.title));
    item.addChild(new Node('link', origin + '/articles/' + i.id));
    item.addChild(new Node('pubDate', dayjs.utc(i.time).toString()));
    item.addChild(new Node('guid', i.id));

    channel.addChild(item);
  }
  return `${startStr}${channel.toString()}${endStr}`;
}
