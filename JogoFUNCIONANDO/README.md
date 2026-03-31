# Labirinto de Grafos - Monster Battle Adventure

## Descrição
Um jogo baseado em grafos onde o jogador navega por um labirinto para chegar ao boss final. O caminho escolhido afeta a dificuldade da batalha final estilo Pokémon.

## Novidades da Versão Atualizada
- **Bosses Especiais**: Agora você enfrenta "Tung Tung Tung Sahur" e "Tralalaeo Tralala" que alternam a cada batalha!
- **Interface em Português**: Todos os menus e textos traduzidos
- **Stats do Jogador**: Visualize seu Poder, Nível e Experiência durante a exploração
- **Sistema de Experiência**: Ganhe XP explorando novos nós e vencendo bosses

## Como Jogar

### Exploração do Labirinto
1. **Objetivo**: Navegue do nó inicial (azul) até o nó do boss (vermelho)
2. **Movimento**: Clique nos nós laranja (adjacentes) para se mover
3. **Peso do Caminho**: Cada aresta tem um peso que é somado ao seu caminho total
4. **Estratégia**: Tente encontrar o caminho mais eficiente para o boss

### Sistema de Penalização
- O jogo calcula o caminho mais curto possível até o boss
- Se você escolher um caminho mais longo, será penalizado na batalha:
  - **Boss**: Ganha vida extra baseada na penalidade
  - **Seus Monstros**: Perdem vida baseada na penalidade
  - **Penalidade = Peso do seu caminho - Peso do caminho mais curto**

### Batalha Pokémon
Quando você chega ao boss, inicia uma batalha por turnos contra um dos bosses especiais:
- **Atacar**: Use as setas para navegar e ESPAÇO para selecionar
- **Curar**: Restaura 50 HP do seu monstro ativo
- **Trocar**: Mude para outro monstro da sua equipe
- **Fugir**: Retorna ao labirinto (ESC também funciona)

### Controles
- **Mouse**: Clique nos nós para se mover no labirinto
- **Setas**: Navegação nos menus de batalha
- **ESPAÇO**: Confirmar seleção na batalha
- **ESC**: Voltar/Fugir
- **R**: Reiniciar o jogo (após vitória/derrota)

### Bosses Especiais
- **Tung Tung Tung Sahur**: Boss de fogo com 200 HP
- **Tralalaeo Tralala**: Boss de água com 180 HP
- Os bosses alternam automaticamente a cada nova batalha

### Stats do Jogador
- **Poder**: Força base do jogador
- **Nível**: Nível atual do jogador
- **Experiência**: XP ganho explorando e vencendo batalhas
  - +10 XP por explorar um novo nó
  - +100 XP por vencer um boss

### Elementos dos Monstros
- **Fogo**: Forte contra Planta, fraco contra Água
- **Água**: Forte contra Fogo, fraco contra Planta  
- **Planta**: Forte contra Água, fraco contra Fogo
- **Normal**: Neutro contra todos

### Dicas
1. Explore o labirinto visualmente antes de se mover
2. Pesos das arestas variam de 1-20 (dados de 20 lados)
3. Caminhos mais curtos = batalhas mais fáceis
4. Use elementos de forma estratégica na batalha
5. Gerencie a vida dos seus monstros com cura e trocas
6. Ganhe experiência explorando novos nós

## Arquivos do Jogo
- `maze_labyrinth_game.py`: Arquivo principal
- `battle_system.py`: Sistema de batalha
- `battle_*.py`: Módulos do sistema de batalha
- `assets/`: Imagens e sons dos monstros

## Requisitos
- Python 3.11+
- pygame
- networkx
- matplotlib (para geração de grafos)

Divirta-se explorando o labirinto e batalhando contra os bosses especiais!

