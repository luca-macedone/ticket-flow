export * from "./validation/index.js";
export { z } from 'zod';

export type ApiResult<T> = {
    data: T;
    error?: string;
};
