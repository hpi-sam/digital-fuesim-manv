export async function getImageAspectRatio(url: string) {
    return new Promise<number>((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
            resolve(image.naturalHeight / image.naturalWidth);
        };
        image.onerror = () => {
            reject();
        };
        image.src = url;
    });
}
