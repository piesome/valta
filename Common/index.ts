import {expect} from "chai";

import {container} from "./inversify.config";
import {Game} from "./Game";

const game = container.get<Game>(Game);

game.load()
    .then(() => {
        const serialized = game.serialize();
        game.deserialize(serialized);
        const reserialized = game.serialize();
        expect(serialized).to.deep.equal(reserialized);
        console.log(serialized);
    })
    .catch((err) => {
        console.error(err);
    });
