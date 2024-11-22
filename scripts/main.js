
const camera = new Camera(new Vertex(0, 0, 0), Identity4x4);

document.addEventListener('keydown', function(event) {
  const moveStep = 0.5;
  const rotationStep = 10;
  switch(event.key) {
    case 'w':
      camera.position["y"] += moveStep; // Move up
      break;
    case 's':
      camera.position["y"] -= moveStep; // Move down
      break;
    case 'a':
      camera.position["x"] -= moveStep; // Move left
      break;
    case 'd':
      camera.position["x"] += moveStep; // Move right
      break;
    case 'e':
      camera.position["z"] -= moveStep; // Move forward
      break;
    case 'q':
      camera.position["z"] += moveStep; // Move backward
      break;
    case 'y':
      camera.orientation =  MultiplyMM4(camera.orientation, MakeOYRotationMatrix(-rotationStep)); // Move backward
      break;
    case 'x':
      camera.orientation =  MultiplyMM4(camera.orientation, MakeOYRotationMatrix(rotationStep)); // Move backward
      break;
  }
  Render();
});

document.addEventListener('keydown', function(event) {
  const rotationStep = 10; // Rotate by 10 degrees with each key press
  
  // Object rotation based on arrow keys
  if (event.key === 'ArrowUp') {
      // Rotate around the X-axis (pitch)
      instances = [new Instance(instances[0].model, instances[0].position, MultiplyMM4(instances[0].orientation, MakeOXRotationMatrix(-rotationStep)))]
  }
  if (event.key === 'ArrowDown') {
      instances = [new Instance(instances[0].model, instances[0].position, MultiplyMM4(instances[0].orientation, MakeOXRotationMatrix(rotationStep)))]
  }
  if (event.key === 'ArrowLeft') {
      instances = [new Instance(instances[0].model, instances[0].position, MultiplyMM4(instances[0].orientation, MakeOYRotationMatrix(-rotationStep)))]
  }
  if (event.key === 'ArrowRight') {
      instances = [new Instance(instances[0].model, instances[0].position, MultiplyMM4(instances[0].orientation, MakeOYRotationMatrix(rotationStep)))]
  }

  Render(); // Update the scene with the new orientation
});

let object_color = [0, 0, 0];
document.getElementById("object-color").addEventListener("input", (event) => {
  const color = hexToRgb(event.target.value);
  object_color = [color.r, color.g, color.b];
  console.log(object_color)
  Render();
});

async function loadOBJFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const vertices = [];
      const normals = [];
      const uvs = [];
      const faces = [];

      text.split('\n').forEach(line => {
        const parts = line.trim().split(/\s+/);
        switch (parts[0]) {
          case 'v':
            vertices.push({
              x: parseFloat(parts[1]),
              y: parseFloat(parts[2]),
              z: parseFloat(parts[3])
            });
            break;
          case 'vn':
            normals.push({
              x: parseFloat(parts[1]),
              y: parseFloat(parts[2]),
              z: parseFloat(parts[3])
            });
            break;
          case 'vt':
            uvs.push({
              x: parseFloat(parts[1]),
              y: parseFloat(parts[2])
            });
            break;
          case 'f':
            const face = parts.slice(1).map(part => {
              const [vIdx, vtIdx, vnIdx] = part.split('/').map(idx => parseInt(idx, 10) - 1);
              return { v: vIdx, vt: vtIdx, vn: vnIdx };
            });
            faces.push(face);
            break;
        }
      });

      resolve({ vertices, normals, uvs, faces });
    };

    reader.onerror = (event) => {
      reject(new Error("Error reading the file"));
    };

    reader.readAsText(file);
  });
}

async function convertOBJToRasterizerFormat(objData) {
  const { vertices, normals, uvs, faces } = objData;

  const rasterizerVertices = vertices.map(v => Vertex(v.x, v.y, v.z));
  const rasterizerNormals = normals.map(n => Vertex(n.x, n.y, n.z));
  const rasterizerUVs = uvs.map(uv => Vertex(uv.x, uv.y, 0)); // Assuming 2D UVs with z=0

  const triangles = [];
  faces.forEach(face => {
    if (face.length < 3) return; // Not a valid face
    for (let i = 1; i < face.length - 1; i++) {
      const v0 = face[0];
      const v1 = face[i];
      const v2 = face[i + 1];

      const indices = [v0.v, v1.v, v2.v];
      const uvIndices = [v0.vt, v1.vt, v2.vt];
      const normalIndices = [v0.vn, v1.vn, v2.vn];

      triangles.push(Triangle(
        indices,
        object_color,
        normalIndices.length ? normalIndices.map(idx => rasterizerNormals[idx]) : [],
        undefined,
        uvIndices.length ? uvIndices.map(idx => rasterizerUVs[idx]) : []
      ));
    }
  });
  
  return Model(rasterizerVertices, triangles, Vertex(0, 0, 0), 0.3);
}

