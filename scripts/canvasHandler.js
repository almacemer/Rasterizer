var canvas = document.getElementById("canvas");
var canvas_context = canvas.getContext("2d");
var canvas_buffer = canvas_context.getImageData(0, 0, canvas.width, canvas.height);
var canvas_pitch = canvas_buffer.width * 4;

// The PutPixel() function.
function PutPixel(x, y, color) {
  x = canvas.width/2 + (x | 0);
  y = canvas.height/2 - (y | 0) - 1;

  if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
    return;
  }

  let offset = 4*(x + canvas_buffer.width*y);
  canvas_buffer.data[offset++] = color[0];
  canvas_buffer.data[offset++] = color[1];
  canvas_buffer.data[offset++] = color[2];
  canvas_buffer.data[offset++] = 255; // Alpha = 255 (full opacity)
}


// Displays the contents of the offscreen buffer into the canvas.
function UpdateCanvas() {
  canvas_context.putImageData(canvas_buffer, 0, 0);
}


// ovo mozda ne treba 
function ClearCanvas() {
  canvas_buffer = canvas_context.createImageData(canvas.width, canvas.height);
  this.canvas.width = this.canvas.width;
}