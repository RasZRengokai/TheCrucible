// item_const.js

// Lista de configurações de troca
const exchangeConfigs = [
    {
        // Lista de itens a serem trocados
        itemsToExchange: [
            "ecbl_bs:sandstone_pillar_end_lower",
            "ecbl_bs:sandstone_pillar_side",
            "ecbl_bs:sandstone_pillar_side_upper",
        ],
        // Item que o jogador irá receber em troca
        itemToReceive: "ecbl_bs:sandstone_pillar"
    },
    {
        itemsToExchange: [
            "ecbl_bs:stone_pillar_end_lower",
            "ecbl_bs:stone_pillar_side",
            "ecbl_bs:stone_pillar_side_upper",
        ],
        itemToReceive: "ecbl_bs:stone_pillar",
        tag: "exchange_stone",
    },
    {
        itemsToExchange: [
            "ecbl_bs:mossy_stone_pillar_end_lower",
            "ecbl_bs:mossy_stone_pillar_side",
            "ecbl_bs:mossy_stone_pillar_side_upper",
        ],
        itemToReceive: "ecbl_bs:mossy_stone_pillar",
        tag: "exchange_mossy_stone",
    },
    {
        itemsToExchange: [
            "ecbl_bs:totem_of_negation",
            "ecbl_bs:totem_of_negation_animation"
        ],
        itemToReceive: "ecbl_bs:totem_of_negation_item"
    },
    {
        itemsToExchange: [
            "ecbl_bs:totem_of_undying"
        ],
        itemToReceive: "minecraft:totem_of_undying"
    },
    {
        itemsToExchange: [
            "ecbl_bs:totem_of_storm",
            "ecbl_bs:totem_of_thunderstorm_animation"
        ],
        itemToReceive: "ecbl_bs:totem_of_thunderstorm_item"
    },
    {
        itemsToExchange: [
            "ecbl_bs:totem_of_turtle",
            "ecbl_bs:totem_of_turtle_animation"
        ],
        itemToReceive: "ecbl_bs:totem_of_turtle_item"
    },
    {
        itemsToExchange: [
            "ecbl_bs:metal_soul_torch"
        ],
        itemToReceive: "ecbl_bs:metal_soul_torch_item"
    },
    {
        itemsToExchange: [
            "ecbl_bs:metal_torch"
        ],
        itemToReceive: "ecbl_bs:metal_torch_item"
    }

];

export default exchangeConfigs;