let model = null;
async function loadAndRenderOBJ(file) {
  if (!model) {
    const objData = await loadOBJFromFile(file);
    model = await convertOBJToRasterizerFormat(objData);
  }
  return model;
}

const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', async function(event) {
  const file = event.target.files[0];
  if (file) {
    result = await loadAndRenderOBJ(file);
    console.log(result);
    instances.push(Instance(result, Vertex(0, 1, 3), MakeOYRotationMatrix(150)));
    Render();
  }
});


var instances = [];

let s2 = 1.0 / Math.sqrt(2);
  camera.clipping_planes = [
    new Plane(new Vertex(  0,   0,  1), -0.01), // Near (move closer to 0)
    new Plane(new Vertex(  0,   0, -1), 1000),  // Far (set a far clipping plane at 100 units)
    new Plane(new Vertex( s2,   0, s2),  0),   // Left
    new Plane(new Vertex(-s2,   0, s2),  0),   // Right
    new Plane(new Vertex(  0, -s2, s2),  0),   // Top
    new Plane(new Vertex(  0,  s2, s2),  0)    // Bottom
];
  
const lights = [
    new Light(LT_AMBIENT, 0.2),
    new Light(LT_DIRECTIONAL, 0.2, Vertex(-1, 0, 1)),
    new Light(LT_POINT, 0.6, Vertex(-3, 2, -10))
];

function SetLightingModel(model) {
    alert(model)
    LightingModel = model;
    Render();
}
  
function SetShadingModel(model) {
    ShadingModel = model;
    Render();
}
  
function SetUseVertexNormals(use_vertex_normals) {
    UseVertexNormals = use_vertex_normals;
    Render();
}

document.getElementById("box").addEventListener("click", () => {
    UseBox = !UseBox;
    camera.clipping_planes = [
      new Plane(new Vertex(  0,   0,  1), -0.01), // Near (move closer to 0)
      new Plane(new Vertex(  0,   0, -1), 1000),  // Far (set a far clipping plane at 100 units)
    ];
    instances = [];
      instances.push(Instance(cube, new Vertex(1.75, 0, 5), MakeOYRotationMatrix(-30), 2));
      console.log(instances)
});

//////////////////////////////////////////////////////////////////////////////////////////////////

function GenerateSphere(divs, color) {
    let vertices = [];
    let triangles = [];
  
    let delta_angle = 2.0*Math.PI / divs;
  
    // Generate vertices and normals.
    for (let d = 0; d < divs + 1; d++) {
      let y = (2.0 / divs) * (d - divs/2);
      let radius = Math.sqrt(1.0 - y*y);
      for (let i = 0; i < divs; i++) {
        let vertex = new Vertex(radius*Math.cos(i*delta_angle), y, radius*Math.sin(i*delta_angle));
        vertices.push(vertex);
      }
    }
  
    // Generate triangles.
    for (let d = 0; d < divs; d++) {
      for (let i = 0; i < divs; i++) {
        let i0 = d*divs + i;
        let i1 = (d+1)*divs + (i+1)%divs;
        let i2 = divs*d + (i+1)%divs;
        let tri0 = [i0, i1, i2];
        let tri1 = [i0, i0+divs, i1];
        triangles.push(Triangle(tri0, color, [vertices[tri0[0]], vertices[tri0[1]], vertices[tri0[2]]]));
        triangles.push(Triangle(tri1, color, [vertices[tri1[0]], vertices[tri1[1]], vertices[tri1[2]]]));
      }
    }
  
    return new Model(vertices, triangles, new Vertex(0, 0, 0), 1.0);
  }
  
  
  // ----- Cube model -----
