$(document).ready(function() {



  $('#refreshSDbtn').on('click', function() {
    $("#sdcardlist").empty()
    $("#sdcardlist").html("refreshing...")
    socket.emit('runCommand', "[ESP210]")
  });

  $('#stopBtn').on('click', function() {
    socket.emit('stop', false);
  });

  $('#clearAlarmBtn').on('click', function() {
    socket.emit('clearAlarm', 2);
  });



  $('#homexbtn').on('click', function() {
    socket.emit('runCommand', "$HX")
  });
  $('#gozeroxbtn').on('click', function() {
    socket.emit('runCommand', "G53 G0 X0")
  });
  $('#setzeroxbtn').on('click', function() {
    socket.emit('runCommand', "G10 L20 X0")
  });
  $('#gozeroxworkbtn').on('click', function() {
    socket.emit('runCommand', "$J=G90 X0 F4000")
  });
  $('#probexbtn').on('click', function() {
    // socket.emit('runCommand', "")
  });
  //
  $('#homeybtn').on('click', function() {
    socket.emit('runCommand', "$HY")
  });
  $('#gozeroybtn').on('click', function() {
    socket.emit('runCommand', "G53 G0 Y0")
  });
  $('#setzeroybtn').on('click', function() {
    socket.emit('runCommand', "G10 L20 Y0")
  });
  $('#gozeroyworkbtn').on('click', function() {
    socket.emit('runCommand', "$J=G90 Y0 F4000")
  });
  $('#probeybtn').on('click', function() {
    // socket.emit('runCommand', "")
  });
  //
  $('#homezbtn').on('click', function() {
    socket.emit('runCommand', "$HZ")
  });
  $('#gozerozbtn').on('click', function() {
    socket.emit('runCommand', "G53 G0 Z0")
  });
  $('#setzerozbtn').on('click', function() {
    socket.emit('runCommand', "G10 L20 Z0")
  });
  $('#gozerozworkbtn').on('click', function() {
    socket.emit('runCommand', "$J=G90 Z0 F4000")
  });
  $('#probezbtn').on('click', function() {
    // socket.emit('runCommand', "")
  });
  //
  $('#homexyzbtn').on('click', function() {
    socket.emit('runCommand', "$H")
  });
  $('#gozeroxyzbtn').on('click', function() {
    socket.emit('runCommand', "G53 G0 Z0")
    socket.emit('runCommand', "G0 X0 Y0")
    socket.emit('runCommand', "G0 Z0")
  });
  $('#setzeroxyzbtn').on('click', function() {
    socket.emit('runCommand', "G10 L20 X0 Y0 Z0")
  });
  $('#gozeroxyzworkbtn').on('click', function() {
    socket.emit('runCommand', "G0 Z0")
    socket.emit('runCommand', "G0 X0 Y0")
    socket.emit('runCommand', "G0 Z0")
  });
  $('#probextzbtn').on('click', function() {
    // socket.emit('runCommand', "")
  });
  //

  $('#m8btn').on('click', function() {
    if (laststatus.machine.modals.coolantstate == "M8") {
      socket.emit('runCommand', "M9")
    } else {
      socket.emit('runCommand', "M8")
    }
  });
  $('#m7btn').on('click', function() {
    if (laststatus.machine.modals.coolantstate == "M7") {
      socket.emit('runCommand', "M9")
    } else {
      socket.emit('runCommand', "M7")
    }
  });

  $('#m3btn').on('click', function() {
    if (laststatus.machine.modals.spindlestate == "M3") {
      socket.emit('runCommand', "M5")
    } else {
      socket.emit('runCommand', "M3")
    }
  });
  $('#m4btn').on('click', function() {
    if (laststatus.machine.modals.spindlestate == "M4") {
      socket.emit('runCommand', "M5")
    } else {
      socket.emit('runCommand', "M4")
    }
  });


  $('#g20btn').on('click', function() {
    socket.emit('runCommand', "G20")
  });
  $('#g21btn').on('click', function() {
    socket.emit('runCommand', "G21")
  });

  $('#g54btn').on('click', function() {
    socket.emit('runCommand', "G54")
  });
  $('#g55btn').on('click', function() {
    socket.emit('runCommand', "G55")
  });
  $('#g56btn').on('click', function() {
    socket.emit('runCommand', "G56")
  });
  $('#g57btn').on('click', function() {
    socket.emit('runCommand', "G57")
  });
  $('#g58btn').on('click', function() {
    socket.emit('runCommand', "G58")
  });
  $('#g59btn').on('click', function() {
    socket.emit('runCommand', "G59")
  });

  $('#g90btn').on('click', function() {
    socket.emit('runCommand', "G90")
  });
  $('#g91btn').on('click', function() {
    socket.emit('runCommand', "G91")
  });

  $('#g93btn').on('click', function() {
    socket.emit('runCommand', "G93")
  });
  $('#g94btn').on('click', function() {
    socket.emit('runCommand', "G94")
  });

});

