export function uuid() {
    const url = URL.createObjectURL(new Blob())
    const [id] = url.toString().split('/').reverse()
    URL.revokeObjectURL(url)
    return id
  }

function clearImageFields(data) {
  if (Array.isArray(data)) {
      return data.map(item => clearImageFields(item));
  } else if (data && typeof data === 'object') {
      const result = {};
      for (const [key, value] of Object.entries(data)) {
          if (typeof value === 'string' && value.startsWith('data:image')) {
              result[key] = '';
          } else {
              result[key] = clearImageFields(value); 
          }
      }
      return result;
  }
  return data;
}

export function JSONToFile(obj, filename) {
    const download = (content, name) => {
        const link = document.createElement("a");
        const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'text/plain' });
        link.href = URL.createObjectURL(blob);
        link.download = name;
        link.click();
        URL.revokeObjectURL(link.href);
    };

    download(obj, filename);
    download(clearImageFields(obj), filename.replace(/\.(\w+)$/, '_debug.$1'));
}