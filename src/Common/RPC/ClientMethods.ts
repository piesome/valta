import * as GS from "../GameState";

export const GameUpdate = "GameUpdate";
export type IGameUpdateParams = GS.IGame;

export const AdjustIds = "AdjustIds";
export interface IAdjustIdsParams {
    youAre: GS.ID;
    iAm: GS.ID;
}
