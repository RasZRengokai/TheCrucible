tp @s ~~0.25~ facing @e[type=hfrlc:nether_sword.target] true
execute unless block ~-2 ~ ~-2 bedrock unless block ~-1 ~ ~-2 bedrock unless block ~ ~ ~-2 bedrock unless block ~1 ~ ~-2 bedrock unless block ~2 ~ ~-2 bedrock unless block ~-2 ~ ~-1 bedrock unless block ~-1 ~ ~-1 bedrock unless block ~ ~ ~-1 bedrock unless block ~1 ~ ~-1 bedrock unless block ~2 ~ ~-1 bedrock unless block ~-2 ~ ~ bedrock unless block ~-1 ~ ~ bedrock unless block ~ ~ ~ bedrock unless block ~1 ~ ~ bedrock unless block ~2 ~ ~ bedrock unless block ~-2 ~ ~1 bedrock unless block ~-1 ~ ~1 bedrock unless block ~ ~ ~1 bedrock unless block ~1 ~ ~1 bedrock unless block ~2 ~ ~1 bedrock unless block ~-2 ~ ~2 bedrock unless block ~-1 ~ ~2 bedrock unless block ~ ~ ~2 bedrock unless block ~1 ~ ~2 bedrock unless block ~2 ~ ~2 bedrock run structure load mystructure:nether_sword.fire_attack ~-2 ~ ~-2
playsound bucket.empty_lava @a ~~~ 1 0.75 0.001
playsound bucket.empty_lava @a ~~~ 0.5 0.25 0.001
playsound liquid.lavapop @a ~~~ 1 1 0.001
playsound liquid.lavapop @a ~~~ 0.75 0.25 0.001
particle hfrlc:nether_sword.lava_burst ~~-0.25~
particle hfrlc:nether_sword.black_smoke ~~~