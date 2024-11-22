let depth_buffer = Array();
depth_buffer.length = canvas.width * canvas.height;

function UpdateDepthBufferIfCloser(x, y, inv_z) {
  x = canvas.width/2 + (x | 0);
  y = canvas.height/2 - (y | 0) - 1;

  if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) {
    return false;
  }

  let offset = x + canvas.width*y;
  if (depth_buffer[offset] == undefined || depth_buffer[offset] < inv_z) {
    depth_buffer[offset] = inv_z;
    return true;
  }
  return false;
}

function ClearAll() {
  // canvas.width = canvas.width;
  canvas_context.clearRect(0, 0, canvas.width, canvas.height);
  depth_buffer = new Array(canvas.width * canvas.height);
  // depth_buffer.length = canvas.width * canvas.height;
  canvas_buffer = canvas_context.getImageData(0, 0, canvas.width, canvas.height);
}