function updateLEDs(status) {
  $('.wcsbtn').removeClass('ledactive')
  $('.distancemodebtn').removeClass('ledactive')
  $('.feedmodebtn').removeClass('ledactive')
  $('.unitsmodebtn').removeClass('ledactive')

  if (status.machine.modals.spindlestate == "M5") {
    $('#m3btn').removeClass('ledactive')
    $('#m4btn').removeClass('ledactive')
  }
  if (status.machine.modals.spindlestate == "M4") {
    $('#m3btn').removeClass('ledactive')
    $('#m4btn').addClass('ledactive')
  }
  if (status.machine.modals.spindlestate == "M3") {
    $('#m3btn').addClass('ledactive')
    $('#m4btn').removeClass('ledactive')
  }
  if (status.machine.modals.coolantstate == "M9") {
    $('#m8btn').removeClass('ledactive')
    $('#m7btn').removeClass('ledactive')
  }

  if (status.machine.modals.coolantstate == "M8") {
    $('#m7btn').removeClass('ledactive')
    $('#m8btn').addClass('ledactive')
  }

  if (status.machine.modals.coolantstate == "M7") {
    $('#m8btn').removeClass('ledactive')
    $('#m7btn').addClass('ledactive')
  }

  if (status.machine.modals.coordinatesys == "G54") {
    $('#g54btn').addClass('ledactive')
  }
  if (status.machine.modals.coordinatesys == "G55") {
    $('#g55btn').addClass('ledactive')
  }
  if (status.machine.modals.coordinatesys == "G56") {
    $('#g56btn').addClass('ledactive')
  }
  if (status.machine.modals.coordinatesys == "G57") {
    $('#g57btn').addClass('ledactive')
  }
  if (status.machine.modals.coordinatesys == "G58") {
    $('#g58btn').addClass('ledactive')
  }
  if (status.machine.modals.coordinatesys == "G59") {
    $('#g59btn').addClass('ledactive')
  }

  if (status.machine.modals.distancemode == "G90") {
    $('#g90btn').addClass('ledactive')
  }
  if (status.machine.modals.distancemode == "G91") {
    $('#g91btn').addClass('ledactive')
  }

  if (status.machine.modals.tlomode == "G49") {
    $('#g49btn').addClass('ledactive')
  }

  if (status.machine.modals.tlomode == "G43.1") {
    $('#g43.1btn').addClass('ledactive')
  }

  if (status.machine.modals.feedratemode == "G93") {
    $('#g93btn').addClass('ledactive')
  }
  if (status.machine.modals.feedratemode == "G94") {
    $('#g94btn').addClass('ledactive')
  }

  if (status.machine.modals.unitsmode == "G20") {
    $('#g20btn').addClass('ledactive')
  }
  if (status.machine.modals.unitsmode == "G21") {
    $('#g21btn').addClass('ledactive')
  }

}