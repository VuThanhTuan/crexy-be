export interface ResponseResult<T> {
    message: string | null;
    data: T;
}