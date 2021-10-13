
tile layer:

# wall_layer: implement collision data by matter.js
  setCollisionFromCollisionGroup
  convertTilemapLayer

# bg_layer and other: no collision

object layer:

# info_layer: would not be added to matter, info only
  spawn_point, coin_point, etc...

# text_layer: hint text

# sensor_layer: for worldEvent detection
  ready_zone

# fov_layer (not implemented yet)