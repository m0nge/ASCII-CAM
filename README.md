# ASCII CAM 🎥

Convierte tu cámara frontal en arte ASCII en tiempo real, directo en el navegador — sin frameworks, sin dependencias.


## Características

- Cámara en tiempo real convertida a caracteres ASCII
- Imagen espejada (modo selfie natural)
- Fullscreen adaptado al dispositivo (desktop horizontal, móvil vertical)
- 6 colores: matrix, blanco, naranja, cyan, rosa, dorado
- 4 conjuntos de caracteres: denso, bloques Unicode, numérico, minimal
- Control de resolución ajustable en vivo
- Modo invertido (negativo)
- Captura snapshot descargable como `.txt`

## Uso

```bash
git clone https://github.com/tu-usuario/ascii-cam.git
cd ascii-cam
# abrir index.html en el navegador (o usar Live Server en VS Code)
```

> El navegador pedirá permiso para la cámara — aceptá para que funcione.

## Estructura

```
ascii-cam/
├── index.html   # estructura y UI
├── style.css    # layout fullscreen + overlay
├── script.js    # lógica de cámara y conversión ASCII
└── README.md
```

## Cómo funciona

Cada frame del video se dibuja en un `<canvas>` oculto. Se lee el valor de brillo de cada bloque de píxeles con `getImageData()` y ese brillo se mapea a un carácter de la paleta elegida. El resultado se imprime como texto `<pre>` sobre fondo negro.


## Tecnologías

`HTML5` · `CSS3` · `JavaScript ES6` · `getUserMedia API` · `Canvas API`

---

