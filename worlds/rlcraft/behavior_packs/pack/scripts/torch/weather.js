import { world, system } from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe((event) => {
  // Componentes para metal_torch
  event.blockComponentRegistry.registerCustomComponent('ecbl_bs:weather_up', new Weather_up());
  event.blockComponentRegistry.registerCustomComponent('ecbl_bs:weather_north', new Weather_north());
  event.blockComponentRegistry.registerCustomComponent('ecbl_bs:weather_south', new Weather_south());
  event.blockComponentRegistry.registerCustomComponent('ecbl_bs:weather_east', new Weather_east());
  event.blockComponentRegistry.registerCustomComponent('ecbl_bs:weather_west', new Weather_west());
  
  // Componentes para metal_soul_torch (com sufixo _soul)
  event.blockComponentRegistry.registerCustomComponent('ecbl_bs:weather_up_soul', new Weather_up_soul());
  event.blockComponentRegistry.registerCustomComponent('ecbl_bs:weather_north_soul', new Weather_north_soul());
  event.blockComponentRegistry.registerCustomComponent('ecbl_bs:weather_south_soul', new Weather_south_soul());
  event.blockComponentRegistry.registerCustomComponent('ecbl_bs:weather_east_soul', new Weather_east_soul());
  event.blockComponentRegistry.registerCustomComponent('ecbl_bs:weather_west_soul', new Weather_west_soul());
});

// COMPONENTES METAL_TORCH

class Weather_up {
    async onTick(data) {
        let BlockX = data.block.x;
        let BlockY = data.block.y;
        let BlockZ = data.block.z;

        const testForCommand = `testforblock ${BlockX} ${BlockY} ${BlockZ} ecbl_bs:metal_torch ["minecraft:block_face"="up","ecbl_bs:light"=0]`;

        for (const player of world.getAllPlayers()) {
            try {
                let result = await player.runCommandAsync(testForCommand);
                if (result.successCount > 0) {

                    world.afterEvents.weatherChange.subscribe(async (eventData) => {
                        let weather = eventData.newWeather;
                        if (weather === 'Rain' || weather === 'Thunder') {
                            let allAir = true;
                            for (let y = BlockY + 1; y <= 320; y++) {
                                const testForAir = `testforblock ${BlockX} ${y} ${BlockZ} air`;
                                try {
                                    let airResult = await player.runCommandAsync(testForAir);
                                    if (airResult.successCount === 0) {
                                        allAir = false;
                                        break;
                                    }
                                } catch (error) {
                                    allAir = false;
                                    break;
                                }
                            }
                            if (allAir) {
                                const fillCommand = `fill ${BlockX} ${BlockY} ${BlockZ} ${BlockX} ${BlockY} ${BlockZ} ecbl_bs:metal_torch ["minecraft:block_face"="up","ecbl_bs:light"=1] replace ecbl_bs:metal_torch ["minecraft:block_face"="up","ecbl_bs:light"=0]`;
                                await data.block.dimension.runCommand(fillCommand);
                            }
                        }
                    });
                }
            } catch (error) {
                console.error("Erro ao executar o comando (Up):", error);
            }
        }
    }
}

class Weather_north {
    async onTick(data) {
        let BlockX = data.block.x;
        let BlockY = data.block.y;
        let BlockZ = data.block.z;

        const testForCommand = `testforblock ${BlockX} ${BlockY} ${BlockZ} ecbl_bs:metal_torch ["minecraft:block_face"="north","ecbl_bs:light"=0]`;

        for (const player of world.getAllPlayers()) {
            try {
                let result = await player.runCommandAsync(testForCommand);
                if (result.successCount > 0) {

                    world.afterEvents.weatherChange.subscribe(async (eventData) => {
                        let weather = eventData.newWeather;
                        if (weather === 'Rain' || weather === 'Thunder') {
                            let allAir = true;
                            for (let y = BlockY + 1; y <= 320; y++) {
                                const testForAir = `testforblock ${BlockX} ${y} ${BlockZ} air`;
                                try {
                                    let airResult = await player.runCommandAsync(testForAir);
                                    if (airResult.successCount === 0) {
                                        allAir = false;
                                        break;
                                    }
                                } catch (error) {
                                    allAir = false;
                                    break;
                                }
                            }
                            if (allAir) {
                                const fillCommand = `fill ${BlockX} ${BlockY} ${BlockZ} ${BlockX} ${BlockY} ${BlockZ} ecbl_bs:metal_torch ["minecraft:block_face"="north","ecbl_bs:light"=1] replace ecbl_bs:metal_torch ["minecraft:block_face"="north","ecbl_bs:light"=0]`;
                                await data.block.dimension.runCommand(fillCommand);
                            }
                        }
                    });
                }
            } catch (error) {
                console.error("Erro ao executar o comando (North):", error);
            }
        }
    }
}

