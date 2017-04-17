import {Server} from "./Server";
import {GameManager} from "./GameManager";


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
