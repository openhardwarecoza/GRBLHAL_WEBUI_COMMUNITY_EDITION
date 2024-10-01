var allowContinuousJog = false;
var jogdist = 10;

function cancelJog() {
  socket.emit('stop', true)
}

$(document).ready(function() {

  $('#dist01').on('click', function(ev) {
    jogdist = 0.1;
    $('.distbtn').removeClass('ledactive')
    $('#dist01').addClass('ledactive')
    $('.distlabel').html("0.1mm")
  })

  $('#dist1').on('click', function(ev) {
    jogdist = 1;
    $('.distbtn').removeClass('ledactive')
    $('#dist1').addClass('ledactive')
    $('.distlabel').html("1mm")
  })

  $('#dist10').on('click', function(ev) {
    jogdist = 10;
    $('.distbtn').removeClass('ledactive')
    $('#dist10').addClass('ledactive')
    $('.distlabel').html("10mm")
  })

  $('#dist100').on('click', function(ev) {
    jogdist = 100;
    $('.distbtn').removeClass('ledactive')
    $('#dist100').addClass('ledactive')
    $('.distlabel').html("100mm")
  })

  $('#xM').on('click', function(ev) {
    console.log(ev)
    if (!allowContinuousJog) {
      var dir = 'X-';
      jog('X', '-' + jogdist, xyjograte);
    }
  })

  $('#xP').on('click', function(ev) {
    if (!allowContinuousJog) {
      var dir = 'X-';
      jog('X', jogdist, xyjograte);
    }
  })

  $('#yM').on('click', function(ev) {
    if (!allowContinuousJog) {
      var dir = 'X-';
      jog('Y', '-' + jogdist, xyjograte);
    }
  })

  $('#yP').on('click', function(ev) {
    if (!allowContinuousJog) {
      var dir = 'X-';
      jog('Y', jogdist, xyjograte);
    }
  })

  $('#zM').on('click', function(ev) {
    if (!allowContinuousJog) {
      var dir = 'X-';
      jog('Z', '-' + jogdist, zjograte);
    }
  })

  $('#zP').on('click', function(ev) {
    if (!allowContinuousJog) {
      var dir = 'X-';
      jog('Z', jogdist, zjograte);
    }
  })

  $('#xP').on('mousedown', function(ev) {
    if (allowContinuousJog) { // startJog();
      var direction = "X";
      socket.emit('runCommand', "$J=G91 G21 " + direction + "1000 F" + xyjograte + "\n");
      $('#xM').click();
    }
  });
  $('#xP').on('mouseup', function(ev) {
    if (allowContinuousJog) {
      cancelJog()
    }
  });

  $('#yM').on('mousedown', function(ev) {
    if (allowContinuousJog) { // startJog();
      var direction = "Y-";
      socket.emit('runCommand', "$J=G91 G21 " + direction + "1000 F" + xyjograte + "\n");
      $('#xM').click();
    }
  });
  $('#yM').on('mouseup', function(ev) {
    if (allowContinuousJog) {
      cancelJog()
    }
  });

  $('#yP').on('mousedown', function(ev) {
    if (allowContinuousJog) { // startJog();
      var direction = "Y";
      socket.emit('runCommand', "$J=G91 G21 " + direction + "1000 F" + xyjograte + "\n");
      $('#xM').click();
    }
  });
  $('#yP').on('mouseup', function(ev) {
    if (allowContinuousJog) {
      cancelJog()
    }
  });

  $('#zM').on('mousedown', function(ev) {
    if (allowContinuousJog) { // startJog();
      var direction = "Z-";
      socket.emit('runCommand', "$J=G91 G21 " + direction + "1000 F" + zjograte + "\n");
      $('#xM').click();
    }
  });
  $('#zM').on('mouseup', function(ev) {
    if (allowContinuousJog) {
      cancelJog()
    }
  });

  $('#zP').on('mousedown', function(ev) {
    if (allowContinuousJog) { // startJog();
      var direction = "Z";
      socket.emit('runCommand', "$J=G91 G21 " + direction + "1000 F" + zjograte + "\n");
      $('#xM').click();
    }
  });
  $('#zP').on('mouseup', function(ev) {
    if (allowContinuousJog) {
      cancelJog()
    }
  });

  $('#xM').on('mousedown', function(ev) {
    if (allowContinuousJog) { // startJog();
      var direction = "X-";
      socket.emit('runCommand', "$J=G91 G21 " + direction + "1000 F" + xyjograte + "\n");
      $('#xM').click();
    }
  });
  $('#xM').on('mouseup', function(ev) {
    if (allowContinuousJog) {
      cancelJog()
    }
  });

  $('#homeBtn').on('click', function(ev) {
    home();
  })

  $('#chkSize').on('click', function() {
    var bbox2 = new THREE.Box3().setFromObject(object);
    console.log('bbox for Draw Bounding Box: ' + object + ' Min X: ', (bbox2.min.x), '  Max X:', (bbox2.max.x), 'Min Y: ', (bbox2.min.y), '  Max Y:', (bbox2.max.y));
    if (laststatus.machine.firmware.type === 'grbl') {
      if (object.userData.inch) {
        var moves = `
        $J=G90G20X` + (bbox2.min.x) + ` Y` + (bbox2.min.y) + ` F` + xyjograte + `\n
        $J=G90G20X` + (bbox2.max.x) + ` Y` + (bbox2.min.y) + ` F` + xyjograte + `\n
        $J=G90G20X` + (bbox2.max.x) + ` Y` + (bbox2.max.y) + ` F` + xyjograte + `\n
        $J=G90G20X` + (bbox2.min.x) + ` Y` + (bbox2.max.y) + ` F` + xyjograte + `\n
        $J=G90G20X` + (bbox2.min.x) + ` Y` + (bbox2.min.y) + ` F` + xyjograte + `\n
        `;
      } else {
        var moves = `
        $J=G90G21X` + (bbox2.min.x) + ` Y` + (bbox2.min.y) + ` F` + xyjograte + `\n
        $J=G90G21X` + (bbox2.max.x) + ` Y` + (bbox2.min.y) + ` F` + xyjograte + `\n
        $J=G90G21X` + (bbox2.max.x) + ` Y` + (bbox2.max.y) + ` F` + xyjograte + `\n
        $J=G90G21X` + (bbox2.min.x) + ` Y` + (bbox2.max.y) + ` F` + xyjograte + `\n
        $J=G90G21X` + (bbox2.min.x) + ` Y` + (bbox2.min.y) + ` F` + xyjograte + `\n
        `;
      }

    } else {
      var moves = `
       G90\n
       G0 X` + (bbox2.min.x) + ` Y` + (bbox2.min.y) + ` F` + xyjograte + `\n
       G0 X` + (bbox2.max.x) + ` Y` + (bbox2.min.y) + ` F` + xyjograte + `\n
       G0 X` + (bbox2.max.x) + ` Y` + (bbox2.max.y) + ` F` + xyjograte + `\n
       G0 X` + (bbox2.min.x) + ` Y` + (bbox2.max.y) + ` F` + xyjograte + `\n
       G0 X` + (bbox2.min.x) + ` Y` + (bbox2.min.y) + ` F` + xyjograte + `\n
       G90\n`;
    }
    socket.emit('runJob', moves);
  });

});

