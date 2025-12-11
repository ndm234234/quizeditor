export function uuid() {
    const url = URL.createObjectURL(new Blob())
    const [id] = url.toString().split('/').reverse()
    URL.revokeObjectURL(url)
    return id
  }

function removeFields(data, fieldsToRemove = ['savedQuestion']) {
  if (Array.isArray(data)) {
    return data.map(item => removeFields(item, fieldsToRemove));
  } else if (data && typeof data === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(data)) {
      // Пропускаем указанные поля для удаления
      if (fieldsToRemove.includes(key)) {
        continue;
      }
      
      // Просто рекурсивно обрабатываем вложенные значения
      result[key] = removeFields(value, fieldsToRemove);
    }
    return result;
  }
  return data;
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

    const cleanedData = removeFields(obj, ['savedQuestion']);
    download(cleanedData, filename);
    download(clearImageFields(cleanedData), filename.replace(/\.(\w+)$/, '_debug.$1'));
}