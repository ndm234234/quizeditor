import React, { useState, useRef, forwardRef } from "react";
import Button from "react-bootstrap/Button";

const convertToBase64 = async (url) => {
  // Если уже base64, возвращаем как есть
  if (url.startsWith('data:image/')) {
    return url;
  }

  try {
    // Пробуем через fetch
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('Fetch failed:', error);
    // НЕ пробуем canvas для GIF - он сломает анимацию
    if (url.toLowerCase().includes('.gif')) {
      throw new Error('GIF cannot be loaded via fetch due to CORS');
    }
    
    // Для других форматов пробуем canvas
    return convertViaCanvas(url);
  }
};

const convertViaCanvas = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function() {
      const canvas = document.createElement('canvas');
      canvas.width = this.naturalWidth;
      canvas.height = this.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(this, 0, 0);
      
      // Определяем формат на основе MIME-типа
      const isPng = url.includes('.png');
      const isJpeg = url.includes('.jpg') || url.includes('.jpeg');
      const isWebp = url.includes('.webp');
      
      const format = isPng ? 'image/png' : 
                    isJpeg ? 'image/jpeg' : 
                    isWebp ? 'image/webp' : 
                    'image/png';
      
      resolve(canvas.toDataURL(format));
    };
    img.onerror = reject;
    img.src = url;
  });
};

const ImageControl = forwardRef(
  ({ 
    initialImage = null, 
    onChange = null, 
    maxHeight = "280px",
    noPadding = false, // Новый пропс для управления внешними отступами
    className = "", // Дополнительные классы
    style = {}, // Дополнительные стили
    ...props 
  }, ref) => {
    const [imageUrl, setImageUrl] = useState("");
    const [currentImage, setCurrentImage] = useState(initialImage);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleUrlLoad = async () => {
      if (!imageUrl.trim()) return;
      
      const url = imageUrl.trim();
      const isGif = url.toLowerCase().includes('.gif');
      
      // Очищаем предыдущее изображение
      setCurrentImage(null);
      setIsLoading(true);
      
      try {
        if (isGif) {
          // Для GIF используем специальную обработку
          await loadGifFromUrl(url);
        } else {
          // Для других форматов
          const base64 = await convertToBase64(url);
          setCurrentImage(base64);
          onChange?.(base64, { type: 'url' });
        }
      } catch (error) {
        console.error('Error loading image:', error);
        
        // Если не получилось через fetch/canvas, пробуем напрямую
        if (isGif) {
          // Для GIF показываем предупреждение
          alert('GIF загружен напрямую, будет использоваться ссылка. Для сохранения в файле загрузите изображение с диска.');
          setCurrentImage(url);
          onChange?.(url, { type: 'url', direct: true });
        } else {
          // Для остальных пробуем canvas
          try {
            const base64 = await convertViaCanvas(url);
            setCurrentImage(base64);
            onChange?.(base64, { type: 'url' });
          } catch (canvasError) {
            alert("Не удалось загрузить изображение. Проверьте URL и CORS-разрешения.");
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    const loadGifFromUrl = async (url) => {
      return new Promise((resolve, reject) => {
        // Создаем изображение для проверки доступности
        const testImg = new Image();
        testImg.crossOrigin = "anonymous";
        
        testImg.onload = () => {
          // GIF доступен, теперь пытаемся получить как base64
          const imgForBase64 = new Image();
          imgForBase64.crossOrigin = "anonymous";
          
          imgForBase64.onload = async () => {
            try {
              // Пробуем fetch с обработкой CORS
              const response = await fetch(url, {
                mode: 'cors',
                credentials: 'omit'
              });
              
              if (response.ok) {
                const blob = await response.blob();
                const base64 = await new Promise((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onload = () => resolve(reader.result);
                  reader.onerror = reject;
                  reader.readAsDataURL(blob);
                });
                
                setCurrentImage(base64);
                onChange?.(base64, { type: 'url' });
                resolve();
              } else {
                reject(new Error('Failed to fetch GIF'));
              }
            } catch (fetchError) {
              // Если fetch не сработал, используем изображение напрямую
              console.warn('Using GIF directly:', fetchError);
              setCurrentImage(url);
              onChange?.(url, { type: 'url', direct: true });
              resolve();
            }
          };
          
          imgForBase64.onerror = reject;
          imgForBase64.src = url;
        };
        
        testImg.onerror = () => reject(new Error('Image failed to load'));
        testImg.src = url;
      });
    };

    const handleFileSelect = async (event) => {
      const file = event.target.files[0];
      if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setCurrentImage(e.target.result);
          onChange?.(e.target.result, { 
            file, 
            type: "file",
            format: file.type
          });
        };
        reader.onerror = () => {
          alert("Ошибка чтения файла");
        };
        reader.readAsDataURL(file);
      }
    };

    const handleClear = () => {
      setCurrentImage(null);
      setImageUrl("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onChange?.(null, null);
    };

    React.useImperativeHandle(ref, () => ({
      getImageBase64: () => currentImage,
      clearImage: handleClear,
    }));

    // Формируем стили для контейнера в зависимости от noPadding
    const containerStyle = {
      width: '100%', // Всегда занимает всю доступную ширину
      ...(noPadding && {
        paddingLeft: 0,
        paddingRight: 0,
        marginLeft: 0,
        marginRight: 0
      }),
      ...style // Позволяет переопределить стили снаружи
    };

    // Формируем классы для контейнера
    const containerClass = `container-fluid ${className}`;

    return (
      <div 
        className={containerClass}
        style={containerStyle}
        {...props}
      >
        <div className="row g-1">
          {/* Левая панель - предпросмотр */}
          <div className="col-md-6 d-flex">
            <div className="card w-100 rounded-1" style={{ 
              maxHeight, 
              overflow: "hidden",
            }}>
              <div className="card-body p-2 d-flex flex-column">
                {isLoading ? (
                  <div className="flex-grow-1 d-flex align-items-center justify-content-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Загрузка...</span>
                    </div>
                  </div>
                ) : currentImage ? (
                  <div className="flex-grow-1 d-flex align-items-center justify-content-center">
                    <img
                      src={currentImage}
                      alt="Preview"
                      className="img-fluid"
                      style={{
                        maxHeight: "180px",
                        maxWidth: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex-grow-1 d-flex align-items-center justify-content-center text-muted">
                    <div className="text-center">
                      <div style={{ fontSize: "1.5rem" }}>🖼️</div>
                      <small>Нет изображения</small>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Правая панель - управление */}
          <div className="col-md-6 d-flex">
            <div className="card w-100 rounded-1" style={{ 
              maxHeight, 
              overflow: "hidden",
            }}>
              <div className="card-body p-2 d-flex flex-column">
                <div className="mb-2">
                  <input
                    type="url"
                    className="form-control form-control-sm mb-1"
                    placeholder="URL изображения"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUrlLoad()}
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="d-none"
                  />
                  <div className="d-flex gap-1">
                    <Button
                      className="btn btn-primary btn-sm flex-fill w-100"
                      onClick={handleUrlLoad}
                      disabled={isLoading || !imageUrl.trim()}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                          Загрузка...
                        </>
                      ) : (
                        '📥 URL'
                      )}
                    </Button>
                    <Button
                      className="btn btn-primary btn-sm flex-fill w-100"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                    >
                      📁 Файл
                    </Button>
                    {currentImage && (
                      <Button
                        className="btn btn-primary btn-sm flex-fill w-100"
                        onClick={handleClear}
                        disabled={isLoading}
                      >
                        ✕ Очистить
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ImageControl.displayName = 'ImageControl';

export default ImageControl;