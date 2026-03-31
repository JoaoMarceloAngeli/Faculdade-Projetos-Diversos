from battle_settings import * 
from random import sample

class Creature:
    def get_data(self, name):
        # Verificar se é um boss especial
        if name in BOSS_DATA:
            self.element = BOSS_DATA[name]['element']
            self._health = self.max_health = BOSS_DATA[name]['health']
        else:
            self.element = MONSTER_DATA[name]['element']
            self._health = self.max_health = MONSTER_DATA[name]['health']
        
        self.abilities = sample(list(ABILITIES_DATA.keys()),4)
        self.name = name
    
    @property
    def health(self):
        return self._health
    
    @health.setter
    def health(self, value):
        self._health = min(self.max_health, max(0, value))

class Monster(pygame.sprite.Sprite, Creature):
    def __init__(self, name, surf):
        super().__init__()
        self.image = surf 
        self.rect = self.image.get_rect()
        self.rect.bottomleft = (100, WINDOW_HEIGHT)
        self.get_data(name)
    
    def __repr__(self):
        return f'{self.name}: {self.health}/{self.max_health}'

class Opponent(pygame.sprite.Sprite, Creature):
    def __init__(self, name, surf, groups, penalty=0):
        super().__init__(groups)
        self.image = surf
        self.rect = self.image.get_rect()
        self.rect.midbottom = (WINDOW_WIDTH - 250, 300)
        self.get_data(name)
        
        # Apply penalty to boss stats if needed
        if penalty > 0:
            # Increase health based on penalty
            health_boost = min(50, penalty)  # Cap at 50 to avoid making it impossible
            self._health += health_boost
            self.max_health += health_boost