const vertices = [
    new Vertex(1, 1, 1),
    new Vertex(-1, 1, 1),
    new Vertex(-1, -1, 1),
    new Vertex(1, -1, 1),
    new Vertex(1, 1, -1),
    new Vertex(-1, 1, -1),
    new Vertex(-1, -1, -1),
    new Vertex(1, -1, -1)
];
  
const RED = [255, 0, 0];
const GREEN = [0, 255, 0];
const BLUE = [0, 0, 255];
const YELLOW = [255, 255, 0];
const PURPLE = [255, 0, 255];
const CYAN = [0, 255, 255];

const front = new Texture("../posz.jpg");
const back = new Texture("../negz.jpg");
const left = new Texture("../negx.jpg");
const right = new Texture("../posx.jpg");
const topp = new Texture("../posy.jpg");
const bottom = new Texture("../negy.jpg");
  
const triangles = [
    new Triangle([0, 1, 2], RED,    [new Vertex( 0,  0,  1), new Vertex( 0,  0,  1), new Vertex( 0,  0,  1)], front, [new Pt(0, 0), new Pt(1, 0), new Pt(1, 1)]),
    new Triangle([0, 2, 3], RED,    [new Vertex( 0,  0,  1), new Vertex( 0,  0,  1), new Vertex( 0,  0,  1)], front, [new Pt(0, 0), new Pt(1, 1), new Pt(0, 1)]),
    new Triangle([4, 0, 3], GREEN,  [new Vertex( 1,  0,  0), new Vertex( 1,  0,  0), new Vertex( 1,  0,  0)], back, [new Pt(0, 0), new Pt(1, 0), new Pt(1, 1)]),
    new Triangle([4, 3, 7], GREEN,  [new Vertex( 1,  0,  0), new Vertex( 1,  0,  0), new Vertex( 1,  0,  0)], back, [new Pt(0, 0), new Pt(1, 1), new Pt(0, 1)]),
    new Triangle([5, 4, 7], BLUE,   [new Vertex( 0,  0, -1), new Vertex( 0,  0, -1), new Vertex( 0,  0, -1)], left, [new Pt(0, 0), new Pt(1, 0), new Pt(1, 1)]),
    new Triangle([5, 7, 6], BLUE,   [new Vertex( 0,  0, -1), new Vertex( 0,  0, -1), new Vertex( 0,  0, -1)], left, [new Pt(0, 0), new Pt(1, 1), new Pt(0, 1)]),
    new Triangle([1, 5, 6], YELLOW, [new Vertex(-1,  0,  0), new Vertex(-1,  0,  0), new Vertex(-1,  0,  0)], right, [new Pt(0, 0), new Pt(1, 0), new Pt(1, 1)]),
    new Triangle([1, 6, 2], YELLOW, [new Vertex(-1,  0,  0), new Vertex(-1,  0,  0), new Vertex(-1,  0,  0)], right, [new Pt(0, 0), new Pt(1, 1), new Pt(0, 1)]),
    new Triangle([1, 0, 5], PURPLE, [new Vertex( 0,  1,  0), new Vertex( 0,  1,  0), new Vertex( 0,  1,  0)], topp, [new Pt(0, 0), new Pt(1, 0), new Pt(1, 1)]),
    new Triangle([5, 0, 4], PURPLE, [new Vertex( 0,  1,  0), new Vertex( 0,  1,  0), new Vertex( 0,  1,  0)], topp, [new Pt(0, 1), new Pt(1, 1), new Pt(0, 0)]),
    new Triangle([2, 6, 7], CYAN,   [new Vertex( 0, -1,  0), new Vertex( 0, -1,  0), new Vertex( 0, -1,  0)], bottom, [new Pt(0, 0), new Pt(1, 0), new Pt(1, 1)]),
    new Triangle([2, 7, 3], CYAN,   [new Vertex( 0, -1,  0), new Vertex( 0, -1,  0), new Vertex( 0, -1,  0)], bottom, [new Pt(0, 0), new Pt(1, 1), new Pt(0, 1)]),
];
  
const cube = new Model(vertices, triangles, new Vertex(0, 0, 0), Math.sqrt(3));

function Render() {
  ClearAll();
  // This lets the browser clear the canvas before blocking to render the scene.
  setTimeout(function(){
    RenderScene(camera, instances, lights);
    UpdateCanvas();
  }, 0);
}

Render();


