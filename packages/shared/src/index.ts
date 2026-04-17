export * from "./validation/index.js";

export type ApiResult<T> = {
    data: T;
    error?: string;
};
