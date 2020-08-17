const { parse } = require('url');
const { Server } = require('http');
const { ipcRenderer } = require('electron');
const { readFileSync, writeFileSync } = require('fs');

const data = JSON.parse(readFileSync('agent.json').toString());

const __ = {
   auto: (context, ...path) => {
      for (let node of path) context = context[node] || (context[node] = {});
      return context;
   },
   click: (query, listener) => {
      document.querySelector(query).addEventListener('click', listener);
   },
   grid: (query) => {
      for (let grid of [ ...document.querySelectorAll(query) ]) {
         let size = [ ...grid.children ]
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
            grid.style[`grid-template-${type}`] = size;
         }
      }
   },
   server: new Server((request, response) => {
      response.writeHead(200);
      response.write('');
      response.end();
      const url = parse(request.url, true);
      if (url.pathname === '/init') {
         __.target.limit = Number(url.query.agents);
         __.target.refresh();
         ipcRenderer.send('show');
      }
   }),
   target: {
      limit: 0,
      next: () => {
         __.target.value === __.target.limit || __.target.update(__.target.value + 1);
      },
      prev: () => {
         __.target.value === 0 || __.target.update(__.target.value - 1);
      },
      refresh: () => {
         const next = document.querySelector('#target-next').classList;
         __.target.value === __.target.limit ? next.add('locked') : next.remove('locked');
         const prev = document.querySelector('#target-prev').classList;
         __.target.value === 0 ? prev.add('locked') : prev.remove('locked');
         const name = document.querySelector('#target-display-name');
         name.innerText = __.target.value ? `Agent ${__.target.value}` : 'Ball';
         const area = document.querySelector('#instructions-editor');
         area;
      },
      update: (value) => {
         __.target.value = value;
         __.values.forEach((value) => value.load());
         __.target.refresh();
      },
      value: 0
   },
   values: [
      0,
      'location-x',
      'location-y',
      'location-z',
      'rotation-pitch',
      'rotation-roll',
      'rotation-yaw',
      'velocity-x',
      'velocity-y',
      'velocity-z',
      'angular_velocity-x',
      'angular_velocity-y',
      'angular_velocity-z'
   ].map((value) => {
      const element = document.querySelector(value ? `#physics-${value}` : '#instructions-editor');
      const [ namespace, key ] = (value || 'instructions').split('-');
      const thing = {
         path: () => {
            return __.target.value ? [ 'cars', (__.target.value - 1).toString() ] : [ 'ball' ];
         },
         load: () => {
            if (value) element.value = __.auto(data, ...thing.path(), namespace)[key] || 0;
            else element.value = (__.auto(data, ...thing.path())[namespace] || []).join('\n');
         },
         save: () => {
            if (value) __.auto(data, ...thing.path(), namespace)[key] = Number(element.value || 0);
            else __.auto(data, ...thing.path())[namespace] = element.value.split('\n').filter((line) => line);
         }
      };
      element.addEventListener('input', () => {
         if (value || __.target.value) {
            thing.save();
            writeFileSync('agent.json', JSON.stringify(data));
            writeFileSync('refresh.temp', '');
         }
      });
      return thing;
   })
};

__.server.listen(28442);

setInterval(() => writeFileSync('active.temp', new Date().getTime()), 5000);

__.target.update(0);
__.values.forEach((value) => value.load());

__.click('#close', () => ipcRenderer.send('close'));
__.click('#minimize', () => ipcRenderer.send('minimize'));
__.click('#target-next', __.target.next);
__.click('#target-prev', __.target.prev);

__.grid('grid');
