import { $ } from './basics.js';
import { database } from './database.js';

const { readFileSync, writeFileSync } = require('fs');

const { ipcRenderer } = require('electron');

/**/ ipcRenderer.send('show');

const __ = (window.__ = {
   build: {
      match: (preset, options, mutators, map, agents) => {
         const match = Object.assign({ map: map.key, agents: agents }, __.db.default);
         Object.assign(match.options, preset.options || {}, options || {});
         Object.assign(match.mutators, preset.mutators || {}, mutators || {});
         return match;
      }
   },
   data: {
      store: {},
      load: (key) => {
         return __.data.store[key];
      },
      save: (key, value) => {
         __.data.store[key] = value;
      }
   },
   db: database(),
   trigger: {
      match: () => {
         const match = __.build.match(__.ui.preset, __.ui.options, __.ui.mutators, __.ui.map, __.ui.agents);
         ipcRenderer.send('match', match);
      },
      script: () => {
         const script = { ball: __.ui.ball, cars: __.ui.cars };
         ipcRenderer.send('script', script);
      }
   },
   maps: {
      current: null,
      generate: () => {
         const maps = Object.entries(__.db.maps);
         const avail = __.ui.preset.maps;
         const list = maps.filter((map) => avail.includes(map[1].type)).map((map) => map[0]);
         let persist = null;
         if (__.navs.map && list.includes(__.navs.map.current)) persist = __.navs.map.current;
         __.maps.current = $.nav(list).update((index, current) => {
            __.data.save('map', index);
            $('#map-header')[0].innerText = `Map: ${__.db.maps[current].name}`;
            $('#map').css({
               backgroundImage: `url('./images/${current}.webp')`
            });
         });
         if (persist) __.maps.current.assert(list.indexOf(persist));
      }
   },
   ui: {
      get agents () {
         return [
            {
               name: 'Agent 1',
               team: 0
            },
            {
               name: 'Agent 2',
               team: 0
            },
            {
               name: 'Agent 3',
               team: 0
            }
         ];
      },
      get players () {},
      get ball () {},
      get cars () {},
      get map () {
         return __.db.maps[__.navs.map.current];
      },
      get mutators () {
         return {
            match_length: $('#mm-match-length')[0].innerText,
            max_score: $('#mm-max-score')[0].innerText,
            overtime: $('#mm-overtime')[0].innerText,
            series_length: $('#mm-series-length')[0].innerText,
            game_speed: $('#mm-game-speed')[0].innerText,
            ball_max_speed: $('#mm-ball-max-speed')[0].innerText,
            ball_type: $('#mm-ball-type')[0].innerText,
            ball_weight: $('#mm-ball-weight')[0].innerText,
            ball_size: $('#mm-ball-size')[0].innerText,
            ball_bounciness: $('#mm-ball-bounciness')[0].innerText,
            boost_amount: $('#mm-boost-amount')[0].innerText,
            rumble: $('#mm-rumble')[0].innerText,
            boost_strength: $('#mm-boost-strength')[0].innerText,
            gravity: $('#mm-gravity')[0].innerText,
            demolish: $('#mm-demolish')[0].innerText,
            respawn_time: $('#mm-respawn-time')[0].innerText
         };
      },
      get options () {
         const replays = __.navs.options.replays.index;
         const countdowns = __.navs.options.countdowns.index;
         return {
            skip_replays: replays === 2 ? true : false,
            save_replays: replays === 1 ? true : false,
            skip_countdowns: countdowns ? false : true
         };
      },
      get preset () {
         return Object.values(__.db.presets)[__.navs.options.preset.index];
      }
   }
});

try {
   __.data.store = JSON.parse(readFileSync('./root/store.json').toString());
} catch (error) {}

window.addEventListener('beforeunload', () => {
   writeFileSync('./root/store.json', JSON.stringify(__.data.store));
});

$('#minimize').on({ click: () => ipcRenderer.send('minimize') });
$('#close').on({ click: () => ipcRenderer.send('close') });

