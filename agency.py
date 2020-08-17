from os import path
from pathlib import Path
from rlbot.agents.hivemind.drone_agent import DroneAgent

class Agency(DroneAgent):
   hive_key = 'skrrripted-agent'
   hive_path = path.join(Path(__file__).parent, 'agent.py')
   hive_name = 'HIVE NAME'