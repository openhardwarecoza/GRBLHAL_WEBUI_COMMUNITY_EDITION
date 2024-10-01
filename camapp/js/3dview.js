import * as THREE from '/lib/threejs/three.module.js';
import {
  OrbitControls
} from '/lib/threejs/OrbitControls.js';

var raycaster = new THREE.Raycaster();
raycaster.linePrecision = 1

var mouseVector = new THREE.Vector3();
var mouseIsDown = false;

var mousedown = false,
  mouseup = true,
  mousedowncoords = {},
  offset = {};
var worldstartcoords, worldendcoords;
var selectobj, arrow;
var hoverShapesinScene = [];

var selection = document.getElementById("selection");

var container = document.getElementById('viewer3d');

var camera, scene, renderer, controls, workspace
var objectsInScene = [];

var clearSceneFlag = false;
var setClearSceneFlag = function() {
  clearSceneFlag = true;
}

const clearSceneButton = document.getElementById('clearScene');
clearSceneButton.addEventListener('click', (event) => {
  resetView()
});

container.addEventListener('mousemove', e => {
  mouseMove(e);
});

container.addEventListener('mousedown', e => {
  mouseDown(e);
});

container.addEventListener('mouseup', e => {
  mouseUp(e);
});

var notSelectedMaterial = new THREE.LineBasicMaterial({
  color: 0xcccccc
});

var selectedMaterial = new THREE.LineBasicMaterial({
  color: 0xff0000
});


init();
animate();

function resetView() {
  clearSceneFlag = true;
  if (objectsInScene.length > 0) {
    var insceneGrp = new THREE.Group()
    for (var i = 0; i < objectsInScene.length; i++) {
      var object = objectsInScene[i].clone();
      insceneGrp.add(object)
    }
    viewExtents(insceneGrp);
  } else {
    viewExtents(workspace);
  }

}

function init() {
  scene = new THREE.Scene();
  workspace = new THREE.Group();
  workspace.name = 'workspace'
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 50000);

  camera.up = new THREE.Vector3(0, 0, 1);
  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  container.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);

  controls.enableRotate = true;
  controls.enableZoom = true; // optional
  controls.maxDistance = 50000; // limit max zoom out
  controls.enableKeys = false; // Disable Keyboard on canvas

  controls.mouseButtons = {
    LEFT: false,
    MIDDLE: THREE.MOUSE.ROTATE,
    RIGHT: THREE.MOUSE.PAN
  }


  var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  workspace.add(directionalLight);
  var light = new THREE.AmbientLight(0x404040); // soft white light
  workspace.add(light);

  var size = 1000;
  var divisions = 100;
  var gridHelper = new THREE.GridHelper(size, divisions, "rgba(40, 40, 40, 0.2)", "rgba(30, 30, 30, 0.2)");
  gridHelper.geometry.rotateX(Math.PI / 2);

  workspace.add(gridHelper);

  // var axesHelper = new THREE.AxesHelper(500);
  // console.log(axesHelper);
  // workspace.add(axesHelper);

  controls.update();

  window.addEventListener('resize', resize, false);
  scene.add(workspace)

  resetView()
}

function resize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  animate();

}

function animate() {

  if (clearSceneFlag) {
    //console.log(objectsInScene)
    while (scene.children.length > 1) {
      scene.remove(scene.children[1])
    }

    var documents = new THREE.Group();
    documents.name = "Documents";
    for (var i = 0; i < objectsInScene.length; i++) {

      if (objectsInScene[i].userData.hover) {
        documents.add(objectsInScene[i].userData.hoverShape)
      }

      if (objectsInScene[i].userData.selected) {
        objectsInScene[i].material = selectedMaterial
      } else {
        objectsInScene[i].material = notSelectedMaterial
      }

      documents.add(objectsInScene[i])
    }

    scene.add(documents)
    clearSceneFlag = false;
  }

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);

};

animate();