{
   __.navs = {
      get map () {
         return __.maps.current;
      },
      options: {
         preset: $.nav(Object.values(__.db.presets).map((value) => value.name)).update((index, current) => {
            __.data.save('options-preset', index);
            $('#mo-preset')[0].innerText = current;
            __.maps.generate();
            __.navs.map.refresh();
         }),
         replays: $.nav([ 'Standard', 'Auto-Save', 'Disabled' ]).update((index, current) => {
            __.data.save('options-replays', index);
            $('#mo-replays')[0].innerText = current;
         }),
         countdowns: $.nav([ 'Enabled', 'Disabled' ]).update((index, current) => {
            __.data.save('options-countdowns', index);
            $('#mo-countdowns')[0].innerText = current;
         })
      },
      mutators: {
         matchLength: $.nav([
            'Preset',
            '5 Minutes',
            '10 Minutes',
            '20 Minutes',
            'Unlimited'
         ]).update((index, current) => {
            __.data.save('mutators-match-length', index);
            $('#mm-match-length')[0].innerText = current;
            __.maps.generate();
            __.navs.map.refresh();
         }),
         maxScore: $.nav([ 'Preset', 'Unlimited', '1 Goal', '3 Goals', '5 Goals' ]).update((index, current) => {
            __.data.save('mutators-max-score', index);
            $('#mm-max-score')[0].innerText = current;
            __.maps.generate();
            __.navs.map.refresh();
         }),
         overtime: $.nav([
            'Preset',
            'Unlimited',
            '+5 Max, First Score',
            '+5 Max, Random Team'
         ]).update((index, current) => {
            __.data.save('mutators-overtime', index);
            $('#mm-overtime')[0].innerText = current;
            __.maps.generate();
            __.navs.map.refresh();
         }),
         seriesLength: $.nav([ 'Preset', 'Unlimited', '3 Games', '5 Games', '7 Games' ]).update((index, current) => {
            __.data.save('mutators-series-length', index);
            $('#mm-series-length')[0].innerText = current;
            __.maps.generate();
            __.navs.map.refresh();
         }),
         gameSpeed: $.nav([ 'Preset', 'Default', 'Slo-Mo', 'Time Warp' ]).update((index, current) => {
            __.data.save('mutators-game-speed', index);
            $('#mm-game-speed')[0].innerText = current;
            __.maps.generate();
            __.navs.map.refresh();
         }),
         ballMaxSpeed: $.nav([ 'Preset', 'Default', 'Slow', 'Fast', 'Super Fast' ]).update((index, current) => {
            __.data.save('mutators-ball-max-speed', index);
            $('#mm-ball-max-speed')[0].innerText = current;
            __.maps.generate();
            __.navs.map.refresh();
         }),
         ballType: $.nav([ 'Preset', 'Default', 'Cube', 'Puck', 'Basketball' ]).update((index, current) => {
            __.data.save('mutators-ball-type', index);
            $('#mm-ball-type')[0].innerText = current;
            __.maps.generate();
            __.navs.map.refresh();
         }),
         ballWeight: $.nav([ 'Preset', 'Default', 'Light', 'Heavy', 'Super Light' ]).update((index, current) => {
            __.data.save('mutators-ball-weight', index);
            $('#mm-ball-weight')[0].innerText = current;
            __.maps.generate();
            __.navs.map.refresh();
         }),
         ballSize: $.nav([ 'Preset', 'Default', 'Small', 'Large', 'Gigantic' ]).update((index, current) => {
            __.data.save('mutators-ball-size', index);
            $('#mm-ball-size')[0].innerText = current;
            __.maps.generate();
            __.navs.map.refresh();
         }),
         ballBounciness: $.nav([ 'Preset', 'Default', 'Low', 'High', 'Super High' ]).update((index, current) => {
            __.data.save('mutators-ball-bounciness', index);
            $('#mm-ball-bounciness')[0].innerText = current;
            __.maps.generate();
            __.navs.map.refresh();
         }),
         boostAmount: $.nav([
            'Preset',
            'Default',
            'Unlimited',
            'Recharge (Slow)',
            'Recharge (Fast)',
            'No Boost'
         ]).update((index, current) => {
            __.data.save('mutators-boost-amount', index);
            $('#mm-boost-amount')[0].innerText = current;
            __.maps.generate();
            __.navs.map.refresh();
         }),
         rumble: $.nav([
            'Preset',
            'None',
            'Default',
            'Slow',
            'Civilized',
            'Destruction Derby',
            'Spring Loaded',
            'Spikes Only',
            'Spike Rush'
         ]).update((index, current) => {
            __.data.save('mutators-rumble', index);
            $('#mm-rumble')[0].innerText = current;
            __.maps.generate();
            __.navs.map.refresh();
         }),
         boostStrength: $.nav([ 'Preset', '1x', '1.5x', '2x', '10x' ]).update((index, current) => {
            __.data.save('mutators-boost-strength', index);
            $('#mm-boost-strength')[0].innerText = current;
            __.maps.generate();
            __.navs.map.refresh();
         }),
         gravity: $.nav([ 'Preset', 'Default', 'Low', 'High', 'Super High' ]).update((index, current) => {
            __.data.save('mutators-gravity', index);
            $('#mm-gravity')[0].innerText = current;
            __.maps.generate();
            __.navs.map.refresh();
         }),
         demolish: $.nav([
            'Preset',
            'Default',
            'Disabled',
            'Friendly Fire',
            'On Contact',
            'On Contact (FF)'
         ]).update((index, current) => {
            __.data.save('mutators-demolish', index);
            $('#mm-demolish')[0].innerText = current;
            __.maps.generate();
            __.navs.map.refresh();
         }),
         respawnTime: $.nav([
            'Preset',
            '3 Seconds',
            '2 Seconds',
            '1 Second',
            'Disable Goal Reset'
         ]).update((index, current) => {
            __.data.save('mutators-respawn-time', index);
            $('#mm-respawn-time')[0].innerText = current;
            __.maps.generate();
            __.navs.map.refresh();
         })
      }
   };

   const map = __.data.load('map') || 0;

   __.navs.options.preset.assert(__.data.load('options-preset') || 0);
   __.navs.options.replays.assert(__.data.load('options-replays') || 0);
   __.navs.options.countdowns.assert(__.data.load('options-countdowns') || 0);

   __.navs.mutators.matchLength.assert(__.data.load('mutators-match-length') || 0);
   __.navs.mutators.maxScore.assert(__.data.load('mutators-max-score') || 0);
   __.navs.mutators.overtime.assert(__.data.load('mutators-overtime') || 0);
   __.navs.mutators.seriesLength.assert(__.data.load('mutators-series-length') || 0);
   __.navs.mutators.gameSpeed.assert(__.data.load('mutators-game-speed') || 0);
   __.navs.mutators.ballMaxSpeed.assert(__.data.load('mutators-ball-max-speed') || 0);
   __.navs.mutators.ballType.assert(__.data.load('mutators-ball-type') || 0);
   __.navs.mutators.ballWeight.assert(__.data.load('mutators-ball-weight') || 0);
   __.navs.mutators.ballSize.assert(__.data.load('mutators-ball-size') || 0);
   __.navs.mutators.ballBounciness.assert(__.data.load('mutators-ball-bounciness') || 0);
   __.navs.mutators.boostAmount.assert(__.data.load('mutators-boost-amount') || 0);
   __.navs.mutators.rumble.assert(__.data.load('mutators-rumble') || 0);
   __.navs.mutators.boostStrength.assert(__.data.load('mutators-boost-strength') || 0);
   __.navs.mutators.gravity.assert(__.data.load('mutators-gravity') || 0);
   __.navs.mutators.demolish.assert(__.data.load('mutators-demolish') || 0);
   __.navs.mutators.respawnTime.assert(__.data.load('mutators-respawn-time') || 0);

   __.navs.map.refresh();
   __.maps.current.assert(map);

   $('#previous-map').on({ click: () => __.navs.map.previous() });
   $('#next-map').on({ click: () => __.navs.map.next() });

   $('#mo-preset-p').on({ click: () => __.navs.options.preset.previous() });
   $('#mo-preset-n').on({ click: () => __.navs.options.preset.next() });

   $('#mo-replays-p').on({ click: () => __.navs.options.replays.previous() });
   $('#mo-replays-n').on({ click: () => __.navs.options.replays.next() });

   $('#mo-countdowns-p').on({ click: () => __.navs.options.countdowns.previous() });
   $('#mo-countdowns-n').on({ click: () => __.navs.options.countdowns.next() });

   $('#mm-match-length-p').on({ click: () => __.navs.mutators.matchLength.previous() });
   $('#mm-match-length-n').on({ click: () => __.navs.mutators.matchLength.next() });

   $('#mm-max-score-p').on({ click: () => __.navs.mutators.maxScore.previous() });
   $('#mm-max-score-n').on({ click: () => __.navs.mutators.maxScore.next() });

   $('#mm-overtime-p').on({ click: () => __.navs.mutators.overtime.previous() });
   $('#mm-overtime-n').on({ click: () => __.navs.mutators.overtime.next() });

   $('#mm-series-length-p').on({ click: () => __.navs.mutators.seriesLength.previous() });
   $('#mm-series-length-n').on({ click: () => __.navs.mutators.seriesLength.next() });

   $('#mm-game-speed-p').on({ click: () => __.navs.mutators.gameSpeed.previous() });
   $('#mm-game-speed-n').on({ click: () => __.navs.mutators.gameSpeed.next() });

   $('#mm-ball-max-speed-p').on({ click: () => __.navs.mutators.ballMaxSpeed.previous() });
   $('#mm-ball-max-speed-n').on({ click: () => __.navs.mutators.ballMaxSpeed.next() });

   $('#mm-ball-type-p').on({ click: () => __.navs.mutators.ballType.previous() });
   $('#mm-ball-type-n').on({ click: () => __.navs.mutators.ballType.next() });

   $('#mm-ball-weight-p').on({ click: () => __.navs.mutators.ballWeight.previous() });
   $('#mm-ball-weight-n').on({ click: () => __.navs.mutators.ballWeight.next() });

   $('#mm-ball-size-p').on({ click: () => __.navs.mutators.ballSize.previous() });
   $('#mm-ball-size-n').on({ click: () => __.navs.mutators.ballSize.next() });

   $('#mm-ball-bounciness-p').on({ click: () => __.navs.mutators.ballBounciness.previous() });
   $('#mm-ball-bounciness-n').on({ click: () => __.navs.mutators.ballBounciness.next() });

   $('#mm-boost-amount-p').on({ click: () => __.navs.mutators.boostAmount.previous() });
   $('#mm-boost-amount-n').on({ click: () => __.navs.mutators.boostAmount.next() });

   $('#mm-rumble-p').on({ click: () => __.navs.mutators.rumble.previous() });
   $('#mm-rumble-n').on({ click: () => __.navs.mutators.rumble.next() });

   $('#mm-boost-strength-p').on({ click: () => __.navs.mutators.boostStrength.previous() });
   $('#mm-boost-strength-n').on({ click: () => __.navs.mutators.boostStrength.next() });

   $('#mm-gravity-p').on({ click: () => __.navs.mutators.gravity.previous() });
   $('#mm-gravity-n').on({ click: () => __.navs.mutators.gravity.next() });

   $('#mm-demolish-p').on({ click: () => __.navs.mutators.demolish.previous() });
   $('#mm-demolish-n').on({ click: () => __.navs.mutators.demolish.next() });

   $('#mm-respawn-time-p').on({ click: () => __.navs.mutators.respawnTime.previous() });
   $('#mm-respawn-time-n').on({ click: () => __.navs.mutators.respawnTime.next() });
}

