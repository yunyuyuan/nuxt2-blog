import Vue from 'vue'
import Viewer from 'v-viewer'

Vue.use(Viewer)

export const viewerAttr = 'data-viewer'

Viewer.setDefaults({
  filter(img) {
    return img.hasAttribute(viewerAttr)
  }
})
