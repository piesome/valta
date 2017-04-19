import {GameManager} from "./GameManager";
import {Server} from "./Server";

const server = new Server();
const gameManager = new GameManager();
gameManager.register(server);

gameManager.load()
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
