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

export const Action = "Action";
export interface IActionParams {
    action: string;
    actor: any;
    target: any;
}
export type IActionResponse = void;

export const RenameCity = "RenameCity";
export interface IRenameCityParams {
    id: string;
    name: string;
}
export type IRenameCityResponse = void;

/**
 * Todo automatically populated from above
 */
export const SERVER_METHODS = [
    SelectFaction,
    StartGame,
    GetGameState,
    EndTurn,
    Action,
    RenameCity,
];
