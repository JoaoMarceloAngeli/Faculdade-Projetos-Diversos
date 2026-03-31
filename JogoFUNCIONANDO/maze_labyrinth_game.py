import pygame
import sys
import os
import math
import networkx as nx
import random

# Import pygame patches for compatibility
import pygame_patches

from battle_system import BattleSystem

class Player:
    def __init__(self):
        self.power = 5
        self.level = 1
        self.items = []
        self.current_node = None
        self.path_weight = 0
        self.visited_nodes = []
        self.experience = 0  # Novo atributo para experiência

class Maze:
    def __init__(self, num_nodes=12):
        self.graph = nx.Graph()
        self.nodes = [f"Nó {i}" for i in range(num_nodes)]  # Traduzido para português
        self.start_node = None
        self.boss_node = None
        self.node_positions = {}
        self.generate_maze(num_nodes)
        self.calculate_positions()

    def roll_d20(self):
        return random.randint(1, 20)

    def generate_maze(self, num_nodes):
        # Create a basic path to ensure connectivity
        for i in range(num_nodes - 1):
            weight = self.roll_d20()
            self.graph.add_edge(self.nodes[i], self.nodes[i + 1], weight=weight)

        # Add random extra edges to create branching paths
        num_extra_edges = num_nodes // 2
        for _ in range(num_extra_edges):
            u, v = random.sample(self.nodes, 2)
            if u != v and not self.graph.has_edge(u, v):
                weight = self.roll_d20()
                self.graph.add_edge(u, v, weight=weight)

        self.start_node = self.nodes[0]
        # Select a random boss node, ensuring it's not the start node and is at least 3 steps away
        possible_boss_nodes = [node for node in self.nodes if node != self.start_node]
        # Try to find a node that's at least 3 steps away
        far_nodes = []
        for node in possible_boss_nodes:
            try:
                path = nx.shortest_path(self.graph, source=self.start_node, target=node)
                if len(path) >= 4:  # Start + at least 3 more nodes
                    far_nodes.append(node)
            except nx.NetworkXNoPath:
                continue
        
        if far_nodes:
            self.boss_node = random.choice(far_nodes)
        else:
            # If no node is far enough, just pick a random one
            self.boss_node = random.choice(possible_boss_nodes)

    def calculate_positions(self):
        # Use NetworkX spring layout for positioning
        pos = nx.spring_layout(self.graph, seed=42, k=3, iterations=50)
        
        # Normalize positions to fit screen with margins
        margin = 100
        screen_width = 1200
        screen_height = 800
        
        xs = [p[0] for p in pos.values()]
        ys = [p[1] for p in pos.values()]
        min_x, max_x = min(xs), max(xs)
        min_y, max_y = min(ys), max(ys)
        
        for node in pos:
            x, y = pos[node]
            norm_x = margin + (x - min_x) / (max_x - min_x) * (screen_width - 2 * margin)
            norm_y = margin + (y - min_y) / (max_y - min_y) * (screen_height - 2 * margin)
            self.node_positions[node] = (int(norm_x), int(norm_y))

    def get_shortest_path_weight(self):
        try:
            shortest_path_weight = nx.shortest_path_length(
                self.graph, 
                source=self.start_node, 
                target=self.boss_node, 
                weight='weight'
            )
            return shortest_path_weight
        except nx.NetworkXNoPath:
            print("Erro: Nenhum caminho encontrado entre o início e o boss.")
            return None

    def get_neighbors(self, node):
        return list(self.graph.neighbors(node))

    def get_edge_weight(self, u, v):
        return self.graph[u][v]['weight']

