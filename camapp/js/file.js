import {
  objectsInScene,
  setClearSceneFlag,
  camera,
  scene,
  renderer,
  controls,
  resetView
} from './3dview.js'

import * as THREE from '/lib/threejs/three.module.js';

const fileSelector = document.getElementById('file-selector');
fileSelector.addEventListener('change', (event) => {
  const fileList = event.target.files;
  readFile(event.target.files[0])
  fileSelector.value = '';
});

function readFile(file) {
  // Check if the file is an image.
  if (file.type && file.type.indexOf('application/dxf') === -1) {
    console.log('File is not a DXF:', file.type, file);
    return;
  }

  const reader = new FileReader();
  reader.addEventListener('load', (event) => {
    window.requirejs(['lib/dxf/dxf'], function(dxf) {
      dxf.config.verbose = true
      var helper = new dxf.Helper(event.target.result)
      drawDXF(helper.toPolylines().polylines)
      // drawDXFExtrudes(helper.toPolylines().polylines)
    });
  });
  reader.readAsText(file);
}

function drawDXF(polylines) {
  // default material for outline
  var material = new THREE.LineBasicMaterial({
    color: 0xcccccc
  });

  for (var i = 0; i < polylines.length; i++) {
    var points = [];

    for (var j = 0; j < polylines[i].vertices.length; j++) {
      points.push(new THREE.Vector3(polylines[i].vertices[j][0], polylines[i].vertices[j][1], 0));
    }

    var geometry = new THREE.Geometry().setFromPoints(points);
    var line = new THREE.Line(geometry, material);

    line.userData.hoverShape = shapeFromLine(line, 0xff0000, 0.4)

    objectsInScene.push(line);


  }

  setClearSceneFlag();
  resetView();
}

function shapeFromLine(object, color, opacity) {
  if (object.geometry.vertices && object.geometry.vertices.length > 2) {
    var newShape = new THREE.Shape();
    newShape.moveTo(object.geometry.vertices[0].x, object.geometry.vertices[0].y)
    for (var k = 0; k < object.geometry.vertices.length; k++) {
      newShape.lineTo(object.geometry.vertices[k].x, object.geometry.vertices[k].y);
    }
    newShape.autoClose = true;
    var geometry = new THREE.ShapeGeometry(newShape);
    var material = new THREE.MeshBasicMaterial({
      color: color,
      opacity: opacity,
      side: THREE.DoubleSide,
    });
    // material.color.setRGB(0, 0.48, 1);
    material.transparent = true;
    var mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(object.position.x, object.position.y, object.position.z);
    mesh.rotation.set(object.rotation.x, object.rotation.x, object.rotation.x);
    mesh.scale.set(object.scale.x, object.scale.y, object.scale.z);
    return mesh
  }

}