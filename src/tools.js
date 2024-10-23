export function uuid() {
    const url = URL.createObjectURL(new Blob())
    const [id] = url.toString().split('/').reverse()
    URL.revokeObjectURL(url)
    return id
  }

export function JSONToFile(obj, filename) {
    const tempLink = document.createElement("a");
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'text/plain' });
    tempLink.setAttribute('href', URL.createObjectURL(blob));
    tempLink.setAttribute('download', filename);
    tempLink.click();
    URL.revokeObjectURL(tempLink.href);
}
