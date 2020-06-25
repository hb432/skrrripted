const { writeFileSync } = require('fs');
const { exec, execSync } = require('child_process');
const { app, ipcMain, BrowserWindow, globalShortcut } = require('electron');

const __ = {
   clean: () => {
      if (__.pid) {
         try {
            execSync(`taskkill /pid ${__.pid} /f /t`, { stdio: 'ignore' });
            console.log('Old tasks cleaned out.');
         } catch (error) {
            console.log('No old tasks to clean out.');
         }
      }
   },
   exec: () => {
      __.pid = exec('start rlbot\\run.bat').pid;
   },
   format: (data) => {
      switch (typeof data) {
         case 'string':
            return data;
         case 'boolean':
            return data ? 'True' : 'False';
         case 'number':
            return `${data}`;
         case 'object':
            if (data === null) return 'None';
            switch (data.constructor) {
               case Array:
                  return data.map(__.format);
               case Object:
                  const object = {};
                  for (let key in data) object[key] = __.format(data[key]);
                  return object;
            }
            break;
      }
   },
   pid: null,
   script: (data) => {
      console.log('Applying script...');
      writeFileSync('./src/agent.json', JSON.stringify(data));
   },
   write: (data) => {
      data = __.format(data);
      const rlbot = [
         '[RLBot Configuration]',
         'extension_path = None',
         'networking_role = none',
         'network_address = 127.0.0.1',
         '[Team Configuration]',
         'Team Blue Color = 0',
         'Team Blue Name = Blue',
         'Team Orange Color = 0',
         'Team Orange Name = Orange',
         '[Match Configuration]',
         `num_participants = ${data.agents.length}`,
         `game_mode = ${data.options.mode}`,
         `game_map = ${data.map}`,
         `skip_replays = ${data.options.skip_replays}`,
         `start_without_countdown = ${data.options.skip_countdowns}`,
         'existing_match_behavior = Restart',
         'enable_lockstep = False',
         'enable_rendering = False',
         'enable_state_setting = True',
         `auto_save_replay = ${data.options.save_replays}`,
         '[Mutator Configuration]',
         `Match Length = ${data.mutators.match_length}`,
         `Max Score = ${data.mutators.max_score}`,
         `Overtime = ${data.mutators.overtime}`,
         `Series Length = ${data.mutators.series_length}`,
         `Game Speed = ${data.mutators.game_speed}`,
         `Ball Max Speed = ${data.mutators.ball_max_speed}`,
         `Ball Type = ${data.mutators.ball_type}`,
         `Ball Weight = ${data.mutators.ball_weight}`,
         `Ball Size = ${data.mutators.ball_size}`,
         `Ball Bounciness = ${data.mutators.ball_bounciness}`,
         `Boost Amount = ${data.mutators.boost_amount}`,
         `Rumble = ${data.mutators.rumble}`,
         `Boost Strength = ${data.mutators.boost_strength}`,
         `Gravity = ${data.mutators.gravity}`,
         `Demolish = ${data.mutators.demolish}`,
         `Respawn Time = ${data.mutators.respawn_time}`,
         '[Participant Configuration]'
      ];
      let index = 0;
      while (index < data.agents.length) {
         const agent = [
            '[Locations]',
            `name = ${data.agents[index].name}`,
            'python_file = ./agent.py',
            `looks_config = ./items.${index}.cfg`,
            'maximum_tick_rate_preference = 240'
         ];
         writeFileSync(`./rlbot/agent/agent.${index}.cfg`, agent.join('\n'));
         rlbot.push(`participant_config_${index} = agent\\agent.${index}.cfg`);
         rlbot.push(`participant_team_${index} = ${data.agents[index].team}`);
         rlbot.push(`participant_type_${index} = rlbot`);
         rlbot.push(`participant_bot_skill_${index} = 0.0`);
         rlbot.push(`participant_loadout_config_${index} = None`);
         ++index;
      }
      writeFileSync('./rlbot/rlbot.cfg', rlbot.join('\n'));
   }
};

app.allowRendererProcessReuse = true;
app.on('ready', () => {
   const portal = new BrowserWindow({
      show: false,
      frame: false,
      width: 450,
      height: 800,
      maximizable: false,
      resizable: false,
      transparent: true,
      alwaysOnTop: true,
      webPreferences: { nodeIntegration: true }
   });

   ipcMain.on('show', () => portal.show());
   ipcMain.on('minimize', () => portal.minimize());
   ipcMain.on('close', () => (__.clean(), process.exit()));

   ipcMain.on('match', (event, data) => {
      console.log('Applying config...');
      __.write(data);
      console.log('Cleaning up old tasks...');
      __.clean();
      console.log('Initializing RLBot...');
      __.exec();
   });

   ipcMain.on('script', (event, data) => {
      __.script(data);
   });

   portal.loadFile('./root/index.html');
});
