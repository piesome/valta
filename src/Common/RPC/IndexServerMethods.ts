// client -> index server

export const Authenticate = "Authenticate";
export interface IAuthenticateParams {
    id: string;
    secret: string;
}
export type IAuthenticateResponse = void;

export const Register = "Register";
export type IRegisterParams = void;
export interface IRegisterResponse {
    id: string;
    secret: string;
}

export const ListGames = "ListGames";
export interface IListGamesParams {
    status?: string;
}
export interface IListGamesResponse {
    games: Array<{
        id: string;
        name: string;
        status: string;
        factionCount: number;
    }>;
}

export const JoinGame = "JoinGame";
export interface IJoinGameParams {
    id: string;
}
export interface IJoinGameResponse {
    url: string;
}

export const CreateGame = "CreateGame";
export type ICreateGameParams = void;
export interface ICreateGameResponse {
    url: string;
}

// game server -> index server

export const AuthenticateGameServer = "AuthenticateGameServer";
export interface IAuthenticateGameServerParams {
    id: string;
    secret: string;
    url: string;
}
export type IAuthenticateGameServerResponse = void;

export const RegisterGameServer = "RegisterGameServer";
export interface IRegisterGameServerParams {
    url: string;
}
export interface IRegisterGameServerResponse {
    id: string;
    secret: string;
}

export const SetGameStatus = "SetGameStatus";
export interface ISetGameStatusParams {
    id: string;
    name: string;
    status: string;
    factionCount: number;
}
export type ISetGameStatusResponse = void;

export const DeleteGameStatus = "DeleteGameStatus";
export interface IDeleteGameStatusParams {
    id: string;
}
export type IDeleteGameStatusResponse = void;
