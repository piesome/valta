export type CFn<T> = <T>(err: Error, data: T) => void;
export type Fn<T> = (...params: any[]) => void;

export function promisify<T>(fn: Fn<T>, params: any[]): Promise<T> {
    return new Promise<T>((accept, reject) => {
        params.push((err: Error, data: T) => {
            if (err) {
                return reject(err);
            }
            accept(data);
        });

        fn(...params);
    });
}
