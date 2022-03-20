import Vue from "vue";
import {cloneDeep} from "lodash/lang";
import CryptoJS from "crypto-js";
import LazyImg from "~/comps/lazy-img";
import IconSvg from "~/comps/svg-icon.vue";

export const inBrowser = process.client;
export const timeStamp = Date.now();
export const LazyImgComp = Vue.extend(LazyImg);
export const SvgIconComp = Vue.extend(IconSvg);
export const markdownTips = [
  {
    regx: '<<>>',
    description: '段落缩进'
  },
  {
    regx: '#[]()',
    description: 'target=_blank的链接'
  },
  {
    regx: '![sticker](aru/32)',
    description: '阿鲁第32号表情'
  },
  {
    regx: '![我是描述[80% x ]]()',
    description: '宽度80%高度未设的图片'
  },
  {
    regx: '-(red: 文字)-',
    description: '红色的文字'
  },
  {
    regx: '[html][/html]',
    description: '直接插入HTML'
  },
  {
    regx: '[youtube][描述](https://)[/youtube]',
    description: 'youtube视频'
  },
  {
    regx: '[bili][描述](https://)[/bili]',
    description: 'bilibili视频'
  },
  {
    regx: '--标题--\n内容\n-- --',
    description: 'field元素'
  },
]

// 随机 id
const random = (i) => Math.floor(i ? Math.random() * 10 : (Math.random() * 9 + 1)).toString();

export function randomId(exist = [], len = 4) {
  while (true) {
    let id = '';
    for (let i = 0; i < len; i++) {
      id += random(i);
    }
    id = parseInt(id);
    if (!exist.includes(id)) {
      return id;
    }
  }
}

// 处理 json
export function processJSON(name, json, callback) {
  const newJson = cloneDeep(json);
  callback(newJson);
  return {
    path: `rebuild/json/${name}.json`,
    // 按照时间排序
    content: JSON.stringify(newJson.sort((a, b) => b.time - a.time), null, 4)
  }
}

// notification
export function notify() {
  try {
    Vue.prototype.$notify(...arguments)
  }catch {}
}

// 插入input
export function insertAtCursor(newText, el) {
  const [start, _] = [el.selectionStart, el.selectionEnd];
  return el.value.substr(0, start)+newText+el.value.substr(start);
}

// 加密解密
export function encrypt(text, pwd) {
  try {
    return CryptoJS.AES.encrypt(text, pwd).toString();
  } catch (e) {
    notify({
      title: e.name,
      type: 'error',
      text: '加密失败'
    })
  }
}

export function decrypt(text, pwd) {
  try {
    return CryptoJS.AES.decrypt(text, pwd).toString(CryptoJS.enc.Utf8) || text;
  } catch (e) {
    notify({
      title: e.name,
      type: 'error',
      text: '解密失败'
    })
    return text;
  }
}
