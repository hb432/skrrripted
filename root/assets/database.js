export function database () {
   return {
      maps: {
         aquadome: {
            name: 'Aquadome',
            type: 'standard',
            key: 'AquaDome'
         },
         arctagon: {
            name: 'Arctagon',
            type: 'labs',
            key: 'Arctagon'
         },
         badlands: {
            name: 'Badlands',
            type: 'labs',
            key: 'Badlands'
         },
         badlandsNight: {
            name: 'Badlands (Night)',
            type: 'labs',
            key: 'Badlands_Night'
         },
         beckwith: {
            name: 'Beckwith Park',
            type: 'standard',
            key: 'BeckwithPark'
         },
         beckwithNight: {
            name: 'Beckwith Park (Midnight)',
            type: 'standard',
            key: 'BeckwithPark_Midnight'
         },
         beckwithStormy: {
            name: 'Beckwith Park (Stormy)',
            type: 'standard',
            key: 'BeckwithPark_Stormy'
         },
         champions: {
            name: 'Champions Field',
            type: 'standard',
            key: 'ChampionsField'
         },
         championsDay: {
            name: 'Champions Field (Day)',
            type: 'standard',
            key: 'ChampionsField_Day'
         },
         cosmic: {
            name: 'Cosmic',
            type: 'labs',
            key: 'Cosmic'
         },
         double: {
            name: 'Double Goal',
            type: 'labs',
            key: 'DoubleGoal'
         },
         dropshot: {
            name: 'Core 707',
            type: 'dropshot',
            key: 'DropShot_Core707'
         },
         farmstead: {
            name: 'Farmstead',
            type: 'standard',
            key: 'Farmstead'
         },
         farmsteadNight: {
            name: 'Farmstead (Night)',
            type: 'standard',
            key: 'Farmstead_Night'
         },
         forbidden: {
            name: 'Forbidden Temple',
            type: 'standard',
            key: 'ForbiddenTemple'
         },
         hoops: {
            name: 'Dunk House',
            type: 'hoops',
            key: 'Hoops_DunkHouse'
         },
         mannfield: {
            name: 'Mannfield',
            type: 'standard',
            key: 'Mannfield'
         },
         mannfieldNight: {
            name: 'Mannfield (Night)',
            type: 'standard',
            key: 'Mannfield_Night'
         },
         mannfieldSnowy: {
            name: 'Mannfield (Snowy)',
            type: 'snowy',
            key: 'Mannfield_Snowy'
         },
         mannfieldStormy: {
            name: 'Mannfield (Stormy)',
            type: 'standard',
            key: 'Mannfield_Stormy'
         },
         octagon: {
            name: 'Octagon',
            type: 'labs',
            key: 'Octagon'
         },
         pillars: {
            name: 'Pillars',
            type: 'labs',
            key: 'Pillars'
         },
         retro: {
            name: 'Utopia Retro',
            type: 'labs',
            key: 'UtopiaRetro'
         },
         rivals: {
            name: 'Rivals Arena',
            type: 'standard',
            key: 'RivalsArena'
         },
         salty: {
            name: 'Salty Shores',
            type: 'standard',
            key: 'SaltyShores'
         },
         saltyNight: {
            name: 'Salty Shores (Night)',
            type: 'standard',
            key: 'SaltyShores_Night'
         },
         stadium: {
            name: 'DFH Stadium',
            type: 'standard',
            key: 'DFHStadium'
         },
         stadiumDay: {
            name: 'DFH Stadium (Day)',
            type: 'standard',
            key: 'DFHStadium_Day'
         },
         stadiumSnowy: {
            name: 'DFH Stadium (Snowy)',
            type: 'snowy',
            key: 'DFHStadium_Snowy'
         },
         stadiumStormy: {
            name: 'DFH Stadium (Stormy)',
            type: 'standard',
            key: 'DFHStadium_Stormy'
         },
         starbase: {
            name: 'Starbase Arc',
            type: 'standard',
            key: 'StarbaseArc'
         },
         throwback: {
            name: 'Throwback Stadium',
            type: 'labs',
            key: 'ThrowbackStadium'
         },
         tokyo: {
            name: 'Neo Tokyo',
            type: 'standard',
            key: 'NeoTokyo'
         },
         underpass: {
            name: 'Underpass',
            type: 'labs',
            key: 'Underpass'
         },
         underpassTokyo: {
            name: 'Tokyo Underpass',
            type: 'labs',
            key: 'TokyoUnderpass'
         },
         urban: {
            name: 'Urban Central',
            type: 'standard',
            key: 'UrbanCentral'
         },
         urbanDawn: {
            name: 'Urban Central (Dawn)',
            type: 'standard',
            key: 'UrbanCentral_Dawn'
         },
         urbanNight: {
            name: 'Urban Central (Night)',
            type: 'standard',
            key: 'UrbanCentral_Night'
         },
         utopia: {
            name: 'Utopia Coliseum',
            type: 'standard',
            key: 'UtopiaColiseum'
         },
         utopiaDusk: {
            name: 'Utopia Coliseum (Dusk)',
            type: 'standard',
            key: 'UtopiaColiseum_Dusk'
         },
         utopiaSnowy: {
            name: 'Utopia Coliseum (Snowy)',
            type: 'snowy',
            key: 'UtopiaColiseum_Snowy'
         },
         wasteland: {
            name: 'Wasteland',
            type: 'standard',
            key: 'Wasteland'
         },
         wastelandNight: {
            name: 'Wasteland (Night)',
            type: 'standard',
            key: 'Wasteland_Night'
         }
      },
      default: {
         name: 'Rocket League',
         options: {
            mode: 'Soccer',
            save_replays: false,
            skip_countdowns: false,
            skip_replays: false
         },
         mutators: {
            match_length: '5 Minutes',
            max_score: 'Unlimited',
            overtime: 'Unlimited',
            series_length: 'Unlimited',
            game_speed: 'Default',
            ball_max_speed: 'Default',
            ball_type: 'Default',
            ball_weight: 'Default',
            ball_size: 'Default',
            ball_bounciness: 'Default',
            boost_amount: 'Default',
            rumble: 'None',
            boost_strength: '1x',
            gravity: 'Default',
            demolish: 'Default',
            respawn_time: '3 Seconds'
         },
         maps: [ 'standard', 'snowy', 'labs', 'dropshot', 'hoops' ]
      },
      presets: {
         boomer_ball: {
            name: 'Boomer Ball',
            mutators: {
               boost_amount: 'Unlimited',
               ball_max_speed: 'Super Fast',
               ball_weight: 'Super Light',
               ball_bounciness: 'Super High',
               boost_strength: '1.5x'
            },
            maps: [ 'standard' ]
         },
         custom: {
            name: 'Custom',
            maps: [ 'standard', 'snowy', 'labs', 'dropshot', 'hoops' ]
         },
         dropshot: {
            name: 'Dropshot',
            options: { mode: 'Dropshot' },
            maps: [ 'dropshot' ]
         },
         heatseeker: {
            name: 'Heatseeker',
            options: { mode: 'Heatseeker' },
            maps: [ 'standard' ]
         },
         hoops: {
            name: 'Hoops',
            options: { mode: 'Hoops' },
            maps: [ 'hoops' ]
         },
         rumble: {
            name: 'Rumble',
            options: { mode: 'Rumble' },
            maps: [ 'standard', 'labs' ]
         },
         snow_day: {
            name: 'Snow Day',
            options: { mode: 'Hockey' },
            maps: [ 'snowy' ]
         },
         standard: {
            name: 'Standard',
            maps: [ 'standard' ]
         },
         training: {
            name: 'Training',
            mutators: {
               boost_amount: 'Unlimited',
               match_length: 'Unlimited',
               respawn_time: 'Disable Goal Reset'
            },
            maps: [ 'standard' ]
         }
      }
   };
}
