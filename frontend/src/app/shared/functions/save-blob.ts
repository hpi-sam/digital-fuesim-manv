/**
 * Saves the blob under the specified fileName
 */
export function saveBlob(blob: Blob, fileName: string) {
    // See https://stackoverflow.com/a/19328891
    // this is inspired by https://github.com/eligrey/FileSaver.js
    const a = document.createElement('a');
    a.setAttribute('style', 'display: none');
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
}
