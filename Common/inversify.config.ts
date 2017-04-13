import {Container} from "inversify";
import "reflect-metadata";

import {DataManager} from "./DataManager";
import {FactionTypeManager} from "./FactionType";
import {TerrainTypeManager} from "./TerrainType";
import {Game} from "./Game";

const container = new Container();

container.bind<DataManager>(DataManager).toConstantValue(new DataManager("data/"));
container.bind<FactionTypeManager>(FactionTypeManager).toSelf().inSingletonScope();
container.bind<TerrainTypeManager>(TerrainTypeManager).toSelf().inSingletonScope();
container.bind<Game>(Game).toSelf();

export {container};