class Weather_south {
    async onTick(data) {
        let BlockX = data.block.x;
        let BlockY = data.block.y;
        let BlockZ = data.block.z;

        const testForCommand = `testforblock ${BlockX} ${BlockY} ${BlockZ} ecbl_bs:metal_torch ["minecraft:block_face"="south","ecbl_bs:light"=0]`;

        for (const player of world.getAllPlayers()) {
            try {
                let result = await player.runCommandAsync(testForCommand);
                if (result.successCount > 0) {

                    world.afterEvents.weatherChange.subscribe(async (eventData) => {
                        let weather = eventData.newWeather;
                        if (weather === 'Rain' || weather === 'Thunder') {
                            let allAir = true;
                            for (let y = BlockY + 1; y <= 320; y++) {
                                const testForAir = `testforblock ${BlockX} ${y} ${BlockZ} air`;
                                try {
                                    let airResult = await player.runCommandAsync(testForAir);
                                    if (airResult.successCount === 0) {
                                        allAir = false;
                                        break;
                                    }
                                } catch (error) {
                                    allAir = false;
                                    break;
                                }
                            }
                            if (allAir) {
                                const fillCommand = `fill ${BlockX} ${BlockY} ${BlockZ} ${BlockX} ${BlockY} ${BlockZ} ecbl_bs:metal_torch ["minecraft:block_face"="south","ecbl_bs:light"=1] replace ecbl_bs:metal_torch ["minecraft:block_face"="south","ecbl_bs:light"=0]`;
                                await data.block.dimension.runCommand(fillCommand);
                            }
                        }
                    });
                }
            } catch (error) {
                console.error("Erro ao executar o comando (South):", error);
            }
        }
    }
}

class Weather_east {
    async onTick(data) {
        let BlockX = data.block.x;
        let BlockY = data.block.y;
        let BlockZ = data.block.z;

        const testForCommand = `testforblock ${BlockX} ${BlockY} ${BlockZ} ecbl_bs:metal_torch ["minecraft:block_face"="east","ecbl_bs:light"=0]`;

        for (const player of world.getAllPlayers()) {
            try {
                let result = await player.runCommandAsync(testForCommand);
                if (result.successCount > 0) {

                    world.afterEvents.weatherChange.subscribe(async (eventData) => {
                        let weather = eventData.newWeather;
                        if (weather === 'Rain' || weather === 'Thunder') {;
                            let allAir = true;
                            for (let y = BlockY + 1; y <= 320; y++) {
                                const testForAir = `testforblock ${BlockX} ${y} ${BlockZ} air`;
                                try {
                                    let airResult = await player.runCommandAsync(testForAir);
                                    if (airResult.successCount === 0) {
                                        allAir = false;
                                        break;
                                    }
                                } catch (error) {
                                    allAir = false;
                                    break;
                                }
                            }
                            if (allAir) {
                                const fillCommand = `fill ${BlockX} ${BlockY} ${BlockZ} ${BlockX} ${BlockY} ${BlockZ} ecbl_bs:metal_torch ["minecraft:block_face"="east","ecbl_bs:light"=1] replace ecbl_bs:metal_torch ["minecraft:block_face"="east","ecbl_bs:light"=0]`;
                                await data.block.dimension.runCommand(fillCommand);
                            }
                        }
                    });
                }
            } catch (error) {
                console.error("Erro ao executar o comando (East):", error);
            }
        }
    }
}

class Weather_west {
    async onTick(data) {
        let BlockX = data.block.x;
        let BlockY = data.block.y;
        let BlockZ = data.block.z;

        const testForCommand = `testforblock ${BlockX} ${BlockY} ${BlockZ} ecbl_bs:metal_torch ["minecraft:block_face"="west","ecbl_bs:light"=0]`;

        for (const player of world.getAllPlayers()) {
            try {
                let result = await player.runCommandAsync(testForCommand);
                if (result.successCount > 0) {

                    world.afterEvents.weatherChange.subscribe(async (eventData) => {
                        let weather = eventData.newWeather;
                        if (weather === 'Rain' || weather === 'Thunder') {
                            let allAir = true;
                            for (let y = BlockY + 1; y <= 320; y++) {
                                const testForAir = `testforblock ${BlockX} ${y} ${BlockZ} air`;
                                try {
                                    let airResult = await player.runCommandAsync(testForAir);
                                    if (airResult.successCount === 0) {
                                        allAir = false;
                                        break;
                                    }
                                } catch (error) {
                                    allAir = false;
                                    break;
                                }
                            }
                            if (allAir) {
                                const fillCommand = `fill ${BlockX} ${BlockY} ${BlockZ} ${BlockX} ${BlockY} ${BlockZ} ecbl_bs:metal_torch ["minecraft:block_face"="west","ecbl_bs:light"=1] replace ecbl_bs:metal_torch ["minecraft:block_face"="west","ecbl_bs:light"=0]`;
                                await data.block.dimension.runCommand(fillCommand);
                            }
                        }
                    });
                }
            } catch (error) {
                console.error("Erro ao executar o comando (West):", error);
            }
        }
    }
}