function changeStepSize(dir) {
  if (jogdist == 0.1) {
    if (dir == 1) {
      jogdist = 1;
      $('.distbtn').removeClass('bd-openbuilds')
      $('#dist1').addClass('bd-openbuilds')
      $('.jogdist').removeClass('fg-openbuilds')
      $('.jogdist').addClass('fg-gray')
      $('#dist1label').removeClass('fg-gray')
      $('#dist1label').addClass('fg-openbuilds')
    }
    if (dir == -1) {
      // do nothing
    }
  } else if (jogdist == 1) {
    if (dir == 1) {
      jogdist = 10;
      $('.distbtn').removeClass('bd-openbuilds')
      $('#dist10').addClass('bd-openbuilds')
      $('.jogdist').removeClass('fg-openbuilds')
      $('.jogdist').addClass('fg-gray')
      $('#dist10label').removeClass('fg-gray')
      $('#dist10label').addClass('fg-openbuilds')
    }
    if (dir == -1) {
      jogdist = 0.1;
      $('.distbtn').removeClass('bd-openbuilds')
      $('#dist01').addClass('bd-openbuilds')
      $('.jogdist').removeClass('fg-openbuilds')
      $('.jogdist').addClass('fg-gray')
      $('#dist01label').removeClass('fg-gray')
      $('#dist01label').addClass('fg-openbuilds')
    }
  } else if (jogdist == 10) {
    if (dir == 1) {
      jogdist = 100;
      $('.distbtn').removeClass('bd-openbuilds')
      $('#dist100').addClass('bd-openbuilds')
      $('.jogdist').removeClass('fg-openbuilds')
      $('.jogdist').addClass('fg-gray')
      $('#dist100label').removeClass('fg-gray')
      $('#dist100label').addClass('fg-openbuilds')
    }
    if (dir == -1) {
      jogdist = 1;
      $('.distbtn').removeClass('bd-openbuilds')
      $('#dist1').addClass('bd-openbuilds')
      $('.jogdist').removeClass('fg-openbuilds')
      $('.jogdist').addClass('fg-gray')
      $('#dist1label').removeClass('fg-gray')
      $('#dist1label').addClass('fg-openbuilds')
    }
  } else if (jogdist == 100) {
    if (dir == 1) {
      // do nothing
    }
    if (dir == -1) {
      jogdist = 10;
      $('.distbtn').removeClass('bd-openbuilds')
      $('#dist10').addClass('bd-openbuilds')
      $('.jogdist').removeClass('fg-openbuilds')
      $('.jogdist').addClass('fg-gray')
      $('#dist10label').removeClass('fg-gray')
      $('#dist10label').addClass('fg-openbuilds')
    }
  }

}

function jog(dir, dist, feed = null) {
  console.log({
    dist: dist,
    feed: feed,
    dir: dir
  })
  socket.emit('jog', {
    dist: dist,
    feed: feed,
    dir: dir
  });
};


function jogXY(xincrement, yincrement, feed = null) {
  var data = {
    x: xincrement,
    y: yincrement,
    feed: feed
  }
  socket.emit('jogXY', data);
}

function home() {
  if (laststatus != undefined && laststatus.machine.firmware.type == 'grbl') {
    sendGcode('$H')
  } else if (laststatus != undefined && laststatus.machine.firmware.type == 'smoothie') {
    sendGcode('G28')
  }
}