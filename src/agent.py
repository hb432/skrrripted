from json import load
from math import pi, floor
from os import path, getcwd

from rlbot.utils.game_state_util import GameState, CarState
from rlbot.utils.structures.game_data_struct import GameTickPacket
from rlbot.agents.base_agent import BaseAgent, SimpleControllerState

# from pprint import pprint

session = { 'leader': None, 'agent': {}, 'script': {} }


def reset(ctrl):
    ctrl.boost = False
    ctrl.handbrake = False
    ctrl.jump = False
    ctrl.pitch = 0
    ctrl.roll = 0
    ctrl.steer = 0
    ctrl.throttle = 0
    ctrl.yaw = 0


def control(ctrl, data, tick):
    data = data['instructions']
    total = 0
    for i in range(len(data)):
        code = data[i].split(' ')
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

def refresh ():
    session['agent'] = load(open(path.join(getcwd(), 'src', 'agent.json')))
    session['script'] = load(open(path.join(getcwd(), 'src', session['agent']['script'])))

class Agent(BaseAgent):
    
    def initialize_agent(self):
        self.tick = 0
        self.mode = 0
        self.control = SimpleControllerState()
        if session['leader'] == None:
            session['leader'] = self.index

    def get_output(self, packet: GameTickPacket):
        cars = session['script']['cars']
        ready = packet.game_info.is_round_active
        if self.mode == 1 and ready and self.index < len(cars):
            if self.index == session['leader']:
                if self.tick == -30:
                    state = GameState.create_from_gametickpacket(packet)
                    cars = cars
                    physics(state.ball.physics, session['script']['ball'], False)
                    for i in range(len(cars)):
                        physics(state.cars[i].physics, cars[i], False)
                    self.set_game_state(state)
                if self.tick == -1:
                    state = GameState.create_from_gametickpacket(packet)
                    physics(state.ball.physics, session['script']['ball'], True)
                    for i in range(len(cars)):
                        physics(state.cars[i].physics, cars[i], True)
                    self.set_game_state(state)
            if self.tick > -1:
                control(self.control, cars[self.index], self.tick)
            self.tick = self.tick + 1
        if self.mode == 0 and ready:
            self.tick = -30
            self.mode = 1
        if self.mode == 1 and not ready:
            if self.index == session['leader']:
                refresh()
            reset(self.control)
            self.mode = 0
        return self.control

refresh()