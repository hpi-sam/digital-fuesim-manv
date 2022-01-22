export interface HttpResponse<T extends object | undefined = undefined> {
    statusCode: number;
    body: T | HttpErrorMessage;
}

interface HttpErrorMessage {
    message: string;
}
