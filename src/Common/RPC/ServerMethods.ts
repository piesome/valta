import * as GS from "../GameState";

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

export const StartGame = "StartGame";
export type IStartGameParams = void;
export type IStartGameResponse = void;

export const GetGameState = "GetGameState";
export type IGetGameStateParams = void;
export type IGetGameStateResponse = GS.IGameState;

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
];
