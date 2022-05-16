import {readdirSync} from 'fs';

const stickers = {
  'aru': {
    name: '阿鲁',
    len: 0
  },
  'yellow-face': {
    name: '小黄脸',
    len: 0
  }
}

Object.keys(stickers).forEach(dir => {
  const dirs = readdirSync('./static/sticker/'+dir);
  stickers[dir].len = dirs.filter(f => f.endsWith('.png')).length;
})

export default (context, inject) => {
  inject('stickers', stickers)
};
