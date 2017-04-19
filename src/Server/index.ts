import {GameManager} from "./GameManager";
import {Server} from "./Server";

const server = new Server();
const gameManager = new GameManager();
gameManager.register(server);

gameManager.load()
    .then(() => {
        console.log("GameManager: loaded");
    }, (err) => {
        console.error(err);
        process.exit(1);
    });
