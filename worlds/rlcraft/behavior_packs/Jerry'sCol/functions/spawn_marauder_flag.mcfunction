gamerule commandblockoutput false
execute if block ~1 ~ ~ oak_fence run summon jerrys_colonies:marauder_flag_entity ~0.75 ~0.5 ~0.0 270 0
execute if block ~1 ~ ~ mangrove_fence run summon jerrys_colonies:marauder_flag_entity ~0.75 ~0.5 ~0.0 270 0
execute if block ~-1 ~ ~ oak_fence run summon jerrys_colonies:marauder_flag_entity ~-0.75 ~0.5 ~0.0 90 0
execute if block ~-1 ~ ~ mangrove_fence run summon jerrys_colonies:marauder_flag_entity ~-0.75 ~0.5 ~0.0 90 0
execute if block ~ ~ ~1 oak_fence run summon jerrys_colonies:marauder_flag_entity ~0.0 ~0.5 ~1.0 0 0
execute if block ~ ~ ~1 mangrove_fence run summon jerrys_colonies:marauder_flag_entity ~0.0 ~0.5 ~1.0 0 0
execute if block ~ ~ ~-1 oak_fence run summon jerrys_colonies:marauder_flag_entity ~0.0 ~0.5 ~-1.0 180 0
execute if block ~ ~ ~-1 mangrove_fence run summon jerrys_colonies:marauder_flag_entity ~0.0 ~0.5 ~-1.0 180 0
execute unless block ~1 ~ ~ oak_fence unless block ~1 ~ ~ mangrove_fence unless block ~-1 ~ ~ oak_fence unless block ~-1 ~ ~ mangrove_fence unless block ~ ~ ~1 oak_fence unless block ~ ~ ~1 mangrove_fence unless block ~ ~ ~-1 oak_fence unless block ~ ~ ~-1 mangrove_fence run summon jerrys_colonies:marauder_flag_entity ~0.5 ~0.5 ~0.5
fill ~ ~ ~ ~ ~ ~ air