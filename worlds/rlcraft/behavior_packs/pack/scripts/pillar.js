import { world } from "@minecraft/server";

world.afterEvents.playerPlaceBlock.subscribe((event) => {
    const { block, dimension } = event;

    if (block.typeId === "ecbl_bs:sandstone_pillar") {
        const checkBelowEndCommand = `testforblock ${block.location.x} ${block.location.y - 1} ${block.location.z} ecbl_bs:sandstone_pillar_end_lower`;

        world.getAllPlayers().forEach(player => {
            player.runCommandAsync(checkBelowEndCommand).then((result) => {
                if (result.successCount > 0) {
                    dimension.runCommand(`setblock ${block.location.x} ${block.location.y} ${block.location.z} ecbl_bs:sandstone_pillar_side_upper`);
                } else {
                    const checkBelowSideCommand = `testforblock ${block.location.x} ${block.location.y - 1} ${block.location.z} ecbl_bs:sandstone_pillar_side`;

                    player.runCommandAsync(checkBelowSideCommand).then((result) => {
                        if (result.successCount > 0) {
                            dimension.runCommand(`setblock ${block.location.x} ${block.location.y} ${block.location.z} ecbl_bs:sandstone_pillar_side_upper`);
                        } else {
                            const checkBelowSideUpperCommand = `testforblock ${block.location.x} ${block.location.y - 1} ${block.location.z} ecbl_bs:sandstone_pillar_side_upper`;

                            player.runCommandAsync(checkBelowSideUpperCommand).then((result) => {
                                if (result.successCount > 0) {
                                    dimension.runCommand(`setblock ${block.location.x} ${block.location.y - 1} ${block.location.z} ecbl_bs:sandstone_pillar_side`);
                                    dimension.runCommand(`setblock ${block.location.x} ${block.location.y} ${block.location.z} ecbl_bs:sandstone_pillar_side_upper`);
                                } else {
                                    const checkBelowPillarCommand = `testforblock ${block.location.x} ${block.location.y - 1} ${block.location.z} ecbl_bs:sandstone_pillar`;

                                    player.runCommandAsync(checkBelowPillarCommand).then((result) => {
                                        if (result.successCount > 0) {
                                            dimension.runCommand(`setblock ${block.location.x} ${block.location.y} ${block.location.z} ecbl_bs:sandstone_pillar_side_upper`);
                                            dimension.runCommand(`setblock ${block.location.x} ${block.location.y - 1} ${block.location.z} ecbl_bs:sandstone_pillar_end_lower`);
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        });
    }
});



world.afterEvents.playerPlaceBlock.subscribe((event) => {
    const { block, dimension } = event;

    if (block.typeId === "ecbl_bs:stone_pillar") {
        const checkBelowEndCommand = `testforblock ${block.location.x} ${block.location.y - 1} ${block.location.z} ecbl_bs:stone_pillar_end_lower`;

        world.getAllPlayers().forEach(player => {
            player.runCommandAsync(checkBelowEndCommand).then((result) => {
                if (result.successCount > 0) {
                    dimension.runCommand(`setblock ${block.location.x} ${block.location.y} ${block.location.z} ecbl_bs:stone_pillar_side_upper`);
                } else {
                    const checkBelowSideCommand = `testforblock ${block.location.x} ${block.location.y - 1} ${block.location.z} ecbl_bs:stone_pillar_side`;

                    player.runCommandAsync(checkBelowSideCommand).then((result) => {
                        if (result.successCount > 0) {
                            dimension.runCommand(`setblock ${block.location.x} ${block.location.y} ${block.location.z} ecbl_bs:stone_pillar_side_upper`);
                        } else {
                            const checkBelowSideUpperCommand = `testforblock ${block.location.x} ${block.location.y - 1} ${block.location.z} ecbl_bs:stone_pillar_side_upper`;

                            player.runCommandAsync(checkBelowSideUpperCommand).then((result) => {
                                if (result.successCount > 0) {
                                    dimension.runCommand(`setblock ${block.location.x} ${block.location.y - 1} ${block.location.z} ecbl_bs:stone_pillar_side`);
                                    dimension.runCommand(`setblock ${block.location.x} ${block.location.y} ${block.location.z} ecbl_bs:stone_pillar_side_upper`);
                                } else {
                                    const checkBelowPillarCommand = `testforblock ${block.location.x} ${block.location.y - 1} ${block.location.z} ecbl_bs:stone_pillar`;

                                    player.runCommandAsync(checkBelowPillarCommand).then((result) => {
                                        if (result.successCount > 0) {
                                            dimension.runCommand(`setblock ${block.location.x} ${block.location.y} ${block.location.z} ecbl_bs:stone_pillar_side_upper`);
                                            dimension.runCommand(`setblock ${block.location.x} ${block.location.y - 1} ${block.location.z} ecbl_bs:stone_pillar_end_lower`);
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        });
    }
});



world.afterEvents.playerPlaceBlock.subscribe((event) => {
    const { block, dimension } = event;

    if (block.typeId === "ecbl_bs:mossy_stone_pillar") {
        const checkBelowEndCommand = `testforblock ${block.location.x} ${block.location.y - 1} ${block.location.z} ecbl_bs:mossy_stone_pillar_end_lower`;

        world.getAllPlayers().forEach(player => {
            player.runCommandAsync(checkBelowEndCommand).then((result) => {
                if (result.successCount > 0) {
                    dimension.runCommand(`setblock ${block.location.x} ${block.location.y} ${block.location.z} ecbl_bs:mossy_stone_pillar_side_upper`);
                } else {
                    const checkBelowSideCommand = `testforblock ${block.location.x} ${block.location.y - 1} ${block.location.z} ecbl_bs:mossy_stone_pillar_side`;

                    player.runCommandAsync(checkBelowSideCommand).then((result) => {
                        if (result.successCount > 0) {
                            dimension.runCommand(`setblock ${block.location.x} ${block.location.y} ${block.location.z} ecbl_bs:mossy_stone_pillar_side_upper`);
                        } else {
                            const checkBelowSideUpperCommand = `testforblock ${block.location.x} ${block.location.y - 1} ${block.location.z} ecbl_bs:mossy_stone_pillar_side_upper`;

                            player.runCommandAsync(checkBelowSideUpperCommand).then((result) => {
                                if (result.successCount > 0) {
                                    dimension.runCommand(`setblock ${block.location.x} ${block.location.y - 1} ${block.location.z} ecbl_bs:mossy_stone_pillar_side`);
                                    dimension.runCommand(`setblock ${block.location.x} ${block.location.y} ${block.location.z} ecbl_bs:mossy_stone_pillar_side_upper`);
                                } else {
                                    const checkBelowPillarCommand = `testforblock ${block.location.x} ${block.location.y - 1} ${block.location.z} ecbl_bs:mossy_stone_pillar`;

                                    player.runCommandAsync(checkBelowPillarCommand).then((result) => {
                                        if (result.successCount > 0) {
                                            dimension.runCommand(`setblock ${block.location.x} ${block.location.y} ${block.location.z} ecbl_bs:mossy_stone_pillar_side_upper`);
                                            dimension.runCommand(`setblock ${block.location.x} ${block.location.y - 1} ${block.location.z} ecbl_bs:mossy_stone_pillar_end_lower`);
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        });
    }
});


world.afterEvents.playerPlaceBlock.subscribe((event) => {
    const { block, dimension } = event;

    if (block.typeId === "ecbl_bs:mossy_stone_pillar") {
        const checkBelowEndCommand = `testforblock ${block.location.x} ${block.location.y - 1} ${block.location.z} ecbl_bs:stone_pillar_end_lower`;

        world.getAllPlayers().forEach(player => {
            player.runCommandAsync(checkBelowEndCommand).then((result) => {
                if (result.successCount > 0) {
                    dimension.runCommand(`setblock ${block.location.x} ${block.location.y} ${block.location.z} ecbl_bs:mossy_stone_pillar_side_upper`);
                } else {
                    const checkBelowSideCommand = `testforblock ${block.location.x} ${block.location.y - 1} ${block.location.z} ecbl_bs:stone_pillar_side`;

                    player.runCommandAsync(checkBelowSideCommand).then((result) => {
                        if (result.successCount > 0) {
                            dimension.runCommand(`setblock ${block.location.x} ${block.location.y} ${block.location.z} ecbl_bs:mossy_stone_pillar_side_upper`);
                        } else {
                            const checkBelowSideUpperCommand = `testforblock ${block.location.x} ${block.location.y - 1} ${block.location.z} ecbl_bs:stone_pillar_side_upper`;

                            player.runCommandAsync(checkBelowSideUpperCommand).then((result) => {
                                if (result.successCount > 0) {
                                    dimension.runCommand(`setblock ${block.location.x} ${block.location.y - 1} ${block.location.z} ecbl_bs:stone_pillar_side`);
                                    dimension.runCommand(`setblock ${block.location.x} ${block.location.y} ${block.location.z} ecbl_bs:mossy_stone_pillar_side_upper`);
                                } else {
                                    const checkBelowPillarCommand = `testforblock ${block.location.x} ${block.location.y - 1} ${block.location.z} ecbl_bs:stone_pillar`;

                                    player.runCommandAsync(checkBelowPillarCommand).then((result) => {
                                        if (result.successCount > 0) {
                                            dimension.runCommand(`setblock ${block.location.x} ${block.location.y} ${block.location.z} ecbl_bs:mossy_stone_pillar_side_upper`);
                                            dimension.runCommand(`setblock ${block.location.x} ${block.location.y - 1} ${block.location.z} ecbl_bs:stone_pillar_end_lower`);
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        });
    }
});


world.afterEvents.playerPlaceBlock.subscribe((event) => {
    const { block, dimension } = event;

    if (block.typeId === "ecbl_bs:stone_pillar") {
        const checkBelowEndCommand = `testforblock ${block.location.x} ${block.location.y - 1} ${block.location.z} ecbl_bs:mossy_stone_pillar_end_lower`;

        world.getAllPlayers().forEach(player => {
            player.runCommandAsync(checkBelowEndCommand).then((result) => {
                if (result.successCount > 0) {
                    dimension.runCommand(`setblock ${block.location.x} ${block.location.y} ${block.location.z} ecbl_bs:stone_pillar_side_upper`);
                } else {
                    const checkBelowSideCommand = `testforblock ${block.location.x} ${block.location.y - 1} ${block.location.z} ecbl_bs:mossy_stone_pillar_side`;

                    player.runCommandAsync(checkBelowSideCommand).then((result) => {
                        if (result.successCount > 0) {
                            dimension.runCommand(`setblock ${block.location.x} ${block.location.y} ${block.location.z} ecbl_bs:stone_pillar_side_upper`);
                        } else {
                            const checkBelowSideUpperCommand = `testforblock ${block.location.x} ${block.location.y - 1} ${block.location.z} ecbl_bs:mossy_stone_pillar_side_upper`;

                            player.runCommandAsync(checkBelowSideUpperCommand).then((result) => {
                                if (result.successCount > 0) {
                                    dimension.runCommand(`setblock ${block.location.x} ${block.location.y - 1} ${block.location.z} ecbl_bs:mossy_stone_pillar_side`);
                                    dimension.runCommand(`setblock ${block.location.x} ${block.location.y} ${block.location.z} ecbl_bs:stone_pillar_side_upper`);
                                } else {
                                    const checkBelowPillarCommand = `testforblock ${block.location.x} ${block.location.y - 1} ${block.location.z} ecbl_bs:mossy_stone_pillar`;

                                    player.runCommandAsync(checkBelowPillarCommand).then((result) => {
                                        if (result.successCount > 0) {
                                            dimension.runCommand(`setblock ${block.location.x} ${block.location.y} ${block.location.z} ecbl_bs:stone_pillar_side_upper`);
                                            dimension.runCommand(`setblock ${block.location.x} ${block.location.y - 1} ${block.location.z} ecbl_bs:mossy_stone_pillar_end_lower`);
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        });
    }
});
