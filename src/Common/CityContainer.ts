import * as GS from "./GameState";
import {ModelContainer} from "./ModelContainer";
import {City} from "./Models";

export class CityContainer extends ModelContainer<GS.ICity, City> {
    constructor() {
        super("city", City.deserialize);
    }
}
