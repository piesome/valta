import {Container} from "inversify";
import "reflect-metadata";

import {TYPES} from "./types";
import {DataLoader} from "./DataManager";
import {FactionTypeManager} from "./FactionType";
import {TerrainTypeManager} from "./TerrainType";
import {UnitTypeManager} from "./UnitType";
import {Game} from "./Game";

const container = new Container();

container.bind<DataLoader>(TYPES.DataLoader).to(DataLoader).inSingletonScope();

container.bind<FactionTypeManager>(TYPES.FactionTypeManager).to(FactionTypeManager).inSingletonScope();
container.bind<TerrainTypeManager>(TYPES.TerrainTypeManager).to(TerrainTypeManager).inSingletonScope();
container.bind<UnitTypeManager>(TYPES.UnitTypeManager).to(UnitTypeManager).inSingletonScope();

container.bind<Game>(Game).toSelf();

export {container};