function viewExtents(objecttosee) {

  // console.log("viewExtents. object:", objecttosee);
  // console.log("controls:", controls);
  //wakeAnimate();

  // lets override the bounding box with a newly
  // generated one
  // get its bounding box
  if (objecttosee) {
    // console.log(objecttosee)
    var helper = new THREE.BoxHelper(objecttosee);
    helper.update();
    var box3 = new THREE.Box3();
    box3.setFromObject(helper);
    var minx = box3.min.x;
    var miny = box3.min.y;
    var maxx = box3.max.x;
    var maxy = box3.max.y;
    var minz = box3.min.z;
    var maxz = box3.max.z;


    controls.reset();

    var lenx = maxx - minx;
    var leny = maxy - miny;
    var lenz = maxz - minz;
    var centerx = minx + (lenx / 2);
    var centery = miny + (leny / 2);
    var centerz = minz + (lenz / 2);

    // console.log("lenx:", lenx, "leny:", leny, "lenz:", lenz);
    var maxlen = Math.max(lenx, leny, lenz);
    var dist = 2 * maxlen;
    // center camera on gcode objects center pos, but twice the maxlen
    controls.object.position.x = centerx;
    controls.object.position.y = centery;
    controls.object.position.z = centerz + dist;
    controls.target.x = centerx;
    controls.target.y = centery;
    controls.target.z = centerz;
    // console.log("maxlen:", maxlen, "dist:", dist);
    var fov = 2.2 * Math.atan(maxlen / (2 * dist)) * (180 / Math.PI);
    // console.log("new fov:", fov, " old fov:", controls.object.fov);
    if (isNaN(fov)) {
      // console.log("giving up on viewing extents because fov could not be calculated");
      return;
    } else {
      // console.log("fov: ", fov);
      controls.object.fov = fov;
      var L = dist;
      var camera2 = controls.object;
      var vector = controls.target.clone();
      var l = (new THREE.Vector3()).subVectors(camera2.position, vector).length();
      var up = camera.up.clone();
      var quaternion = new THREE.Quaternion();

      // Zoom correction
      camera2.translateZ(L - l);
      // console.log("up:", up);
      up.y = 1;
      up.x = 0;
      up.z = 0;
      quaternion.setFromAxisAngle(up, 0);
      camera2.position.applyQuaternion(quaternion);
      up.y = 0;
      up.x = 1;
      up.z = 0;
      quaternion.setFromAxisAngle(up, 0);
      camera2.position.applyQuaternion(quaternion);
      up.y = 0;
      up.x = 0;
      up.z = 1;
      quaternion.setFromAxisAngle(up, 0);
      camera2.lookAt(vector);
      controls.object.updateProjectionMatrix();
    }
  }
};

function mouseDown(event) {
  if (event.which == 1) { // only on left mousedown
    mouseIsDown = true;

    var pos = {};
    // mousedown = true;
    mousedowncoords = {};
    mousedowncoords.x = event.clientX;
    mousedowncoords.y = event.clientY;
    // convert to threejs position
    worldstartcoords = mouseToWorldCoord(event);

    // create copy of all children's selected status so we can later check to ctrl/sel/unselect
    for (var i = 0; i < objectsInScene.length; i++) {
      var obj = objectsInScene[i]
      obj.traverse(function(child) {
        if (child.type == "Line") {
          child.userData.lastSelected = child.userData.selected
          child.geometry.computeBoundingSphere()
        }
      });
    }
  }
  mouseMove(event)
}