// COMPONENTES METAL_SOUL_TORCH

class Weather_up_soul {
    async onTick(data) {
        let BlockX = data.block.x;
        let BlockY = data.block.y;
        let BlockZ = data.block.z;

        const testForCommand = `testforblock ${BlockX} ${BlockY} ${BlockZ} ecbl_bs:metal_soul_torch ["minecraft:block_face"="up","ecbl_bs:light"=0]`;

        for (const player of world.getAllPlayers()) {
            try {
                let result = await player.runCommandAsync(testForCommand);
                if (result.successCount > 0) {

                    world.afterEvents.weatherChange.subscribe(async (eventData) => {
                        let weather = eventData.newWeather;
                        if (weather === 'Rain' || weather === 'Thunder') {
                            let allAir = true;
                            for (let y = BlockY + 1; y <= 320; y++) {
                                const testForAir = `testforblock ${BlockX} ${y} ${BlockZ} air`;
                                try {
                                    let airResult = await player.runCommandAsync(testForAir);
                                    if (airResult.successCount === 0) {
                                        allAir = false;
                                        break;
                                    }
                                } catch (error) {
                                    allAir = false;
                                    break;
                                }
                            }
                            if (allAir) {
                                const fillCommand = `fill ${BlockX} ${BlockY} ${BlockZ} ${BlockX} ${BlockY} ${BlockZ} ecbl_bs:metal_soul_torch ["minecraft:block_face"="up","ecbl_bs:light"=1] replace ecbl_bs:metal_soul_torch ["minecraft:block_face"="up","ecbl_bs:light"=0]`;
                                await data.block.dimension.runCommand(fillCommand);
                            }
                        }
                    });
                }
            } catch (error) {
                console.error("Erro ao executar o comando (Up Soul):", error);
            }
        }
    }
}

class Weather_north_soul {
    async onTick(data) {
        let BlockX = data.block.x;
        let BlockY = data.block.y;
        let BlockZ = data.block.z;

        const testForCommand = `testforblock ${BlockX} ${BlockY} ${BlockZ} ecbl_bs:metal_soul_torch ["minecraft:block_face"="north","ecbl_bs:light"=0]`;

        for (const player of world.getAllPlayers()) {
            try {
                let result = await player.runCommandAsync(testForCommand);
                if (result.successCount > 0) {

                    world.afterEvents.weatherChange.subscribe(async (eventData) => {
                        let weather = eventData.newWeather;
                        if (weather === 'Rain' || weather === 'Thunder') {
                            let allAir = true;
                            for (let y = BlockY + 1; y <= 320; y++) {
                                const testForAir = `testforblock ${BlockX} ${y} ${BlockZ} air`;
                                try {
                                    let airResult = await player.runCommandAsync(testForAir);
                                    if (airResult.successCount === 0) {
                                        allAir = false;
                                        break;
                                    }
                                } catch (error) {
                                    allAir = false;
                                    break;
                                }
                            }
                            if (allAir) {
                                const fillCommand = `fill ${BlockX} ${BlockY} ${BlockZ} ${BlockX} ${BlockY} ${BlockZ} ecbl_bs:metal_soul_torch ["minecraft:block_face"="north","ecbl_bs:light"=1] replace ecbl_bs:metal_soul_torch ["minecraft:block_face"="north","ecbl_bs:light"=0]`;
                                await data.block.dimension.runCommand(fillCommand);
                            }
                        }
                    });
                }
            } catch (error) {
                console.error("Erro ao executar o comando (North Soul):", error);
            }
        }
    }
}

