from battle_settings import *
from battle_support import *
from battle_timer import Timer
from battle_monster import *
from random import choice
from battle_ui import *
from battle_attack import AttackAnimationSprite

# Import pygame patches for compatibility
import pygame_patches

class BattleSystem:
    def __init__(self, penalty=0):
        self.display_surface = pygame.display.get_surface()
        self.clock = pygame.time.Clock()
        self.running = True
        self.result = None  # 'victory', 'defeat', or None if battle is ongoing
        self.penalty = penalty
        
        # Load assets
        self.import_assets()
        
        # Try to play music if available
        try:
            self.audio['music'].play(-1)
        except:
            print("Music couldn't be played")
        
        self.player_active = True

        # groups 
        self.all_sprites = pygame.sprite.Group()

        # data 
        player_monster_list = ['Cappuccino', 'Bailarina']
        self.player_monsters = [Monster(name, self.back_surfs[name]) for name in player_monster_list]
        
        # Apply penalty to player if needed
        if penalty > 0:
            # Reduce player monster health based on penalty
            for monster in self.player_monsters:
                health_reduction = min(monster.health // 2, penalty // 2)  # Cap at 50% to avoid instant death
                monster.health -= health_reduction
        
        self.monster = self.player_monsters[0]
        self.all_sprites.add(self.monster)
        
        # Escolher um dos bosses especiais
        # Alternar entre os dois bosses especiais
        import time
        current_time = int(time.time())
        if current_time % 2 == 0:  # Alternar com base no tempo atual (par/ímpar)
            boss_name = "Tung Tung Tung Sahur"
        else:
            boss_name = "Tralalaeo Tralala"
            
        # Usar um monstro normal como visual para o boss
        visual_monster = choice(list(MONSTER_DATA.keys()))
        self.opponent = Opponent(boss_name, self.front_surfs[visual_monster], self.all_sprites, penalty)

        # ui 
        self.ui = UI(self.monster, self.player_monsters, self.simple_surfs, self.get_input)
        self.opponent_ui = OpponentUI(self.opponent)

        # timers
        self.timers = {'player end': Timer(1000, func=self.opponent_turn), 'opponent end': Timer(1000, func=self.player_turn)}
        
        # Display penalty information
        self.penalty_font = pygame.font.Font(None, 24)
        
        print(f"Batalha iniciada contra {boss_name}!")
        print(f"Penalidade: {penalty}")
        if penalty > 0:
            print(f"Vida do boss aumentada em {min(50, penalty)}")
            print(f"Vida dos seus monstros reduzida em {min(penalty // 2, 50)}%")

    def get_input(self, state, data=None):
        if state == 'attack':
            self.apply_attack(self.opponent, data)
        elif state == 'heal':
            self.monster.health += 50
            AttackAnimationSprite(self.monster, self.attack_frames['green'], self.all_sprites)
            try:
                self.audio['green'].play()
            except:
                pass
        elif state == 'switch':
            self.monster.kill()
            self.monster = data
            self.all_sprites.add(self.monster)
            self.ui.monster = self.monster
        elif state == 'escape':
            self.running = False
            self.result = 'escape'
            
        self.player_active = False
        self.timers['player end'].activate()

    def apply_attack(self, target, attack):
        attack_data = ABILITIES_DATA[attack]
        attack_multiplier = ELEMENT_DATA[attack_data['element']][target.element]
        target.health -= attack_data['damage'] * attack_multiplier
        AttackAnimationSprite(target, self.attack_frames[attack_data['animation']], self.all_sprites)
        try:
            self.audio[attack_data['animation']].play()
        except:
            pass

    def opponent_turn(self):
        if self.opponent.health <= 0:
            self.result = 'victory'
            self.running = False
        else:
            attack = choice(self.opponent.abilities)
            self.apply_attack(self.monster, attack)
            self.timers['opponent end'].activate()

    def player_turn(self):
        self.player_active = True
        if self.monster.health <= 0:
            available_monsters = [monster for monster in self.player_monsters if monster.health > 0]
            if available_monsters:
                self.monster.kill()
                self.monster = available_monsters[0]
                self.all_sprites.add(self.monster)
                self.ui.monster = self.monster
            else:
                self.result = 'defeat'
                self.running = False

    def update_timers(self):
        for timer in self.timers.values():
            timer.update()

    def import_assets(self):
        self.back_surfs = folder_importer('assets/images', 'back')
        self.front_surfs = folder_importer('assets/images', 'front')
        self.bg_surfs = folder_importer('assets/images', 'other')
        self.simple_surfs = folder_importer('assets/images', 'simple')
        self.attack_frames = tile_importer(4, 'assets/images', 'attacks')
        
        # Try to load audio, but don't crash if it fails
        try:
            self.audio = audio_importer('assets/audio')
        except:
            print("Audio couldn't be loaded")
            self.audio = {}
            # Create dummy audio objects to prevent crashes
            for sound_name in ['music', 'green', 'fire', 'explosion', 'scratch', 'splash', 'ice']:
                self.audio[sound_name] = type('DummySound', (), {'play': lambda *args: None})()

    def draw_monster_floor(self):
        for sprite in self.all_sprites:
            if isinstance(sprite, Creature):
                floor_rect = self.bg_surfs['floor'].get_rect(center=(sprite.rect.midbottom[0], sprite.rect.midbottom[1] - 10))
                self.display_surface.blit(self.bg_surfs['floor'], floor_rect)

    def draw_penalty_info(self):
        if self.penalty > 0:
            penalty_text = f"Penalidade: {self.penalty} (Caminho mais longo)"
            text_surf = self.penalty_font.render(penalty_text, True, (255, 100, 100))
            self.display_surface.blit(text_surf, (10, 10))

    def run(self):
        while self.running:
            dt = self.clock.tick() / 1000
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    self.running = False
                    self.result = 'escape'
           
            # update
            self.update_timers()
            self.all_sprites.update(dt)
            if self.player_active:
                self.ui.update()

            # draw  
            self.display_surface.blit(self.bg_surfs['bg'], (0, 0))
            self.draw_monster_floor()
            self.all_sprites.draw(self.display_surface)
            self.ui.draw()
            self.opponent_ui.draw()
            self.draw_penalty_info()
            pygame.display.update()
        
        return self.result

