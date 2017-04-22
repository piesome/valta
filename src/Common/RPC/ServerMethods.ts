import * as GS from "../GameState";

// lobbies

export const ListLobbies = "ListLobbies";
export type IListLobbiesParams = void;
export interface IListLobbiesResponse {
    lobbyIds: GS.ID[];
}

export const CreateLobby = "CreateLobby";
export type ICreateLobbyParams = void;
export interface ICreateLobbyResponse {
    id: GS.ID;
}

export const JoinLobby = "JoinLobby";
export interface IJoinLobbyParams {
    id: GS.ID;
}
export type IJoinLobbyResponse = void;

export const LeaveLobby = "LeaveLobby";
export type ILeaveLobbyParams = void;
export type ILeaveLobbyResponse = void;

export const SelectFaction = "SelectFaction";
export interface ISelectFactionParams {
    factionType: GS.FactionType;
}
export type ISelectFactionResponse = void;

// game

export const StartGame = "StartGame";
export type IStartGameParams = void;
export type IStartGameResponse = void;

export const GetGameState = "GetGameState";
export type IGetGameStateParams = void;
export type IGetGameStateResponse = GS.IGameState;

export const JoinGame = "JoinGame";
export interface IJoinGameParams {
    id: GS.ID;
}
export type IJoinGameResponse = void;

export const EndTurn = "EndTurn";
export type IEndTurnParams = void;
export type IEndTurnResponse = void;

/**
 * Todo automatically populated from above
 */
export const SERVER_METHODS = [
    GetGameState,
    StartGame,
    SelectFaction,
    LeaveLobby,
    JoinLobby,
    CreateLobby,
    ListLobbies,
    JoinGame,
    EndTurn,
];
