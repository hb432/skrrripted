from pprint import pprint
from json import load
from shutil import copy2
from math import floor, pi
from rlbot.setup_manager import SetupManager
from os import path, environ, mkdir, write, getcwd
from rlbot.utils.game_state_util import GameState
from rlbot.utils.structures.game_data_struct import GameTickPacket
from rlbot.agents.base_agent import BaseAgent, SimpleControllerState


doc = path.join(environ['USERPROFILE'], 'Documents/Skrrripted')
src = path.join(getcwd(), 'src')
if not path.isdir(doc):
    mkdir(doc)
if not path.isfile(path.join(doc, 'options.json')):
    copy2(path.join(src, 'ball.json'), doc)
    copy2(path.join(src, 'agent.json'), doc)
    copy2(path.join(src, 'options.json'), doc)

M = [[], []]


def prop_phys(json):
    prop = []
    prop[0][0] = json.location.x
    prop[0][1] = json.location.y
    prop[0][2] = json.location.z
    prop[1][0] = json.rotation.pitch
    prop[1][1] = json.rotation.roll
    prop[1][2] = json.rotation.yaw
    prop[2][0] = json.velocity.x
    prop[2][1] = json.velocity.y
    prop[2][2] = json.velocity.z
    prop[3][0] = json.angular_velocity.x
    prop[3][1] = json.angular_velocity.y
    prop[3][2] = json.angular_velocity.z
    return prop


def apply_phys(phys, prop: list):
    phys.location.x = prop[0][0]
    phys.location.y = prop[0][1]
    phys.location.z = prop[0][2]
    phys.rotation.pitch = prop[1][0]
    phys.rotation.roll = prop[1][1]
    phys.rotation.yaw = prop[1][2]
    phys.velocity.x = prop[2][0]
    phys.velocity.y = prop[2][1]
    phys.velocity.z = prop[2][2]
    phys.angular_velocity.x = prop[3][0]
    phys.angular_velocity.y = prop[3][1]
    phys.angular_velocity.z = prop[3][2]


def apply_ctrl(ctrl: SimpleControllerState, prop: list):
    if prop[0] != None:
        ctrl.boost = prop[0]
    if prop[1] != None:
        ctrl.handbrake = prop[1]
    if prop[2] != None:
        ctrl.jump = prop[2]
    if prop[3] != None:
        ctrl.pitch = prop[3]
    if prop[4] != None:
        ctrl.roll = prop[4]
    if prop[5] != None:
        ctrl.steer = prop[5]
    if prop[6] != None:
        ctrl.throttle = prop[6]
    if prop[7] != None:
        ctrl.yaw = prop[7]


class Agent(BaseAgent):

    def initialize_agent(self):
        self.tick = 0
        self.control = SimpleControllerState()

    def get_output(self, packet: GameTickPacket):
        control = M[0][self.index + 1]
        if self.tick == 0:
            state = GameState.create_from_gametickpacket(packet)
            phys(state.ball.physics, options['ball'].physics)
            phys(state.cars[self.index].physics,
                 options['agents'][self.agent].physics)
            ctrl(self.control, [False, False, False, 0, 0, 0, 0, 0])
            self.set_game_state(state)
        if self.tick == -60:
            state = GameState.create_from_gametickpacket(packet)
            apply_phys(state.ball.physics, [
                [0, 0, 92.75], [0, 0, 0], [0, 0, 0], [0, 0, 0]
            ])
            apply_phys(state.cars[self.index].physics, [
                [0, (self.index + 1) * 500, 20], [0, 0, 0], [0, 0, 0], [0, 0, 0]
            ])
            apply_ctrl(self.control, [False, False, False, 0, 0, 0, 0, 0])
            self.set_game_state(state)
        elif self.tick == -1:
            state = GameState.create_from_gametickpacket(packet)
            apply_phys(state.ball.physics, M[0][0][0])
            apply_phys(state.cars[self.index].physics, array[0])
            self.set_game_state(state)
        elif self.tick > 0:
            if self.tick < len(array):
                apply_ctrl(self.control, array[self.tick])
        if packet.game_info.is_round_active:
            self.tick += 1
        return self.control


def seq_init(physics: list):
    M[0].append([physics])
    M[1].append(1)


def seq_step(agent: int, amount: int):
    M[1][agent] += amount


def seq_fill(agent: int, amount: int):
    for i in range(amount):
        M[0][agent].append([
            None, None, None, None, None, None, None, None
        ])


def seq_push(agent: int, index: int, button: str, value: bool):
    control = M[0][agent][index]
    if button == 'boost':
        control[0] = value
    elif button == 'drift':
        control[1] = value
    elif button == 'jump':
        control[2] = value
    elif button == 'roll-f':
        if value:
            control[3] = -1
        else:
            control[3] = 0
    elif button == 'roll-b':
        if value:
            control[3] = 1
        else:
            control[3] = 0
    elif button == 'roll-l':
        if value:
            control[4] = -1
        else:
            control[4] = 0
    elif button == 'roll-r':
        if value:
            control[4] = 1
        else:
            control[4] = 0
    elif button == 'turn-l':
        if value:
            control[5] = -1
        else:
            control[5] = 0
    elif button == 'turn-r':
        if value:
            control[5] = 1
        else:
            control[5] = 0
    elif button == 'throttle-f':
        if value:
            control[6] = 1
        else:
            control[6] = 0
    elif button == 'throttle-b':
        if value:
            control[6] = -1
        else:
            control[6] = 0
    elif button == 'spin-l':
        if value:
            control[7] = -1
        else:
            control[7] = 0
    elif button == 'spin-r':
        if value:
            control[7] = 1
        else:
            control[7] = 0


def seq_trig(agent: int, button: str, time: int):
    array = M[0][agent]
    index = M[1][agent]
    extent = index + time
    seq_fill(agent, extent - len(array) + 1)
    seq_push(agent, index, button, True)
    seq_push(agent, extent, button, False)


def seq(physics: list, control: list):
    seq_init(physics)
    agent = len(M[0]) - 1
    for i in range(len(control)):
        node = control[i]
        if node[0] == 'wait':
            seq_step(agent, node[1])
        else:
            seq_trig(agent, node[0], node[1])


options = load(open(path.join(doc, 'options.json')))
pprint(options)

ball = prop_phys(load(open(path.join(doc, options.ball), 0)))
agents = []
for i in range(len(options.agents)):
    agent = load(open(path.join(doc, options.agents[i]), 0))

    # ball
seq([
    [0, 0, 92.75],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
], [
])

# agent 1
seq([
    [-250, -5, 20],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
], [
    ['throttle-f', 120],
    ['wait', 60],
    ['boost', 40],
    ['wait', 60],
    ['throttle-b', 5],
    ['wait', 50],
    ['turn-r', 1],
    ['boost', 60],
    ['throttle-f', 160],
    ['wait', 30],
    ['turn-l', 1],
    ['wait', 50],
    ['turn-r', 14],
    ['wait', 140],
    ['roll-l', 28],
    ['roll-b', 6],
    ['spin-l', 5],
    ['boost', 6],
    ['wait', 20],
    ['roll-f', 10],
    ['wait', 10],
    ['boost', 50],
    ['wait', 40],
    ['roll-f', 10],
    ['wait', 30],
    ['roll-f', 1],
    ['jump', 1]
])
