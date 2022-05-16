import showdown from 'showdown';
import { inBrowser, LazyImgComp, SvgIconComp, timeStamp } from "~/utils/utils";
import PerfectScrollbar from "perfect-scrollbar";
import { viewerAttr } from "~/plugins/viewer";
import ClipboardJS from "clipboard";
import { notify } from "./utils";
import hljs from 'highlight.js';

/* FIXME hack: recursive regex replace. because the fucking safari don't suppot lookbehind, all of `(^|(?>=[^\\]))` need to be changed to `(^|[^\\])` */
function recursiveReplace(text, regex, cb) {
  let result = text;
  while (regex.test(result)) {
    result = result.replace(new RegExp(regex, 'g'), cb);
  }
  return result;
}

const
  paragraphTabExtension = {
    type: 'lang',
    filter(text, converter) {
      return recursiveReplace(text, /(^|[^\\])<<>>/, (a, prefix) => {
        return `${prefix}&emsp;&emsp;`
      });
    }
  },
  headerExtension = {
    type: 'lang',
    filter(text, converter) {
      return recursiveReplace(text, /(^|\n)(#{1,6})\s*(.+?)\s*(?=\n|$)/, (a, prefix, tone, content) => {
        const size = tone.length;
        const anchor = 'id-' + encodeURIComponent(content);
        return `${prefix}<h${size}><sup class="fake-head" id="${anchor}"></sup><a class="header-link" href="#${anchor}">${converter.makeHtml(content)}</a></h${size}>`
      })
    }
  },
  blankLinkExtension = {
    type: 'lang',
    filter(text, converter) {
      return recursiveReplace(text, /(^|[^\\])#\[(.*?)]\((.*?)\)/, (a, prefix, txt, link) => {
        return `${prefix}<a target="_blank" href="${link}">${txt}</a>`
      })
    }
  },
  commonImgExtension = {
    type: 'lang',
    filter(text, converter) {
      return recursiveReplace(text, /(^|[^\\])!\[(.*?)]\((.*?)\)/, (a, prefix, alt, src) => {
        // sticker
        if (alt === 'sticker') {
          const matcher = src.match(/^(.*?)\/(\d*)$/);
          if (matcher) {
            const [_, name, tone] = matcher;
            return `${prefix}<img src="/sticker/${name}/${tone}.png?ran=${timeStamp}" alt="${alt}"/>`
          }
        }
        const mather = alt.match(/^(.*?)\[(.*?) x (.*?)]$/);
        if (!mather) {
          return `${prefix}<span class="image-container"><img ${viewerAttr} alt="${alt}" title="${alt}" src="${src}"/><small class="desc">${alt}</small></span>`
        }
        // with dimension
        const [_, alt_, w, h] = mather;
        let justHeight = !w;
        return `${prefix}<span class="image-container${justHeight ? ' just-height' : ''}"><img ${viewerAttr} alt="${alt_}" title="${alt_}" style="${w ? `width: ${w} !important;` : ''}${h ? `height: ${h} !important;` : ''}" src="${src}"/><small class="desc">${alt_}</small></span>`
      })
    }
  },
  colorTextExtension = {
    type: 'lang',
    filter(text, converter) {
      return recursiveReplace(text, /(^|[^\\])-\(([#a-zA-Z0-9]+): (.*?)\)-/, (a, prefix, color, txt) => {
        return `${prefix}<span style="color: ${color}">${txt}</span>`
      })
    }
  },
  htmlExtension = {
    type: 'lang',
    filter(text, converter) {
      return recursiveReplace(text, /(^|[^\\])\[html]([\s\S]*?)\[\/html]/, (a, prefix, txt) => {
        return `${prefix}<span class="raw-html">${txt}</span>`
      })
    }
  },
  youtubeExtension = {
    type: 'lang',
    filter(text, converter) {
      return recursiveReplace(text, /(^|[^\\])\[youtube]\[(.+?)]\((https?:\/\/.*?)\)\[\/youtube]/, (a, prefix, txt, src) => {
        return `${prefix}<div class="embed-video youtube">
                        <iframe src="${src}" title="${txt}" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                        <small class="desc">${txt}</small>
                    </div>`
      })
    }
  },
  biliExtension = {
    type: 'lang',
    filter(text, converter) {
      return recursiveReplace(text, /(^|[^\\])\[bili]\[(.+?)]\((https?:\/\/.*?)\)\[\/bili]/, (a, prefix, txt, src) => {
        return `${prefix}<div class="embed-video bili">
                        <iframe src="${src}" title="${txt}" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                        <small class="desc">${txt}</small>
                    </div>`
      })
    }
  },
  fieldExtension = {
    type: 'lang',
    filter(text, converter) {
      return recursiveReplace(text, /(^|\n)--(.*?)--\n([\s\S]+)\n-- --/, (a, prefix, legend, content) => {
        return `${prefix}<fieldset><legend>${converter.makeHtml(legend)}</legend>${converter.makeHtml(content)}</fieldset>`
      })
    }
  }

const options = {
  tables: true,
  tasklists: true,
  backslashEscapesHTMLTags: true,
  strikethrough: true
}
let converter = null;
// if (inBrowser) {
converter = new showdown.Converter({
  ...options,
  extensions: [headerExtension, paragraphTabExtension, blankLinkExtension, commonImgExtension,
    htmlExtension, colorTextExtension, fieldExtension, youtubeExtension, biliExtension]
});
// }

export function parseMarkdown(text) {
  return converter ? converter.makeHtml(text) : '';
}

export function afterInsertHtml(mdEl, forEdit = false) {
  if (inBrowser) {
    // hljs
    mdEl.querySelectorAll('pre>code').forEach(el => {
      const dotes = document.createElement('div');
      const lang = document.createElement('small');
      const language = el.className.replace(/^.*?language-([^ ]+).*?$/, '$1');
      lang.innerText = (hljs.getLanguage(language) || { name: language }).name;
      el.parentElement.insertBefore(dotes, el);
      el.parentElement.insertBefore(lang, dotes);
      hljs.highlightElement(el);
    })
  }
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
        const title = el.nextElementSibling.innerText;
        new LazyImgComp({
          propsData: {
            src: el.getAttribute('src'),
            alt: title,
            viewer: true,
            compStyle: style,
            imgStyle: el.parentElement.classList.contains('just-height') ? style : '',
            title,
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
          target: function (trigger) {
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
