import * as GS from "../GameState";

export const SelectFaction = "SelectFaction";
export interface ISelectFactionParams {
    factionType: GS.FactionType;
}
export type ISelectFactionResponse = void;

export const StartGame = "StartGame";
export type IStartGameParams = void;
export type IStartGameResponse = void;

export const GetGameState = "GetGameState";
export type IGetGameStateParams = void;
export type IGetGameStateResponse = GS.IGame;

export const EndTurn = "EndTurn";
export type IEndTurnParams = void;
export type IEndTurnResponse = void;

/**
 * Todo automatically populated from above
 */
export const SERVER_METHODS = [
    SelectFaction,
    StartGame,
    GetGameState,
    EndTurn,
];
