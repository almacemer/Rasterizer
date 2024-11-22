// Computes k * vec.
var Multiply = function(k, vec) {
  return Vertex(k*vec.x, k*vec.y, k*vec.z);
}


// Computes dot product.
var Dot = function(v1, v2) {
  return v1.x*v2.x + v1.y*v2.y + v1.z*v2.z;
}


// Computes cross product.
var Cross = function(v1, v2) {
  return Vertex(
    v1.y*v2.z - v1.z*v2.y,
    v1.z*v2.x - v1.x*v2.z,
    v1.x*v2.y - v1.y*v2.x);
}

// Computes v1 + v2.
var Add = function(v1, v2) {
  return Vertex(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
}

var Distance = function(v1, v2) {
  return Math.sqrt((v1.x-v2.x)*(v1.x-v2.x) + (v1.y-v2.y)*(v1.y-v2.y) + (v1.z-v2.z)*(v1.z-v2.z))
}

// Computes vector magnitude.
var Magnitude = function(v1) {
  return Math.sqrt(Dot(v1, v1));
}

// Makes a transform matrix for a rotation around the OY axis.
function MakeOYRotationMatrix(degrees) {
    let cos = Math.cos(degrees*Math.PI/180.0);
    let sin = Math.sin(degrees*Math.PI/180.0);
  
    return new Mat4x4([[cos, 0, -sin, 0],
                       [  0, 1,    0, 0],
                       [sin, 0,  cos, 0],
                       [  0, 0,    0, 1]])
}
  
function MakeOXRotationMatrix(degrees) {
  let cos = Math.cos(degrees * Math.PI / 180.0);
  let sin = Math.sin(degrees * Math.PI / 180.0);

  return new Mat4x4([
      [1,    0,     0, 0],
      [0, cos,  -sin, 0],
      [0, sin,   cos, 0],
      [0,    0,     0, 1]
  ]);
}

function MakeOZRotationMatrix(degrees) {
  let cos = Math.cos(degrees * Math.PI / 180.0);
  let sin = Math.sin(degrees * Math.PI / 180.0);

  return new Mat4x4([
      [cos,  -sin, 0, 0],
      [sin,   cos, 0, 0],
      [0,      0,  1, 0],
      [0,      0,  0, 1]
  ]);
}
  
  // Makes a transform matrix for a translation.
function MakeTranslationMatrix(translation) {
    return new Mat4x4([[1, 0, 0, translation.x],
                       [0, 1, 0, translation.y],
                       [0, 0, 1, translation.z],
                       [0, 0, 0,             1]]);
}
  
  
  // Makes a transform matrix for a scaling.
  function MakeScalingMatrix(scale) {
    return new Mat4x4([[scale,     0,     0, 0],
                       [    0, scale,     0, 0],
                       [    0,     0, scale, 0],
                       [    0,     0,     0, 1]]);
  }
  
  
  // Multiplies a 4x4 matrix and a 4D vector.
  function MultiplyMV(mat4x4, vec4) {
    let result = [0, 0, 0, 0];
    let vec = [vec4.x, vec4.y, vec4.z, vec4.w];
  
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        result[i] += mat4x4.data[i][j]*vec[j];
      }
    }
  
    return new Vertex4(result[0], result[1], result[2], result[3]);
  }
  
  
  // Multiplies two 4x4 matrices.
  function MultiplyMM4(matA, matB) {
    let result = new Mat4x4([[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]);
  
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        for (let k = 0; k < 4; k++) {
          result.data[i][j] += matA.data[i][k]*matB.data[k][j];
        }
      }
    }
  
    return result;
  }
  
  
  // Transposes a 4x4 matrix.
  function Transposed(mat) {
    let result = new Mat4x4([[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        result.data[i][j] = mat.data[j][i];
      }
    }
    return result;
  }
  
  
  function Shuffle(vec){
    for (let i = vec.length - 1; i > 0; --i) {
      let rand = Math.floor(Math.random() * (i + 1));
      [vec[i], vec[rand]] = [vec[rand], vec[i]];
    }
  }

  var Clamp = function(value) {
    if (value < 0) { return 0; }
    if (value > 255) { return 255; }
    return value;
  }
  
  
  // Adds two colors.
  var AddColor = function(c1, c2) {
    return [Clamp(c1[0] + c2[0]), Clamp(c1[1] + c2[1]), Clamp(c1[2] + c2[2])];
  }
  
  
  var MultiplyColor = function(color, k) {
    return [Clamp(color[0]*k), Clamp(color[1]*k), Clamp(color[2]*k)];
  }
  

function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
}