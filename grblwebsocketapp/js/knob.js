Number.prototype.map = function(in_min, in_max, out_min, out_max) {
  return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

var xyjograte = 0;
var zjograte = 0;

const knobfeed = document.getElementById('knobfeed');
const currfeed = document.getElementById('currentfeed');
const resetfeed = document.getElementById('reset-feed');
const ticksfeed = Array.from(document.getElementsByClassName('ticksfeed'));
const minfeed = 50;
const maxfeed = 200;
let anglefeed = 100;
var feedrateOverrideEvent;

const knobspeed = document.getElementById('knobspeed');
const currspeed = document.getElementById('currentspeed');
const resetspeed = document.getElementById('reset-speed');
const ticksspeed = Array.from(document.getElementsByClassName('ticksspeed'));
const minspeed = 50;
const maxspeed = 200;
let anglespeed = 100;
var speedOverrideEvent;

const knobrapid = document.getElementById('knobrapid');
const currrapid = document.getElementById('currentrapid');
const resetrapid = document.getElementById('reset-rapid');
const ticksrapid = Array.from(document.getElementsByClassName('ticksrapid'));
const minrapid = 25;
const maxrapid = 100;
let anglerapid = 100;
var rapidOverrideEvent;

const knobxyjograte = document.getElementById('knobxyjograte');
const currxyjograte = document.getElementById('currentxyjograte');
const resetxyjograte = document.getElementById('reset-xyjograte');
const ticksxyjograte = Array.from(document.getElementsByClassName('ticksxyjograte'));
const minxyjograte = 50;
const maxxyjograte = 200;
let anglexyjograte = 160;
var xyjograteOverrideEvent;

const knobzjograte = document.getElementById('knobzjograte');
const currzjograte = document.getElementById('currentzjograte');
const resetzjograte = document.getElementById('reset-zjograte');
const tickszjograte = Array.from(document.getElementsByClassName('tickszjograte'));
const minzjograte = 50;
const maxzjograte = 200;
let anglezjograte = 95;
var zjograteOverrideEvent;

$(document).ready(function() {
  setAngleFeed()
  setAngleSpeed()
  setAngleRapid()
  setAngleXYJograte()
  setAngleZJograte()
})

const transform = (() => {
  for (let prop of ['transform', 'msTransform', 'webkitTransform', 'mozTransform', 'oTransform']) {
    if (typeof document.body.style[prop] != 'undefined') {
      return prop;
    }
  }
})();

function turntUpFeed(bool) {
  anglefeed = (bool && anglefeed + 5 <= maxfeed) ?
    anglefeed + 5 : (!bool && anglefeed - 5 >= minfeed) ?
    anglefeed - 5 : anglefeed;
  return setAngleFeed();
}

function turntUpSpeed(bool) {
  anglespeed = (bool && anglespeed + 5 <= maxspeed) ?
    anglespeed + 5 : (!bool && anglefeed - 5 >= minspeed) ?
    anglespeed - 5 : anglespeed;
  return setAngleSpeed();
}

function turntUpRapid(bool) {
  if (bool) {
    if (anglerapid == 25) {
      anglerapid = 50
    } else if (anglerapid == 50) {
      anglerapid = 100
    }
  } else if (!bool) {
    if (anglerapid == 100) {
      anglerapid = 50
    } else if (anglerapid == 50) {
      anglerapid = 25
    }
  }
  return setAngleRapid();
}

function turntUpXYJograte(bool) {
  anglexyjograte = (bool && anglexyjograte + 5 <= maxxyjograte) ?
    anglexyjograte + 5 : (!bool && anglexyjograte - 5 >= minxyjograte) ?
    anglexyjograte - 5 : anglexyjograte;
  return setAngleXYJograte();
}

function turntUpZJograte(bool) {
  anglezjograte = (bool && anglezjograte + 5 <= maxzjograte) ?
    anglezjograte + 5 : (!bool && anglezjograte - 5 >= minzjograte) ?
    anglezjograte - 5 : anglezjograte;
  return setAngleZJograte();
}

function setAngleFeed() {
  clearTimeout(feedrateOverrideEvent);
  // rotate knob
  knobfeed.style[transform] = `rotate(${(anglefeed-60)*2}deg)`;
  // quickly reset ticks
  for (let tick of ticksfeed) {
    tick.classList.remove('active');
  }
  // add glow to 'active' ticks
  const actives = (Math.round((anglefeed - 50) / 5) + 1);
  for (let tick of ticksfeed.slice(0, actives)) {
    tick.classList.add('active');
  }
  console.log(anglefeed); // 0
  feedrateOverrideEvent = setTimeout(function() {
    currfeed.innerHTML = `${anglefeed}%`;
    // socket.emit('feedOverride', anglefeed)
    logMessage("[override] Setting Feed Override to " + anglefeed + "%");
  }, 200);
}

function setAngleSpeed() {
  clearTimeout(speedOverrideEvent);
  // rotate knob
  knobspeed.style[transform] = `rotate(${(anglespeed-60)*2}deg)`;
  // quickly reset ticks
  for (let tick of ticksspeed) {
    tick.classList.remove('active');
  }
  // add glow to 'active' ticks
  const actives = (Math.round((anglespeed - 50) / 5) + 1);
  for (let tick of ticksspeed.slice(0, actives)) {
    tick.classList.add('active');
  }
  console.log(anglespeed); // 0
  speedOverrideEvent = setTimeout(function() {
    currspeed.innerHTML = `${anglespeed}%`;
    // socket.emit('spindleOverride', anglespeed)
    logMessage("[override] Setting Speed Override to " + anglespeed + "%");
  }, 200);
}

function setAngleRapid() {
  clearTimeout(rapidOverrideEvent);
  // rotate knob
  knobrapid.style[transform] = `rotate(${(anglerapid-30)*2}deg)`;
  // quickly reset ticks
  for (let tick of ticksrapid) {
    tick.classList.remove('active');
  }
  // add glow to 'active' ticks
  const actives = (Math.round((anglerapid - 25) / 5) + 1);
  for (let tick of ticksrapid.slice(0, actives)) {
    tick.classList.add('active');
  }
  console.log(anglerapid); // 0
  rapidOverrideEvent = setTimeout(function() {
    currrapid.innerHTML = `${anglerapid}%`;
    // socket.emit('rapidOverride', anglerapid)
    logMessage("[override] Setting Rapid Override to " + anglerapid + "%");
  }, 200);
}

function setAngleXYJograte() {
  // clearTimeout(xyjograteOverrideEvent);
  // rotate knob
  knobxyjograte.style[transform] = `rotate(${(anglexyjograte-60)*2}deg)`;
  // quickly reset ticks
  for (let tick of ticksxyjograte) {
    tick.classList.remove('active');
  }
  // add glow to 'active' ticks
  const actives = (Math.round((anglexyjograte - 50) / 5) + 1);
  for (let tick of ticksxyjograte.slice(0, actives)) {
    tick.classList.add('active');
  }
  console.log(anglexyjograte); // 0
  // xyjograteOverrideEvent = setTimeout(function() {
  xyjograte = anglexyjograte.map(50, 200, 500, 5000).toFixed(0)
  currxyjograte.innerHTML = `${xyjograte}`;
  // socket.emit('feedOverride', anglefeed)
  // logMessage("[override] Setting Feed Override to " + anglefeed + "%");
  // }, 200);
}

function setAngleZJograte() {
  // clearTimeout(zjograteOverrideEvent);
  // rotate knob
  knobzjograte.style[transform] = `rotate(${(anglezjograte-60)*2}deg)`;
  // quickly reset ticks
  for (let tick of tickszjograte) {
    tick.classList.remove('active');
  }
  // add glow to 'active' ticks
  const actives = (Math.round((anglezjograte - 50) / 5) + 1);
  for (let tick of tickszjograte.slice(0, actives)) {
    tick.classList.add('active');
  }
  console.log(anglezjograte); // 0
  // zjograteOverrideEvent = setTimeout(function() {
  zjograte = anglezjograte.map(50, 200, 50, 1000).toFixed(0)
  currzjograte.innerHTML = `${zjograte}`;
  // socket.emit('feedOverride', anglefeed)
  // logMessage("[override] Setting Feed Override to " + anglefeed + "%");
  // }, 200);
}

const handlerfeed = function(e) {
  e.preventDefault();
  turntUpFeed(e.wheelDelta > 0);
};
knobfeed.addEventListener('mousewheel', handlerfeed);
knobfeed.addEventListener('DOMMouseScroll', handlerfeed);
resetfeed.addEventListener("click", function() {
  anglefeed = 100;
  setAngleFeed();
});

const handlerspeed = function(e) {
  e.preventDefault();
  turntUpSpeed(e.wheelDelta > 0);
};
knobspeed.addEventListener('mousewheel', handlerspeed);
knobspeed.addEventListener('DOMMouseScroll', handlerspeed);
resetspeed.addEventListener("click", function() {
  anglespeed = 100;
  setAngleSpeed();
});

const handlerrapid = function(e) {
  e.preventDefault();
  turntUpRapid(e.wheelDelta > 0);
};
knobrapid.addEventListener('mousewheel', handlerrapid);
knobrapid.addEventListener('DOMMouseScroll', handlerrapid);
resetrapid.addEventListener("click", function() {
  anglerapid = 100;
  setAngleRapid();
});

const handlerxyjograte = function(e) {
  e.preventDefault();
  turntUpXYJograte(e.wheelDelta > 0);
};
knobxyjograte.addEventListener('mousewheel', handlerxyjograte);
knobxyjograte.addEventListener('DOMMouseScroll', handlerxyjograte);
// resetxyjograte.addEventListener("click", function() {
//   anglexyjograte = 100;
//   setAngleXYJograte();
// });

const handlerzjograte = function(e) {
  e.preventDefault();
  turntUpZJograte(e.wheelDelta > 0);
}
knobzjograte.addEventListener('mousewheel', handlerzjograte);
knobzjograte.addEventListener('DOMMouseScroll', handlerzjograte);
// resetzjograte.addEventListener("click", function() {
//   anglezjograte = 100;
//   setAngleZJograte();
// });