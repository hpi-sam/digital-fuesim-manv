/**
 * @returns a Promise that resolves with the aspect ratio of the image
 * it rejects if the image Url is invalid
 */
export async function getImageAspectRatio(url: string) {
    return new Promise<number>((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
            resolve(image.naturalWidth / image.naturalHeight);
        };
        image.onerror = () => {
            reject();
        };
        image.src = url;
    });
}