function mouseMove(event) {
  // console.log(mouseIsDown)
  if (delta(event.clientX, mousedowncoords.x) > 10 && delta(event.clientX, mousedowncoords.x) > 10 || delta(event.clientX, mousedowncoords.x) < -10 && delta(event.clientX, mousedowncoords.x) < -10) {
    if (mouseIsDown) { // only on left mousedown

      offset = getOffset(container);
      var md = {};
      md.x = mousedowncoords.x;
      md.y = mousedowncoords.y;
      var ev = {};
      ev.x = event.clientX;
      ev.y = event.clientY;
      var pos = {};
      pos.x = ev.x - md.x;
      pos.y = ev.y - md.y;

      // console.log(pos)
      // square variations
      // (0,0) origin is the TOP LEFT pixel of the canvas.
      //
      //  1 | 2
      // ---.---
      //  4 | 3
      // there are 4 ways a square can be gestured onto the screen.  the following detects these four variations
      // and creates/updates the CSS to draw the square on the screen

      // console.log(pos)
      if (pos.x < 0 && pos.y < 0) {
        // console.log("dir0", -pos.x, -pos.y); // bottom right to top left
        selection.style.left = ev.x - offset.left + "px";
        selection.style.top = ev.y - offset.top + "px";
        selection.style.width = -pos.x + "px";
        selection.style.height = -pos.y + "px";
        selection.style.visibility = "visible";
      } else if (pos.x > 0 && pos.y < 0) {
        // console.log("dir1"); // bottom left to to right
        selection.style.left = md.x - offset.left + "px";
        selection.style.top = ev.y - offset.top + "px";
        selection.style.width = pos.x + "px";
        selection.style.height = -pos.y + "px";
        selection.style.visibility = "visible";
      } else if (pos.x > 0 && pos.y > 0) {
        // console.log("dir2"); // top left to bottom right
        selection.style.left = md.x - offset.left + "px";
        selection.style.top = md.y - offset.top + "px";
        selection.style.width = pos.x + "px";
        selection.style.height = pos.y + "px";
        selection.style.visibility = "visible";
      } else if (pos.x < 0 && pos.y >= 0) {
        // console.log("dir3");
        selection.style.left = ev.x - offset.left + "px";
        selection.style.top = md.y - offset.top + "px";
        selection.style.width = -pos.x + "px";
        selection.style.height = pos.y + "px";
        selection.style.visibility = "visible";
      } else {
        console.log("Failed to Marquee")
      }
      // convert to threejs position
      worldendcoords = mouseToWorldCoord(event)
      // clear selection in case marquee is shrinking
      if (!event.ctrlKey && !event.altKey) {
        for (i = 0; i < objectsInScene.length; i++) {
          var obj = objectsInScene[i]
          obj.traverse(function(child) {
            if (child.type == "Line" && child.userData.selected) {
              child.userData.selected = false;
            };
          });
        };
      };
      // Update all children (check intersect of centers with marquee)
      scene.updateMatrixWorld();
      for (i = 0; i < objectsInScene.length; i++) { // start marquee set
        var obj = objectsInScene[i];
        obj.traverse(function(child) {
          if (child.type == "Line") {
            child.geometry.computeBoundingSphere()
            var center = {};
            center.x = child.geometry.boundingSphere.center.x + (child.parent.position.x) + (child.position.x)
            center.y = child.geometry.boundingSphere.center.y + (child.parent.position.y) + (child.position.y)
            if (XinSelectRange(center.x) && YinSelectRange(center.y)) {
              if (event.ctrlKey || event.altKey) {
                child.userData.selected = !child.userData.lastSelected;
              } else {
                child.userData.selected = true;
              };
              setClearSceneFlag();
              // animate();
            };
          };
        });
      }; // end marquee set
    }
  } else { // just regular move
    mouseVector.x = (event.offsetX / renderer.domElement.width) * 2 - 1;
    mouseVector.y = -(event.offsetY / renderer.domElement.height) * 2 + 1;
    camera.updateProjectionMatrix();
    raycaster.setFromCamera(mouseVector, camera);
    var documents = scene.getObjectByName("Documents");
    if (documents) {
      var intersects = raycaster.intersectObjects(documents.children, true)
      if (intersects.length > 0) {
        for (var i = 0; i < objectsInScene.length; i++) {
          var obj = objectsInScene[i];
          obj.traverse(function(child) {
            if (child.type == "Line") {
              container.style.cursor = 'pointer'
              child.userData.hover = false;
            };
          });
        }
        var intersection = intersects[0];
        obj = intersection.object;
        if (obj.type == "Line") {
          if (event.which == 1 && event.ctrlKey) {
            if (obj.userData.selected !== undefined) {
              obj.userData.selected = !obj.userData.selected
            } else {
              obj.userData.selected = false
            }

          } else if (event.which == 1) {
            // Without control, we delect everything, and only select the clicked object
            for (var i = 0; i < objectsInScene.length; i++) {
              objectsInScene[i].userData.selected = false;
            }
            obj.userData.selected = true
          } else {
            obj.userData.hover = true;
          }
        }
        setClearSceneFlag();
      } else { // hovering over nothing
        container.style.cursor = 'default'
        for (i = 0; i < objectsInScene.length; i++) {
          var obj = objectsInScene[i];
          // obj.traverse(function(child) {
          if (obj.type == "Line") {
            obj.userData.hover = false;
            if (event.which == 1 && !event.ctrlKey) {
              obj.userData.selected = false;
            }
          };
          // });
        }
        setClearSceneFlag();
      }
    } // end raycast hover event
  };
};

function mouseUp(event) {
  selection.style.visibility = "hidden";
  mousedowncoords = {};
  for (var i = 0; i < objectsInScene.length; i++) {
    var obj = objectsInScene[i]
    obj.traverse(function(child) {
      if (child.type == "Line") {
        delete child.userData.lastSelected;
      }
    });
  }
}

function delta(num1, num2) {
  return (num1 > num2) ? num1 - num2 : num2 - num1
}

function mouseToWorldCoord(e) {
  var vector = new THREE.Vector3();
  var sceneWidth = document.getElementById("viewer3d").offsetWidth;
  var sceneHeight = document.getElementById("viewer3d").offsetHeight;
  offset = getOffset(container);
  vector.x = ((e.clientX - offset.left) / sceneWidth) * 2 - 1;
  vector.y = -((e.clientY - offset.top) / sceneHeight) * 2 + 1;
  vector.z = 0.5;
  vector.unproject(camera);
  var dir = vector.sub(camera.position).normalize();
  var distance = -camera.position.z / dir.z;
  var coords = camera.position.clone().add(dir.multiplyScalar(distance));
  return coords;
}

function getOffset(element) {
  let rect = element.getBoundingClientRect();
  let win = element.ownerDocument.defaultView;
  return ({
    top: rect.top + win.pageYOffset,
    left: rect.left + win.pageXOffset
  });
}

function XinSelectRange(x) {
  var a = worldstartcoords.x
  var b = worldendcoords.x
  if ((x - a) * (x - b) < 0) {
    return true;
  } else {
    return false;
  }
}

function YinSelectRange(y) {
  var a = worldstartcoords.y
  var b = worldendcoords.y
  if ((y - a) * (y - b) < 0) {
    return true;
  } else {
    return false;
  }
}

export {
  objectsInScene,
  setClearSceneFlag,
  camera,
  scene,
  renderer,
  controls,
  resetView
};