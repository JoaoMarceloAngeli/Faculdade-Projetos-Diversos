import pygame

# Monkey patch pygame.key.get_just_pressed
# This is needed because the original Monster Battle code uses this function
# which doesn't exist in standard pygame
def get_just_pressed():
    keys = pygame.key.get_pressed()
    result = {}
    result[pygame.K_UP] = keys[pygame.K_UP] and not get_just_pressed.prev_keys.get(pygame.K_UP, False)
    result[pygame.K_DOWN] = keys[pygame.K_DOWN] and not get_just_pressed.prev_keys.get(pygame.K_DOWN, False)
    result[pygame.K_LEFT] = keys[pygame.K_LEFT] and not get_just_pressed.prev_keys.get(pygame.K_LEFT, False)
    result[pygame.K_RIGHT] = keys[pygame.K_RIGHT] and not get_just_pressed.prev_keys.get(pygame.K_RIGHT, False)
    result[pygame.K_SPACE] = keys[pygame.K_SPACE] and not get_just_pressed.prev_keys.get(pygame.K_SPACE, False)
    result[pygame.K_ESCAPE] = keys[pygame.K_ESCAPE] and not get_just_pressed.prev_keys.get(pygame.K_ESCAPE, False)
    
    # Update previous keys
    get_just_pressed.prev_keys = {
        pygame.K_UP: keys[pygame.K_UP],
        pygame.K_DOWN: keys[pygame.K_DOWN],
        pygame.K_LEFT: keys[pygame.K_LEFT],
        pygame.K_RIGHT: keys[pygame.K_RIGHT],
        pygame.K_SPACE: keys[pygame.K_SPACE],
        pygame.K_ESCAPE: keys[pygame.K_ESCAPE]
    }
    
    return result

# Initialize the previous keys dictionary
get_just_pressed.prev_keys = {}

# Add the function to pygame.key
pygame.key.get_just_pressed = get_just_pressed

print("Pygame patches loaded successfully!")

