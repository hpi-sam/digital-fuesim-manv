export interface HttpResponse<T extends object | undefined = undefined> {
    statusCode: number;
    body: HttpErrorMessage | T;
}

interface HttpErrorMessage {
    message: string;
}