class Weather_south_soul {
    async onTick(data) {
        let BlockX = data.block.x;
        let BlockY = data.block.y;
        let BlockZ = data.block.z;

        const testForCommand = `testforblock ${BlockX} ${BlockY} ${BlockZ} ecbl_bs:metal_soul_torch ["minecraft:block_face"="south","ecbl_bs:light"=0]`;

        for (const player of world.getAllPlayers()) {
            try {
                let result = await player.runCommandAsync(testForCommand);
                if (result.successCount > 0) {

                    world.afterEvents.weatherChange.subscribe(async (eventData) => {
                        let weather = eventData.newWeather;
                        if (weather === 'Rain' || weather === 'Thunder') {
                            let allAir = true;
                            for (let y = BlockY + 1; y <= 320; y++) {
                                const testForAir = `testforblock ${BlockX} ${y} ${BlockZ} air`;
                                try {
                                    let airResult = await player.runCommandAsync(testForAir);
                                    if (airResult.successCount === 0) {
                                        allAir = false;
                                        break;
                                    }
                                } catch (error) {
                                    allAir = false;
                                    break;
                                }
                            }
                            if (allAir) {
                                const fillCommand = `fill ${BlockX} ${BlockY} ${BlockZ} ${BlockX} ${BlockY} ${BlockZ} ecbl_bs:metal_soul_torch ["minecraft:block_face"="south","ecbl_bs:light"=1] replace ecbl_bs:metal_soul_torch ["minecraft:block_face"="south","ecbl_bs:light"=0]`;
                                await data.block.dimension.runCommand(fillCommand);
                            }
                        }
                    });
                }
            } catch (error) {
                console.error("Erro ao executar o comando (South Soul):", error);
            }
        }
    }
}

class Weather_east_soul {
    async onTick(data) {
        let BlockX = data.block.x;
        let BlockY = data.block.y;
        let BlockZ = data.block.z;

        const testForCommand = `testforblock ${BlockX} ${BlockY} ${BlockZ} ecbl_bs:metal_soul_torch ["minecraft:block_face"="east","ecbl_bs:light"=0]`;

        for (const player of world.getAllPlayers()) {
            try {
                let result = await player.runCommandAsync(testForCommand);
                if (result.successCount > 0) {

                    world.afterEvents.weatherChange.subscribe(async (eventData) => {
                        let weather = eventData.newWeather;
                        if (weather === 'Rain' || weather === 'Thunder') {
                            let allAir = true;
                            for (let y = BlockY + 1; y <= 320; y++) {
                                const testForAir = `testforblock ${BlockX} ${y} ${BlockZ} air`;
                                try {
                                    let airResult = await player.runCommandAsync(testForAir);
                                    if (airResult.successCount === 0) {
                                        allAir = false;
                                        break;
                                    }
                                } catch (error) {
                                    allAir = false;
                                    break;
                                }
                            }
                            if (allAir) {
                                const fillCommand = `fill ${BlockX} ${BlockY} ${BlockZ} ${BlockX} ${BlockY} ${BlockZ} ecbl_bs:metal_soul_torch ["minecraft:block_face"="east","ecbl_bs:light"=1] replace ecbl_bs:metal_soul_torch ["minecraft:block_face"="east","ecbl_bs:light"=0]`;
                                await data.block.dimension.runCommand(fillCommand);
                            }
                        }
                    });
                }
            } catch (error) {
                console.error("Erro ao executar o comando (East Soul):", error);
            }
        }
    }
}

class Weather_west_soul {
    async onTick(data) {
        let BlockX = data.block.x;
        let BlockY = data.block.y;
        let BlockZ = data.block.z;

        const testForCommand = `testforblock ${BlockX} ${BlockY} ${BlockZ} ecbl_bs:metal_soul_torch ["minecraft:block_face"="west","ecbl_bs:light"=0]`;

        for (const player of world.getAllPlayers()) {
            try {
                let result = await player.runCommandAsync(testForCommand);
                if (result.successCount > 0) {

                    world.afterEvents.weatherChange.subscribe(async (eventData) => {
                        let weather = eventData.newWeather;
                        if (weather === 'Rain' || weather === 'Thunder') {
                            let allAir = true;
                            for (let y = BlockY + 1; y <= 320; y++) {
                                const testForAir = `testforblock ${BlockX} ${y} ${BlockZ} air`;
                                try {
                                    let airResult = await player.runCommandAsync(testForAir);
                                    if (airResult.successCount === 0) {
                                        allAir = false;
                                        break;
                                    }
                                } catch (error) {
                                    allAir = false;
                                    break;
                                }
                            }
                            if (allAir) {
                                const fillCommand = `fill ${BlockX} ${BlockY} ${BlockZ} ${BlockX} ${BlockY} ${BlockZ} ecbl_bs:metal_soul_torch ["minecraft:block_face"="west","ecbl_bs:light"=1] replace ecbl_bs:metal_soul_torch ["minecraft:block_face"="west","ecbl_bs:light"=0]`;
                                await data.block.dimension.runCommand(fillCommand);
                            }
                        }
                    });
                }
            } catch (error) {
                console.error("Erro ao executar o comando (West Soul):", error);
            }
        }
    }
}
