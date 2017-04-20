import {EventEmitter} from "eventemitter3";
import {v4 as uuid} from "uuid";

export interface ICall {
    jsonrpc: "2.0";
    id: string;
    method: string;
    params: any;
}

export interface IResponse {
    jsonrpc: "2.0";
    id: string;
    result: any;
    error: string;
}

export abstract class RemotePeer extends EventEmitter {
    public id: string;

    private ongoingCalls: {[id: string]: (response: IResponse) => void};

    constructor() {
        super();

        this.id = uuid();
        this.ongoingCalls = {};
    }

    public respond(id: string, result: any) {
        this.send(JSON.stringify({
            jsonrpc: "2.0",
            id,
            result,
        }));
    }

    public error(id: string, error: string) {
        this.send(JSON.stringify({
            jsonrpc: "2.0",
            id,
            error,
            result: null,
        }));
    }

    protected callNoParams<ResponseType>(method: string): Promise<ResponseType> {
        return this.call<void, ResponseType>(method, null);
    }

    protected call<ParamsType, ResponseType>(method: string, params: ParamsType): Promise<ResponseType> {
        const id = uuid();
        const obj: ICall = {
            jsonrpc: "2.0",
            id,
            method,
            params,
        };

        this.send(JSON.stringify(obj));

        return new Promise<ResponseType>((accept, reject) => {
            this.ongoingCalls[id] = (response: IResponse) => {
                delete this.ongoingCalls[id];

                if (response.error) {
                    return reject(response.error);
                }
                accept(response.result);
            };
        });
    }

    protected onMessage(data: string) {
        try {
            const obj = JSON.parse(data);

            if (obj.id && obj.method) {
                this.emit("call", obj);
            } else if (obj.id) {
                this.ongoingCalls[obj.id](obj);
            } else {
                throw new Error(`Unknown message ${obj}`);
            }
        } catch (err) {
            console.error(err);
        }
    }

    protected abstract send(data: string): void;
}