$.grid('grid');

$('.menu-button').on({
   click: (event) => {
      $('.menu-button[selected]').attr('selected');
      $(event.currentTarget).attr('selected', '');
   }
});

$('.mutators-page').on({
   click: (event) => {
      $('.mutators-rows[active]').attr('active');
      $('.mutators-page[active]').attr('active');
      $(`.mutators-rows[name="${event.currentTarget.getAttribute('name')}"]`).attr('active', '');
      $(event.currentTarget).attr('active', '');
      $.grid('.mutators-rows, .selector-row, .selector-panel');
   }
});

$('#start-match').on({ click: () => __.trigger.match() });

ipcRenderer.send('show');

/*
const match = __.build.match('boomer_ball', null, null, __.db.maps.octagon.key, []);
ipcRenderer.send('script', {
   ball: {
      location: { x: -2000, y: 0, z: 1000 },
      rotation: { pitch: 0, roll: 0, yaw: 0 },
      velocity: { x: 0, y: -500, z: 800 },
      angular_velocity: { x: 3000, y: 0, z: 0 }
   },
   cars: [
      {
         location: {
            x: -2001,
            y: -2455,
            z: 20
         },
         rotation: {
            pitch: 0,
            roll: 0,
            yaw: 150
         },
         velocity: {
            x: 0,
            y: 0,
            z: 0
         },
         angular_velocity: {
            x: 0,
            y: 0,
            z: 0
         },
         instructions: [
            'wait 71',
            'boost 150',
            'forward 150',
            'wait 75',
            'turn-r 1',
            'wait 75',
            'jump 1',
            'wait 20',
            'turn-l 1',
            'wait 10',
            'jump 1',
            'wait 10',
            'forward 1',
            'jump 1',
            'wait 1',
            'backward 12',
            'wait 40',
            'boost 200',
            'roll-r 25',
            'backward 15',
            'wait 60',
            'backward 20',
            'wait 10',
            'roll-r 7',
            'wait 70',
            'turn-r 24',
            'wait 150',
            'jump 1',
            'wait 1',
            'backward 30',
            'wait 25',
            'boost 25',
            'wait 25',
            'forward 1',
            'jump 1',
            'wait 27',
            'backward 15',
            'boost 80',
            'wait 70',
            'backward 40',
            'wait 65',
            'turn-l 4',
            'wait 15',
            'boost 41',
            'wait 15',
            'forward 2',
            'wait 3',
            'turn-l 1'
         ]
      },
      {
         location: {
            x: 3749,
            y: 3000,
            z: 20
         },
         rotation: {
            pitch: 0,
            roll: 0,
            yaw: 150
         },
         velocity: {
            x: 0,
            y: 0,
            z: 0
         },
         angular_velocity: {
            x: 0,
            y: 0,
            z: 0
         },
         instructions: [
            'wait 160',
            'boost 60',
            'forward 70',
            'wait 60',
            'turn-l 20',
            'backward 13',
            'wait 15',
            'boost 140',
            'forward 140',
            'wait 60',
            'turn-r 18',
            'wait 45',
            'turn-r 10',
            'wait 15',
            'jump 1',
            'wait 35',
            'roll-l 1',
            'jump 1',
            'wait 35',
            'boost 75',
            'roll-r 27',
            'wait 15',
            'backward 25',
            'wait 25',
            'turn-r 9',
            'wait 270',
            'turn-r 40',
            'forward 30',
            'boost 30',
            'wait 40',
            'boost 20',
            'turn-r 15',
            'wait 35',
            'turn-r 14',
            'boost 8',
            'wait 44',
            'jump 1',
            'wait 5',
            'turn-l 1',
            'jump 1'
         ]
      },
      {
         location: {
            x: -150,
            y: -5400,
            z: 20
         },
         rotation: {
            pitch: 0,
            roll: 0,
            yaw: 110
         },
         velocity: {
            x: 0,
            y: 0,
            z: 0
         },
         angular_velocity: {
            x: 0,
            y: 0,
            z: 0
         },
         instructions: [
            'boost 40',
            'forward 40',
            'wait 20',
            'turn-r 10',
            'wait 40',
            'turn-l 4',
            'wait 40',
            'boost 58',
            'wait 50',
            'turn-l 15',
            'wait 30',
            'jump 1',
            'wait 5',
            'forward 1',
            'jump 1',
            'wait 1',
            'backward 20',
            'wait 70',
            'turn-r 60',
            'wait 70',
            'boost 30',
            'wait 60',
            'forward 300',
            'turn-l 35',
            'wait 25',
            'boost 100',
            'wait 40',
            'jump 1',
            'wait 120',
            'boost 100',
            'wait 50',
            'turn-r 20',
            'wait 80',
            'turn-r 50',
            'wait 10',
            'turn-r 40',
            'wait 50',
            'turn-r 7',
            'wait 40',
            'boost 30',
            'wait 63',
            'jump 1',
            'wait 5',
            'turn-r 1',
            'jump 1'
         ]
      }
   ]
});
*/
