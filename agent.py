from http import server
from json import loads
from math import pi, floor
from os import kill, path, chdir, getcwd, spawnl, unlink, P_NOWAIT
from pathlib import Path
from pprint import pprint
from requests import get
from requests.exceptions import ReadTimeout
from rlbot.agents.hivemind.python_hivemind import PythonHivemind
from rlbot.utils.game_state_util import GameState, CarState
from rlbot.utils.structures.bot_input_struct import PlayerInput
from rlbot.utils.structures.game_data_struct import GameTickPacket
from signal import SIGTERM
from time import time_ns

chdir(str(Path(__file__).parent))
session = { 'agents': [], 'data': {}, 'mode': 0, 'tick': 0 }

def control(ctrl, data, tick):
    total = 0
    for code in data['instructions']:
        code = code.split(' ')
        time = int(code[1])
        if code[0] == 'wait':
            total = total + time
        elif tick == total + time:
            if code[0] == 'jump':
                ctrl.jump = False
            if code[0] == 'boost':
                ctrl.boost = False
            if code[0] == 'drift':
                ctrl.handbrake = False
            if code[0] == 'forward':
                ctrl.pitch = 0
                ctrl.throttle = 0
            if code[0] == 'backward':
                ctrl.pitch = 0
                ctrl.throttle = 0
            if code[0] == 'turn-l':
                ctrl.yaw = 0
                ctrl.steer = 0
            if code[0] == 'turn-r':
                ctrl.yaw = 0
                ctrl.steer = 0
            if code[0] == 'roll-l':
                ctrl.roll = 0
            if code[0] == 'roll-r':
                ctrl.roll = 0
        elif tick == total:
            if code[0] == 'jump':
                ctrl.jump = True
            if code[0] == 'boost':
                ctrl.boost = True
            if code[0] == 'drift':
                ctrl.handbrake = True
            if code[0] == 'forward':
                ctrl.pitch = -1
                ctrl.throttle = 1
            if code[0] == 'backward':
                ctrl.pitch = 1
                ctrl.throttle = -1
            if code[0] == 'turn-l':
                ctrl.yaw = -1
                ctrl.steer = -1
            if code[0] == 'turn-r':
                ctrl.yaw = 1
                ctrl.steer = 1
            if code[0] == 'roll-l':
                ctrl.roll = -1
            if code[0] == 'roll-r':
                ctrl.roll = 1

def init():
    try:
        get('http://localhost:28442/init?agents=' + str(len(session['agents'])),timeout=1)
    except ReadTimeout:
        init()

def interface():
    refresh()
    if path.exists(marker('refresh')):
        unlink(marker('refresh'))
    if path.exists(marker('active')):
        if floor(time_ns() / 1000) - int(open(marker('active')).read()) < 10000:
            return
    spawnl(P_NOWAIT, path.join(getcwd(), 'interface/build/skrrripted.exe'), 'skrrripted.exe')

def marker(name):
    return path.join(getcwd(), name + '.temp')

def physics(phys, data, velo):
    phys.location.x = data['location']['x']
    phys.location.y = data['location']['y']
    phys.location.z = data['location']['z']
    phys.rotation.pitch = data['rotation']['pitch'] * (pi / 180)
    phys.rotation.roll = data['rotation']['roll'] * (pi / 180)
    phys.rotation.yaw = data['rotation']['yaw'] * (pi / 180)
    if velo:
        phys.velocity.x = data['velocity']['x']
        phys.velocity.y = data['velocity']['y']
        phys.velocity.z = data['velocity']['z']
        phys.angular_velocity.x = data['angular_velocity']['x']
        phys.angular_velocity.y = data['angular_velocity']['y']
        phys.angular_velocity.z = data['angular_velocity']['z']
    else:
        phys.velocity.x = 0
        phys.velocity.y = 0
        phys.velocity.z = 0
        phys.angular_velocity.x = 0
        phys.angular_velocity.y = 0
        phys.angular_velocity.z = 0

def refresh():
    session['data'] = loads(open(path.join(getcwd(), 'agent.json'), 'r').read())
    session['mode'] = 0
    for agent in session['agents']:
        reset(agent['control'])

def reset(ctrl):
    ctrl.boost = False
    ctrl.handbrake = False
    ctrl.jump = False
    ctrl.pitch = 0
    ctrl.roll = 0
    ctrl.steer = 0
    ctrl.throttle = 0
    ctrl.yaw = 0

class Agent(PythonHivemind):

    def initialize_hive(self, packet: GameTickPacket):
        for index in self.drone_indices:
            session['agents'].append({ 'index': index, 'control': PlayerInput(), 'car': len(session['agents'])})
        init()

    def get_outputs(self, packet: GameTickPacket):
        cars = session['data']['cars']
        ready = packet.game_info.is_round_active
        if session['mode'] == 1 and ready:
            if session['tick'] == -30:
                state = GameState.create_from_gametickpacket(packet)
                try:
                    physics(state.ball.physics, session['data']['ball'], False)
                    for agent in session['agents']:
                        physics(state.cars[agent['index']].physics, cars[agent['car']], False)
                except:
                    pass
                self.set_game_state(state)
            if session['tick'] == -1:
                state = GameState.create_from_gametickpacket(packet)
                try:
                    physics(state.ball.physics, session['data']['ball'], True)
                    for agent in session['agents']:
                        physics(state.cars[agent['index']].physics, cars[agent['car']], True)
                except:
                    pass
                self.set_game_state(state)
            if session['tick'] > -1:
                for agent in session['agents']:
                    if agent['car'] < len(cars):
                        try:
                            control(agent['control'], cars[agent['car']], session['tick'])
                        except:
                            pass
            session['tick'] = session['tick'] + 1
        if session['mode'] == 0 and ready:
            session['mode'] = 1
            session['tick'] = -30
            # todo: set tick based on game time, time it with exact second for consistent results
            # seconds = packet.game_info.game_time_remaining
        if session['mode'] == 1 and not ready:
            refresh()
        if path.exists(marker('refresh')):
            unlink(marker('refresh'))
            refresh()
        controls = {}
        for agent in session['agents']:
            if agent['index'] in self.drone_indices:
                controls[agent['index']] = agent['control']
        return controls

interface()
