# Un universo de flores amarillas

Abre `index.html` en el navegador o sirve esta carpeta con Live Server. También puedes publicar estos archivos y `assets/` en un alojamiento estático como GitHub Pages: las fotos no necesitan consultar la API de GitHub ni un listado de carpetas.

## Personalizar

La configuración está al principio de `script.js`:

- **Fotos:** guarda las imágenes en `assets/fotos/` y añade una entrada a `CONFIG.fotos` con el nombre exacto del archivo y su dedicatoria. Los espacios y acentos se admiten. El navegador solo muestra las imágenes que consigue cargar; una foto ausente no bloquea las demás.
- **Música:** `CONFIG.cancion` indica el archivo de audio. Usa `""` para desactivar la música. La reproducción empieza al tocar ♫ o el fondo de la escena, porque el navegador puede bloquear el sonido automático.
- **Frases:** modifica `CONFIG.frases`.
- **Mensaje:** edita el párrafo `id="msg"` de `index.html`.
- **Destinatario y firma:** añade `?para=Lucía&de=Carlos` a la dirección de la página.

Ejemplo de foto:

```js
{ archivo: "nuestra-foto.jpeg", texto: "Mi lugar favorito" }
```

## Interacción

El viaje de estrellas se funde con el universo y el corazón. Después aparecen los controles y las fotos, que se pueden ampliar tocándolas. «Nuestros recuerdos» abre todas las fotos cargadas; usa los botones o las flechas del teclado para recorrerlas y Escape para cerrar.

La escena se pausa mientras una foto o el mensaje están abiertos y cuando la pestaña está en segundo plano. Si el dispositivo pide reducir el movimiento, el corazón y las fotos aparecen directamente, sin el viaje ni las animaciones.
