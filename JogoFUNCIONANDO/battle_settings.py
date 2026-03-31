import pygame
from os.path import join 
from os import walk

WINDOW_WIDTH, WINDOW_HEIGHT = 1200, 800 

COLORS = {
    'black': '#000000',
    'red': '#ee1a0f',
    'gray': 'gray',
    'white': '#ffffff',
}

MONSTER_DATA = {
	'Cappuccino':     {'element': 'fire',  'health': 180},
	'Saddinero':       {'element': 'fire',  'health': 50},
    'Tralalaeo Tralala':       {'element': 'water',  'health': 100},
    'Bailarina':       {'element': 'water',  'health': 150},
    'TungTungSahur':     {'element': 'plant',  'health': 100},
}

# Bosses especiais que o usuário pediu
BOSS_DATA = {
    'Tung Tung Tung Sahur': {'element': 'fire', 'health': 200},
    'Tralalaeo Tralala': {'element': 'water', 'health': 180},
}

ABILITIES_DATA = {
	'scratch': {'damage': 90,  'element': 'normal', 'animation': 'scratch'},
	'spark':   {'damage': 80,  'element': 'fire',   'animation': 'fire'},
	'nuke':    {'damage': 80,  'element': 'fire',   'animation': 'explosion'},
	'splash':  {'damage': 35,  'element': 'water',  'animation': 'splash'},
	'shards':  {'damage': 30,  'element': 'water',  'animation': 'ice'},
    'spiral':  {'damage': 50,  'element': 'plant',  'animation': 'green'}
}

ELEMENT_DATA = {
    'fire':   {'water': 0.5, 'plant': 2,   'fire': 1,   'normal': 1},
    'water':  {'water': 1,   'plant': 0.5, 'fire': 2,   'normal': 1},
    'plant':  {'water': 2,   'plant': 1,   'fire': 0.5, 'normal': 1},
    'normal': {'water': 1,   'plant': 1,   'fire': 1,   'normal': 1},
}

