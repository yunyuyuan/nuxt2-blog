import {inBrowser} from "~/utils/utils";
import throttle from "lodash/throttle";

let scrollEvent = null;

export function initScrollTrigger () {
  if (inBrowser) {
    scrollEvent = new CustomEvent('scroll-event');
    window.addEventListener('scroll', throttle(e => {
      window.dispatchEvent(scrollEvent);
    }, 200));
  }
}

export function addScrollListener (callback) {
  if (scrollEvent) {
    window.addEventListener('scroll-event', callback);
  }
}


export function rmScrollListener (callback) {
  if (scrollEvent) {
    window.removeEventListener('scroll-event', callback);
  }
}
