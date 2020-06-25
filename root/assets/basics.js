export function $ (selector) {
   let targets = null;
   if (typeof selector === 'string') {
      targets = [ ...document.querySelectorAll(selector) ];
   } else if ([ Array, NodeList, HTMLCollection ].includes(selector.constructor)) {
      targets = [ ...selector ];
   } else {
      targets = [ selector ];
   }
   targets.on = (handlers) => {
      for (let target of targets) {
         for (let handler in handlers) {
            target.addEventListener(handler, handlers[handler]);
         }
      }
   };
   targets.css = (styles) => {
      for (let target of targets) {
         for (let style in styles) {
            target.style[style] = styles[style];
         }
      }
   };
   targets.attr = (property, value) => {
      for (let target of targets) {
         if (typeof value === 'string') {
            target.setAttribute(property, value);
         } else {
            target.removeAttribute(property);
         }
      }
   };
   targets.class = (name, value) => {
      for (let target of targets) {
         if (value) {
            target.classList.add(name);
         } else {
            target.classList.remove(name);
         }
      }
   };
   targets.add = (content, text) => {
      for (let target of targets) {
         if (content === '') {
            target.innerHTML = '';
         } else if (typeof content === 'string') {
            if (text) {
               target.innerText += content;
            } else {
               target.innerHTML += content;
            }
         } else {
            target.appendChild(content);
         }
      }
   };
   targets.value = (attribute, index) => {
      return targets[index].getAttribute(attribute);
   };
   return targets;
}

$.from = (context, selector) => $(context.querySelectorAll(selector));

$.html = (code) => document.createRange().createContextualFragment(code);

$.splix = (string, delimiter, ...index) => string.split(delimiter).slice(...index).join(delimiter);

$.wait = (script, delay) => {
   let timeout = setTimeout(script, delay);
   return {
      delay: delay,
      script: script,
      timeout: timeout,
      cancel: () => clearTimeout(timeout)
   };
};

$.loop = (script, delay) => {
   let interval = setInterval(script, delay);
   return {
      delay: delay,
      script: script,
      interval: interval,
      cancel: () => clearInterval(interval)
   };
};

$.xhr = (url, callback) => {
   const xhr = new XMLHttpRequest();
   xhr.addEventListener('load', () => callback(xhr.response));
   xhr.open('get', url);
   xhr.send();
};

$.kfv = (object, value) => {
   for (let key in object) if (object[key] === value) return key;
   return false;
};

$.nav = (input) => {
   const entries = [];
   switch (input.constructor) {
      case Array:
         entries.push(...input);
         break;
      case Object:
         for (let key in input) entries.push(key);
         break;
   }
   let index = 0;
   const listeners = [];
   const output = {
      get index () {
         return index;
      },
      get current () {
         return entries[index];
      },
      get list () {
         return entries;
      },
      assert: (target) => {
         index = target > entries.length - 1 ? entries.length - 1 : target < 0 ? 0 : target;
         output.refresh();
      },
      next: () => {
         ++index;
         if (index === entries.length) index = 0;
         output.refresh();
      },
      previous: () => {
         --index;
         if (index === -1) index = entries.length - 1;
         output.refresh();
      },
      refresh: () => {
         listeners.forEach((listener) => listener(index, output.current));
      },
      update: (...scripts) => {
         listeners.push(...scripts);
         return output;
      }
   };
   return output;
};

$.grid = (query) => {
   for (let grid of $(query)) {
      let size = $(grid.children)
         .map((child) => {
            let content = {};
            try {
               content = JSON.parse(JSON.parse(getComputedStyle(child, ':before').content));
            } catch (e) {}
            if (content.size) return content.size;
            if (child && child.offsetParent === null) return '';
            if (child) return child.getAttribute('size') || '1fr';
         })
         .join(' ');
      if (size) {
         let type = grid.getAttribute('type');
         $(grid).css({ [`grid-template-${type}`]: size });
      }
   }
};

module.exports = $;
