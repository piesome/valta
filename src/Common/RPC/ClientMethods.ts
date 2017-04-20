import * as GS from "../GameState";

export const LobbyUpdate = "LobbyUpdate";
export interface ILobbyUpdateParams {
    id: GS.ID;
    name: string;
    peers: Array<{
        id: GS.ID,
        factionType: string,
    }>;
    canBeStarted: boolean;
}

export const GameUpdate = "GameUpdate";
export type IGameUpdateParams = GS.IGameState;

export const GameStarted = "GameStarted";
export interface IGameStartedParams {
    gameState: GS.IGameState;
    faction: GS.IFaction;
}

export const AdjustIds = "AdjustIds";
export interface IAdjustIdsParams {
    youAre: GS.ID;
    iAm: GS.ID;
}