class MazeLabyrinthGame:
    def __init__(self):
        pygame.init()
        self.width = 1200
        self.height = 800
        self.screen = pygame.display.set_mode((self.width, self.height))
        pygame.display.set_caption("Labirinto de Grafos - Aventura Monster Battle")
        self.clock = pygame.time.Clock()
        self.running = True
        
        # Colors
        self.BLACK = (0, 0, 0)
        self.WHITE = (255, 255, 255)
        self.BLUE = (100, 150, 255)
        self.GREEN = (100, 255, 100)
        self.RED = (255, 100, 100)
        self.YELLOW = (255, 255, 100)
        self.GRAY = (128, 128, 128)
        self.DARK_BLUE = (50, 100, 200)
        self.ORANGE = (255, 165, 0)
        
        # Fonts
        self.font_large = pygame.font.Font(None, 36)
        self.font_medium = pygame.font.Font(None, 24)
        self.font_small = pygame.font.Font(None, 18)
        
        # Game objects
        self.maze = Maze(num_nodes=15)
        self.player = Player()
        self.player.current_node = self.maze.start_node
        self.player.visited_nodes.append(self.maze.start_node)
        
        # Game state
        self.game_state = "exploring"  # "exploring", "battle", "victory", "defeat", "game_over"
        self.selected_node = None
        self.battle_result = None
        
        print(f"Labirinto gerado! Início: {self.maze.start_node}, Boss: {self.maze.boss_node}")
        print(f"Peso do caminho mais curto: {self.maze.get_shortest_path_weight()}")

    def handle_events(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                self.running = False
            elif event.type == pygame.MOUSEBUTTONDOWN:
                if event.button == 1:  # Left click
                    self.handle_mouse_click(event.pos)
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    self.running = False
                elif event.key == pygame.K_r and (self.game_state == "victory" or self.game_state == "defeat" or self.game_state == "game_over"):
                    self.reset_game()

    def reset_game(self):
        # Reset the game to start a new round
        self.maze = Maze(num_nodes=15)
        self.player = Player()
        self.player.current_node = self.maze.start_node
        self.player.visited_nodes.append(self.maze.start_node)
        self.game_state = "exploring"
        self.selected_node = None
        self.battle_result = None
        
        print(f"Novo labirinto gerado! Início: {self.maze.start_node}, Boss: {self.maze.boss_node}")
        print(f"Peso do caminho mais curto: {self.maze.get_shortest_path_weight()}")

    def handle_mouse_click(self, mouse_pos):
        if self.game_state != "exploring":
            return
            
        # Check if clicked on a node
        for node, pos in self.maze.node_positions.items():
            distance = math.sqrt((mouse_pos[0] - pos[0])**2 + (mouse_pos[1] - pos[1])**2)
            if distance <= 30:  # Node radius
                if node in self.maze.get_neighbors(self.player.current_node):
                    # Move to this node
                    edge_weight = self.maze.get_edge_weight(self.player.current_node, node)
                    self.player.path_weight += edge_weight
                    self.player.current_node = node
                    if node not in self.player.visited_nodes:
                        self.player.visited_nodes.append(node)
                        self.player.experience += 10  # Ganhar experiência por explorar novos nós
                    
                    print(f"Movido para {node}, Peso da aresta: {edge_weight}, Peso total do caminho: {self.player.path_weight}")
                    
                    # Check if reached boss
                    if node == self.maze.boss_node:
                        self.start_battle()
                break

    def start_battle(self):
        shortest_weight = self.maze.get_shortest_path_weight()
        penalty = max(0, self.player.path_weight - shortest_weight)
        
        print(f"Batalha iniciada!")
        print(f"Peso do caminho do jogador: {self.player.path_weight}")
        print(f"Peso do caminho mais curto: {shortest_weight}")
        print(f"Penalidade: {penalty}")
        
        # Start the battle system
        self.game_state = "battle"
        battle_system = BattleSystem(penalty)
        self.battle_result = battle_system.run()
        
        # Process battle result
        if self.battle_result == 'victory':
            self.game_state = "victory"
            self.player.experience += 100  # Experiência por vencer o boss
            print("Vitória! Você derrotou o boss!")
        elif self.battle_result == 'defeat':
            self.game_state = "defeat"
            print("Derrota! O boss era muito forte!")
        else:  # 'escape' or None
            self.game_state = "exploring"
            print("Retornado à exploração.")

    def draw_maze(self):
        # Draw edges
        for u, v in self.maze.graph.edges():
            pos_u = self.maze.node_positions[u]
            pos_v = self.maze.node_positions[v]
            
            # Color edges based on if they've been traversed
            edge_color = self.YELLOW if (u in self.player.visited_nodes and v in self.player.visited_nodes) else self.GRAY
            pygame.draw.line(self.screen, edge_color, pos_u, pos_v, 3)
            
            # Draw edge weight
            mid_x = (pos_u[0] + pos_v[0]) // 2
            mid_y = (pos_u[1] + pos_v[1]) // 2
            weight = self.maze.get_edge_weight(u, v)
            weight_text = self.font_small.render(str(weight), True, self.WHITE)
            weight_rect = weight_text.get_rect(center=(mid_x, mid_y))
            
            # Draw background for weight text
            pygame.draw.circle(self.screen, self.BLACK, (mid_x, mid_y), 12)
            self.screen.blit(weight_text, weight_rect)

    def draw_nodes(self):
        for node, pos in self.maze.node_positions.items():
            # Determine node color
            if node == self.player.current_node:
                color = self.GREEN
                radius = 35
            elif node == self.maze.boss_node:
                color = self.RED
                radius = 35
            elif node == self.maze.start_node:
                color = self.BLUE
                radius = 30
            elif node in self.player.visited_nodes:
                color = self.YELLOW
                radius = 25
            elif node in self.maze.get_neighbors(self.player.current_node):
                color = self.ORANGE
                radius = 25
            else:
                color = self.GRAY
                radius = 20
            
            # Draw node
            pygame.draw.circle(self.screen, color, pos, radius)
            pygame.draw.circle(self.screen, self.BLACK, pos, radius, 2)
            
            # Draw node label
            node_num = node.split()[-1]
            text = self.font_medium.render(node_num, True, self.BLACK)
            text_rect = text.get_rect(center=pos)
            self.screen.blit(text, text_rect)

    def draw_ui(self):
        # Draw info panel
        info_y = 10
        
        # Current node
        current_text = self.font_medium.render(f"Atual: {self.player.current_node}", True, self.WHITE)
        self.screen.blit(current_text, (10, info_y))
        info_y += 30
        
        # Path weight
        weight_text = self.font_medium.render(f"Peso do Caminho: {self.player.path_weight}", True, self.WHITE)
        self.screen.blit(weight_text, (10, info_y))
        info_y += 30
        
        # Player stats
        power_text = self.font_medium.render(f"Poder: {self.player.power}", True, self.WHITE)
        self.screen.blit(power_text, (10, info_y))
        info_y += 30
        
        level_text = self.font_medium.render(f"Nível: {self.player.level}", True, self.WHITE)
        self.screen.blit(level_text, (10, info_y))
        info_y += 30
        
        exp_text = self.font_medium.render(f"Experiência: {self.player.experience}", True, self.WHITE)
        self.screen.blit(exp_text, (10, info_y))
        info_y += 30
        
        # Boss location
        boss_text = self.font_medium.render(f"Boss: {self.maze.boss_node}", True, self.WHITE)
        self.screen.blit(boss_text, (10, info_y))
        info_y += 30
        
        # Shortest path weight
        shortest = self.maze.get_shortest_path_weight()
        shortest_text = self.font_medium.render(f"Caminho Mais Curto: {shortest}", True, self.WHITE)
        self.screen.blit(shortest_text, (10, info_y))
        info_y += 30
        
        # Instructions
        if self.game_state == "exploring":
            inst_text = self.font_small.render("Clique nos nós laranja para se mover. Alcance o nó vermelho do boss!", True, self.WHITE)
            self.screen.blit(inst_text, (10, self.height - 40))
        
        # Game state messages
        if self.game_state == "victory":
            victory_text = self.font_large.render("VITÓRIA! Você derrotou o boss!", True, self.GREEN)
            text_rect = victory_text.get_rect(center=(self.width//2, self.height//2 - 50))
            pygame.draw.rect(self.screen, self.BLACK, text_rect.inflate(20, 20))
            self.screen.blit(victory_text, text_rect)
            
            restart_text = self.font_medium.render("Pressione R para jogar novamente", True, self.WHITE)
            restart_rect = restart_text.get_rect(center=(self.width//2, self.height//2 + 20))
            self.screen.blit(restart_text, restart_rect)
            
        elif self.game_state == "defeat":
            defeat_text = self.font_large.render("DERROTA! O boss era muito forte!", True, self.RED)
            text_rect = defeat_text.get_rect(center=(self.width//2, self.height//2 - 50))
            pygame.draw.rect(self.screen, self.BLACK, text_rect.inflate(20, 20))
            self.screen.blit(defeat_text, text_rect)
            
            restart_text = self.font_medium.render("Pressione R para tentar novamente", True, self.WHITE)
            restart_rect = restart_text.get_rect(center=(self.width//2, self.height//2 + 20))
            self.screen.blit(restart_text, restart_rect)
            
        elif self.game_state == "game_over":
            game_over_text = self.font_large.render("FIM DE JOGO!", True, self.RED)
            text_rect = game_over_text.get_rect(center=(self.width//2, self.height//2 - 50))
            pygame.draw.rect(self.screen, self.BLACK, text_rect.inflate(20, 20))
            self.screen.blit(game_over_text, text_rect)
            
            restart_text = self.font_medium.render("Pressione R para jogar novamente", True, self.WHITE)
            restart_rect = restart_text.get_rect(center=(self.width//2, self.height//2 + 20))
            self.screen.blit(restart_text, restart_rect)

    def run(self):
        while self.running:
            self.handle_events()
            
            # Clear screen
            self.screen.fill(self.BLACK)
            
            # Draw game elements
            if self.game_state in ["exploring", "victory", "defeat", "game_over"]:
                self.draw_maze()
                self.draw_nodes()
                self.draw_ui()
            
            # Update display
            pygame.display.flip()
            self.clock.tick(60)
        
        pygame.quit()

if __name__ == "__main__":
    game = MazeLabyrinthGame()
    game.run()

