// A Point.
var Pt = function(x, y, h) {
  if (!(this instanceof Pt)) { return new Pt(x, y, h); }

  this.x = x;
  this.y = y;
  this.h = h;
}
  
// A 3D vertex.
var Vertex = function(x, y, z) {
  if (!(this instanceof Vertex)) { return new Vertex(x, y, z); }

  this.x = x;
  this.y = y;
  this.z = z;
}
  
// A 4D vertex (a 3D vertex in homogeneous coordinates).
var Vertex4 = function(arg1, y, z, w) {
  if (!(this instanceof Vertex4)) { return new Vertex4(arg1, y, z, w); }

  if (arg1 instanceof Vertex) {
    this.x = arg1.x;
    this.y = arg1.y;
    this.z = arg1.z;
    this.w = 1;
  } else if (arg1 instanceof Vertex4) {
    this.x = arg1.x;
    this.y = arg1.y;
    this.z = arg1.z;
    this.w = arg1.w;
  } else {
    this.x = arg1;
    this.y = y;
    this.z = z;
    this.w = w;
  }
}
  
// A 4x4 matrix.
var Mat4x4 = function(data) {
  if (!(this instanceof Mat4x4)) { return new Mat4x4(data); }

  this.data = data;
}
  
const Identity4x4 = new Mat4x4([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]);
  
// A Triangle.
var Triangle = function(indexes, color, normals, texture, uvs) {
  if (!(this instanceof Triangle)) { return new Triangle(indexes, color, normals, texture, uvs); }

  this.indexes = indexes;
  this.color = color;
  this.normals = normals;
  this.texture = texture;
  this.uvs = uvs;
}
  
// A Model.
var Model = function(vertices, triangles, bounds_center, bounds_radius) {
  if (!(this instanceof Model)) { return new Model(vertices, triangles, bounds_center, bounds_radius); }

  this.vertices = vertices;
  this.triangles = triangles;
  this.bounds_center = bounds_center;
  this.bounds_radius = bounds_radius;
}
  
// An Instance.
var Instance = function(model, position, orientation, scale) {
  if (!(this instanceof Instance)) { return new Instance(model, position, orientation, scale); }

  this.model = model;
  this.position = position;
  this.orientation = orientation || Identity4x4;
  this.scale = scale || 1.0;

  this.transform = MultiplyMM4(MakeTranslationMatrix(this.position), MultiplyMM4(this.orientation, MakeScalingMatrix(this.scale)));
}
  
// The Camera.
var Camera = function(position, orientation) {
  if (!(this instanceof Camera)) { return new Camera(position, orientation); }

  this.position = position;
  this.orientation = orientation;
  this.clipping_planes = [];
}
  
// A Clipping Plane.
var Plane = function(normal, distance) {
  if (!(this instanceof Plane)) { return new Plane(normal, distance); }

  this.normal = normal;
  this.distance = distance;
}

// A Light.
const LT_AMBIENT = 0;
const LT_POINT = 1;
const LT_DIRECTIONAL = 2;

var Light = function(type, intensity, vector) {
  if (!(this instanceof Light)) { return new Light(type, intensity, vector); }

  this.type = type;
  this.intensity = intensity;
  this.vector = vector;
}

// A Texture.
var Texture = function(url) {
  if (!(this instanceof Texture)) { return new Texture(url); }

  this.image = new Image();
  this.image.src = url;

  var texture = this;

  this.image.onload = function() {
    texture.iw = texture.image.width;
    texture.ih = texture.image.height;

    texture.canvas = document.createElement("canvas");
    texture.canvas.width = texture.iw;
    texture.canvas.height = texture.ih;
    var c2d = texture.canvas.getContext("2d");
    c2d.drawImage(texture.image, 0, 0, texture.iw, texture.ih);
    texture.pixel_data = c2d.getImageData(0, 0, texture.iw, texture.ih);
  }
}

GT_POINT = 0,
GT_BILINEAR = 1,

Texture.prototype.getTexel = function(u, v, filter) {
  if (filter == GT_POINT) {
    var iu = (u*this.iw) | 0;
    var iv = (v*this.ih) | 0;
    var offset = (iv*this.iw*4 + iu*4);

    return [
      this.pixel_data.data[offset + 0],
      this.pixel_data.data[offset + 1],
      this.pixel_data.data[offset + 2]
    ];
  }

  if (filter == GT_BILINEAR) {
    var u = u*this.iw - 0.5;
    var v = v*this.ih - 0.5;

    var iu = u | 0;
    var iv = v | 0;
    var ublend = u - iu;
    var vblend = v - iv;
    var uother = 1.0 - ublend;
    var vother = 1.0 - vblend;

    var offset00 = (iv*this.iw*4 + iu*4);
    var offset10 = offset00 + 4;
    var offset01 = offset00 + this.iw*4;
    var offset11 = offset01 + this.iw*4;

    var r = (this.pixel_data.data[offset00+0]*uother + this.pixel_data.data[offset10+0]*ublend) * vother +
            (this.pixel_data.data[offset01+0]*uother + this.pixel_data.data[offset11+0]*ublend) * vblend;

    return [r, r, r];
  }
}
  