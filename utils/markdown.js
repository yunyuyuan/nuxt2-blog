import showdown from 'showdown';
import {inBrowser, LazyImgComp, SvgIconComp, timeStamp} from "~/utils/utils";
import PerfectScrollbar from "perfect-scrollbar";
import {viewerAttr} from "~/plugins/viewer";
import ClipboardJS from "clipboard";
import {notify} from "./utils";

const
  paragraphTabExtension = {
    type: 'lang',
    regex: /(^|[^\\])<<>>/g,
    replace: '$1&emsp;&emsp;'
  },
  headerExtension = {
    type: 'lang',
    filter(text, converter) {
      return text.replace(/(^|\n)(#{1,6})\s*(.+?)\s*(?=\n|$)/g, (a, prefix, tone, content) => {
        const size = tone.length;
        const anchor = 'id-' + encodeURIComponent(content);
        return `${prefix}<h${size}><sup class="fake-head" id="${anchor}"></sup><a class="header-link" href="#${anchor}">${converter.makeHtml(content)}</a></h${size}>`
      })
    }
  },
  blankLinkExtension = {
    type: 'lang',
    regex: /(^|[^\\])#\[(.*?)]\((.*?)\)/g,
    replace: '$1<a target="_blank" href="$3">$2</a>'
  },
  commonImgExtension = {
    type: 'lang',
    regex: /(^|[^\\])!\[(.*?)]\((.*?)\)/g,
    replace: (a, prefix, alt, src) => {
      // sticker
      if (alt === 'sticker') {
        const [_, name, tone] = src.match(/^(.*?)\/(\d*)$/);
        return `${prefix}<img src="/sticker/${name}/${tone}.png?ran=${timeStamp}" alt="${alt}"/>`
      }
      const mather = alt.match(/^(.*?)\[(.*?) x (.*?)]$/);
      if (!mather) {
        return `${prefix}<span class="image-container"><img ${viewerAttr} alt="${alt}" title="${alt}" src="${src}"/><small class="desc">${alt}</small></span>`
      }
      // with dimension
      const [_, alt_, w, h] = mather;
      let justHeight = !w;
      return `${prefix}<span class="image-container${justHeight?' just-height':''}"><img ${viewerAttr} alt="${alt_}" title="${alt_}" style="${w ? `width: ${w} !important;` : ''}${h ? `height: ${h} !important;` : ''}" src="${src}"/><small class="desc">${alt_}</small></span>`
    }
  },
  colorTextExtension = {
    type: 'lang',
    regex: /(^|[^\\])-\(([#a-zA-Z0-9]+): (.*?)\)-/g,
    replace: `$1<span style="color: $2">$3</span>`
  },
  htmlExtension = {
    type: 'lang',
    regex: /(^|[^\\])\[html]([\s\S]*?)\[\/html]/g,
    replace: `$1<span class="raw-html">$2</span>`
  },
  youtubeExtension = {
    type: 'lang',
    regex: /(^|[^\\])\[youtube]\[(.+?)]\((https?:\/\/.*?)\)\[\/youtube]/g,
    replace: `$1<div class="embed-video youtube">
                        <iframe src="$3" title="$2" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                        <small class="desc">$2</small>
                    </div>`
  },
  biliExtension = {
    type: 'lang',
    regex: /(^|[^\\])\[bili]\[(.+?)]\((https?:\/\/.*?)\)\[\/bili]/g,
    replace: `$1<div class="embed-video bili">
                        <iframe src="$3" title="$2" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                        <small class="desc">$2</small>
                    </div>`
  },
  fieldExtension = {
    type: 'lang',
    filter(text, converter) {
      return text.replace(/(^|\n)--(.*?)--\n([\s\S]+)\n-- --/g, (a, b, c, d) => {
        return `${b}<fieldset><legend>${converter.makeHtml(c)}</legend>${converter.makeHtml(d)}</fieldset>`
      })
    },
  }

const options = {
  tables: true,
  tasklists: true,
  backslashEscapesHTMLTags: true,
  strikethrough: true
}
let converter = null;
if (inBrowser) {
  converter = new showdown.Converter({
    ...options,
    extensions: [headerExtension, paragraphTabExtension, blankLinkExtension, commonImgExtension,
      htmlExtension, colorTextExtension, fieldExtension, youtubeExtension, biliExtension]
  });
}

export function parseMarkdown(text) {
  return converter ? converter.makeHtml(text) : '';
}

export function afterInsertHtml(mdEl, forEdit = false) {
  try {
    if (!forEdit) {
      // code scrollbar
      mdEl.querySelectorAll('pre>code').forEach(el => {
        if (!el.classList.contains('ps')) {
          new PerfectScrollbar(el);
        }
      })
      // lazy-img
      mdEl.querySelectorAll('.image-container img').forEach(el => {
        const style = el.getAttribute('style');
        new LazyImgComp({
          propsData: {
            src: el.getAttribute('src'),
            alt: el.title,
            viewer: true,
            compStyle: style,
            imgStyle: el.parentElement.classList.contains('just-height') ? style : '',
            title: el.title,
          }
        }).$mount(el);
      })
      // copy <pre>
      mdEl.querySelectorAll('pre').forEach(el => {
        const actions = document.createElement('span');
        el.insertBefore(actions, el.children[0]);
        const themeBtn = createSvgIcon('code-theme', span => {
          span.classList.add('code-theme');
          actions.appendChild(span);
        })
        themeBtn.title = 'theme';
        themeBtn.onclick = () => {
          const body = document.body;
          const theme = body.getAttribute('code-theme') === 'light' ? 'dark' : 'light';
          body.setAttribute('code-theme', theme);
          localStorage.setItem('code-theme', theme);
        }
        const copyBtn = createSvgIcon('copy', span => {
          span.classList.add('copy');
          actions.appendChild(span);
        })
        copyBtn.title = 'copy';
        new ClipboardJS(copyBtn, {
          target: function(trigger) {
            return trigger.parentElement.parentElement.querySelector('code');
          },
        }).on('success', e => {
          e.clearSelection();
          notify({
            title: '复制成功！',
            type: 'success',
          });
        });
      })
      // target=_blank
      mdEl.querySelectorAll('a[target=_blank]').forEach(el => {
        createSvgIcon('open-link', span => {
          span.classList.add('open-link');
          el.appendChild(span);
        })
      })
    }
  } catch {
  }
}

function createSvgIcon(name, process) {
  const span = document.createElement('span');
  const svg = document.createElement('i');
  span.appendChild(svg);
  process(span);
  new SvgIconComp({
    propsData: {
      name,
    }
  }).$mount(svg);
  return span;
}
