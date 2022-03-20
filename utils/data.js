import articleList from "~/rebuild/json/article.json";
import recordList from "~/rebuild/json/record.json";
import knowledgeList from "~/rebuild/json/knowledge.json";
import {inBrowser} from "~/utils/utils";

const articleTagList = new Set();
articleList.forEach(item => {
  item.tags.forEach(v => articleTagList.add(v));
})

// const knowledgeTypeList = new Set();
// knowledgeList.forEach(item => {
//   knowledgeTypeList.add(item.type);
// })
const knowledgeTypeList = [
  {key: 'book', name: '书籍'},
  {key: 'film', name: '影视'},
  {key: 'game', name: '游戏'},
  {key: 'Note', name: 'IT笔记'},
]

const token = {
  value: (inBrowser ? localStorage.getItem('token') : '') || ''
}

const festivals = [
  {
    name: '春节',
    tips: '新年快乐！',
    icon: 'new-year',
    days: ['2022-02-01','2023-01-22','2024-02-10','2025-01-29','2026-02-17','2027-02-06','2028-01-26','2029-02-13','2030-02-03','2031-01-23'],
    imgStyle: `
      display: none;
    `,
    svgStyle: `
      position: absolute;
      top: -5%;
      right: -5%;
      width: 110%;
      height: 110%;
    `
  },
  {
    name: '清明节',
    tips: '踏青，扫墓',
    icon: 'qingming',
    days: '04-05',
    imgStyle: '',
    svgStyle: `
      position: absolute;
      bottom: 0;
      right: 0;
      width: 30px;
      height: 30px;
      transform: translate(15px, calc(100% + 13px)) rotate(62deg);
    `
  },
  {
    name: '端午节',
    tips: '安康',
    icon: 'duanwu',
    days: ['2022-06-03','2023-06-22','2024-06-10','2025-05-31','2026-06-19','2027-06-09','2028-05-28','2029-06-16','2030-06-05','2031-06-24'],
    imgStyle: `
      display: none;
    `,
    svgStyle: `
      position: absolute;
      top: -5%;
      right: -5%;
      width: 110%;
      height: 110%;
    `
  },
  {
    name: '中秋节',
    tips: '团圆',
    icon: 'zhongqiu',
    days: ['2022-09-10','2023-09-29','2024-09-17','2025-10-06','2026-09-25','2027-09-15','2028-10-03','2029-09-22','2030-09-12','2031-10-01'],
    imgStyle: `
      display: none;
    `,
    svgStyle: `
      position: absolute;
      top: -5%;
      right: -5%;
      width: 110%;
      height: 110%;
    `
  },
  {
    name: '万圣节',
    tips: 'Trick or treat',
    icon: 'halloween',
    days: '10-31',
    imgStyle: '',
    svgStyle: `
      position: absolute;
      bottom: -8px;
      right: 50%;
      width: 110%;
      height: 110%;
      animation: swing 4s linear infinite;
      transform-origin: 65% 100%;
    `
  },
  {
    name: '圣诞节',
    tips: 'Merry Christmas!',
    icon: 'christmas-hat',
    days: '12-25',
    imgStyle: {},
    svgStyle: `
      position: absolute;
      top: 0;
      right: 0;
      width: 80%;
      height: 80%;
      transform: translate(30%, -30%);
    `
  },
];

export {articleList, recordList, knowledgeList, articleTagList, knowledgeTypeList, token, festivals};
