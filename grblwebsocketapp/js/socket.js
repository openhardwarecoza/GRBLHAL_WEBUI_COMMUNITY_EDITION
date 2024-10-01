var socket, server = '',
  laststatus, bellstate = false;

$(document).ready(function() {
  initSocket();
  initUiBindings();
  setTimeout(function() {
    populatePortsMenu();
  }, 500);
  initBell();

});

function initBell() {
  var bellflash = setInterval(function() {
    if (laststatus) {
      if (laststatus.comms.connectionStatus == 5) {
        if (bellstate == false) {
          $('#navbell').hide();
          bellstate = true
        } else {
          $('#navbell').show();
          bellstate = false
        }
      } else {
        $('#navbell').hide();
      }
    }

  }, 200);
}

function initUiBindings() {
  $('#connectBtn').on('click', function() {
    var port = $('#ports').val();
    if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(port)) {
      var data = {
        ip: port,
        port: false,
        baud: false,
        type: "telnet"
      };
      localStorage.setItem("lastip", port);
    } else {
      var data = {
        port: port,
        baud: 115200,
        type: "usb"
      };
    }
    if (port.length > 1) {
      socket.emit('connectTo', data);
    } else {
      logMessage("[connect] No Ports/IP selected/entered")
    }
  })

  $('#ports').keypress(function(event) {
    if (event.keyCode == 13) {
      $('#connectBtn').click();
    }
  });


  $('#disconnectBtn').on('click', function() {
    $('#ports').val("")
    socket.emit('closePort', true)
  })

  $('#consoleBtn').on('click', function() {
    var command = $('#consoleCommand').val();
    socket.emit('runCommand', command)
    $('#consoleCommand').val('');
  })

  $('#consoleCommand').keypress(function(event) {
    if (event.keyCode == 13) {
      $('#consoleBtn').click();
    }
  });

}

function initSocket() {
  socket = io.connect(server); // socket.io init
  socket.on('connect', () => {
    logMessage("[websocket] Connected to backend")
  });

  socket.on('disconnect', () => {
    logMessage("[websocket] Disconnected from backend")
  });

  socket.on('connect_error', (error) => {
    logMessage("[websocket] connect_error: " + error)
  });

  socket.on('connect_timeout', (error) => {
    logMessage("[websocket] connect_timeout: " + error)
  });

  socket.on('error', (error) => {
    logMessage("[websocket] error: " + error)
  });

  socket.on('reconnect_attempt', (attemptNumber) => {
    logMessage("[websocket] Attempting to reconnect: Try " + attemptNumber)
  });

  socket.on("sdcardlist", function(sdcardlist) {
    sdCardList(sdcardlist)
  });

  socket.on("esp32uploadstatus", function(esp32uploadstatus) {
    if (esp32uploadstatus.status) {
      $("#uploadSDbtn").prop('disabled', true);
    } else {
      $("#uploadSDbtn").prop('disabled', false);
    }
  });

  socket.on("status", function(status) {
    // console.log(status)
    processSDStatus(status)
    if (status.machine.sdcard.status) {
      status.comms.connectionStatus = 3 // override to set UI
    }
    setConnectBar(status.comms.connectionStatus, status);
    setDRO(status)
    updateStatuses(status)
    updateLEDs(status)
    if (laststatus) {
      if (status.comms.interfaces.ports.length != laststatus.comms.interfaces.ports.length) {
        populatePortsMenu(status)
      }
    }

    laststatus = status;
  });

  socket.on("data", function(data) {
    logMessage("[" + data.command + "] " + data.response)
  });
};

function updateStatuses(status) {
  $('.singleaxishomingbtn').prop('disabled', true);
  for (i = 0; i < status.machine.firmware.features.length; i++) {
    // console.log(status.machine.firmware.features)
    switch (status.machine.firmware.features[i]) {
      case 'Q':
        // console.log('SPINDLE_IS_SERVO Enabled')
        $('.enServo').removeClass('alert').addClass('success').html('ON')
        $(".servo-active").show()
        break;
      case 'V': //	Variable spindle enabled
        // console.log('Variable spindle enabled')
        $('.enVariableSpindle').removeClass('alert').addClass('success').html('ON')
        break;
      case 'N': //	Line numbers enabled
        // console.log('Line numbers enabled')
        $('.enLineNumbers').removeClass('alert').addClass('success').html('ON')
        break;
      case 'M': //	Mist coolant enabled
        // console.log('Mist coolant enabled')
        $('#menuMisting').show();
        $('.enMisting').removeClass('alert').addClass('success').html('ON')
        break;
      case 'C': //	CoreXY enabled
        // console.log('CoreXY enabled')
        $('.enCoreXY').removeClass('alert').addClass('success').html('ON')
        break;
      case 'P': //	Parking motion enabled
        // console.log('Parking motion enabled')
        $('.enParking').removeClass('alert').addClass('success').html('ON')
        break;
      case 'Z': //	Homing force origin enabled
        // console.log('Homing force origin enabled')
        $('.enHomingOrigin').removeClass('alert').addClass('success').html('ON')
        break;
      case 'H': //	Homing single axis enabled
        // console.log('Homing single axis enabled')
        $('.enSingleAxisHome').removeClass('alert').addClass('success').html('ON')
        $('.singleaxishomingbtn').prop('disabled', false);
        break;
      case 'T': //	Two limit switches on axis enabled
        // console.log('Two limit switches on axis enabled')
        $('.enTwoLimits').removeClass('alert').addClass('success').html('ON')
        break;
      case 'A': //	Allow feed rate overrides in probe cycles
        // console.log('Allow feed rate overrides in probe cycles')
        $('.enFeedOVProbe').removeClass('alert').addClass('success').html('ON')
        break;
      case '$': //	Restore EEPROM $ settings disabled
        // console.log('Restore EEPROM $ settings disabled')
        $('.enEepromSettingsDisable').removeClass('alert').addClass('success').html('ON')
        break;
      case '#': //	Restore EEPROM parameter data disabled
        // console.log('Restore EEPROM parameter data disabled')
        $('.enEepromParamsDisable').removeClass('alert').addClass('success').html('ON')
        break;
      case 'I': //	Build info write user string disabled
        // console.log('Build info write user string disabled')
        $('.enBuildInfoDisabled').removeClass('alert').addClass('success').html('ON')
        break;
      case 'E': //	Force sync upon EEPROM write disabled
        // console.log('Force sync upon EEPROM write disabled')
        $('.enForceSyncEeprom').removeClass('alert').addClass('success').html('ON')
        break;
      case 'W': //	Force sync upon work coordinate offset change disabled
        // console.log('Force sync upon work coordinate offset change disabled')
        $('.enForceSyncWco').removeClass('alert').addClass('success').html('ON')
        break;
      case 'L': //	Homing init lock sets Grbl into an alarm state upon power up
        // console.log('Homing init lock sets Grbl into an alarm state upon power up')
        $('.enHomingInitLock').removeClass('alert').addClass('success').html('ON')
        break;
      case '2': //	Dual motor support for self-squaring gantry homing.
        $('.enDualAxisHoming').removeClass('alert').addClass('success').html('ON')
        //
        break;
    }
  }


  $('.pinstatus').html('')
  if (status.machine.inputs.length > 0) {
    for (i = 0; i < status.machine.inputs.length; i++) {
      switch (status.machine.inputs[i]) {
        case 'X':
          // console.log('PIN: X-LIMIT');
          $('.xpin').removeClass('success').addClass('alert').html('ON')
          break;
        case 'Y':
          // console.log('PIN: Y-LIMIT');
          $('.ypin').removeClass('success').addClass('alert').html('ON')
          break;
        case 'Z':
          // console.log('PIN: Z-LIMIT');
          $('.zpin').removeClass('success').addClass('alert').html('ON')
          break;
        case 'P':
          // console.log('PIN: PROBE');
          $('.prbpin').removeClass('success').addClass('alert').html('ON')
          break;
        case 'D':
          // console.log('PIN: DOOR');
          $('.doorpin').removeClass('success').addClass('alert').html('ON')
          break;
        case 'H':
          // console.log('PIN: HOLD');
          $('.holdpin').removeClass('success').addClass('alert').html('HOLD:ON')
          break;
        case 'R':
          // console.log('PIN: SOFTRESET');
          $('.resetpin').removeClass('success').addClass('alert').html('RST:ON')
          break;
        case 'S':
          // console.log('PIN: CYCLESTART');
          $('.startpin').removeClass('success').addClass('alert').html('START:ON')
          break;
      }
    }
  }

  $('#commsBlocked').html(JSON.stringify(status.comms.blocked))
  switch (status.comms.connectionStatus) {
    case 0:
      $('#commsConnectionStatus').html("Not Connected / " + status.comms.connectionStatus)
      break;
    case 1:
      $('#commsConnectionStatus').html("Connected / " + status.comms.connectionStatus)
      break;
    case 2:
      $('#commsConnectionStatus').html("Connected / " + status.comms.connectionStatus)
      break;
    case 3:
      $('#commsConnectionStatus').html("Running Job / " + status.comms.connectionStatus)
      break;
    case 4:
      $('#commsConnectionStatus').html("Paused / " + status.comms.connectionStatus)
      break;
    case 5:
      $('#commsConnectionStatus').html("Alarmed / " + status.comms.connectionStatus)
      break;
  }

  $('.activeConnection').html(status.comms.interfaces.activePort + " at " + status.comms.interfaces.activeBaud + " baud")
  $('.commsQueue').html(status.comms.queue)
  $('.driverIP').html(status.driver.ipaddress)
  $('.driverOS').html(status.driver.operatingsystem)
  $('.driverVer').html(status.driver.version)
  $('.grblVer').html(status.machine.firmware.type + " " + status.machine.firmware.version + " " + status.machine.firmware.date)
  if (status.machine.buffer) {
    $('.commsBuffer').html("blocks: " + status.machine.buffer[0] + " / bytes: " + status.machine.buffer[1])
  }
  $('.motionmode').html(status.machine.modals.motionmode)
  $('.coordinatesys').html(status.machine.modals.coordinatesys)
  $('.plane').html(status.machine.modals.plane)
  $('.distancemode').html(status.machine.modals.distancemode)
  $('.arcdistmode').html(status.machine.modals.arcdistmode)
  $('.feedratemode').html(status.machine.modals.feedratemode)
  $('.unitsmode').html(status.machine.modals.unitsmode)
  $('.tlomode').html(status.machine.modals.tlomode)
  $('.programmode').html(status.machine.modals.programmode)
  $('.spindlestate').html(status.machine.modals.spindlestate)
  $('.coolantstate').html(status.machine.modals.coolantstate)
  $('.radiuscomp').html(status.machine.modals.radiuscomp)
  $('.modaltool').html(status.machine.modals.tool)
  $('.modalspindle').html(status.machine.modals.spindle)
  $('.modalfeedrate').html(status.machine.modals.feedrate)




}

function populatePortsMenu(newStatus) {
  if (!newStatus) {
    var newStatus = laststatus
  }
  $("#portslist").empty();
  $("#ports").attr('disabled', false);
  $("#connectBtn").attr('disabled', false);
  var response = ``
  if (localStorage.getItem("lastip")) {
    var lastip = localStorage.getItem("lastip")
    response += `<option value="` + lastip + `">(previous TCP connection)` + `</option>`;
  }

  for (i = 0; i < newStatus.comms.interfaces.ports.length; i++) {
    var port = friendlyPort(i, newStatus)
    response += `<option value="` + newStatus.comms.interfaces.ports[i].comName + `">` + port.note + " " + newStatus.comms.interfaces.ports[i].comName.replace("/dev/tty.", "") + `</option>`;
  };
  if (newStatus.comms.interfaces.ports.length == 0) {
    response += `<option value="">Waiting for USB</option`
    $("#ports").attr('disabled', true);
    $("#connectBtn").attr('disabled', true);
  }
  $("#portslist").append(response);

}

function friendlyPort(i, newStatus) {
  // var likely = false;
  var note = '';
  var manufacturer = newStatus.comms.interfaces.ports[i].manufacturer
  if (manufacturer == `(Standard port types)`) {
    note = 'Motherboard Serial Port';
  } else if (newStatus.comms.interfaces.ports[i].productId && newStatus.comms.interfaces.ports[i].vendorId) {
    if (newStatus.comms.interfaces.ports[i].productId == '6015' && newStatus.comms.interfaces.ports[i].vendorId == '1D50') {
      // found Smoothieboard
      note = 'Smoothieware USB Port';
    }
    if (newStatus.comms.interfaces.ports[i].productId == '6001' && newStatus.comms.interfaces.ports[i].vendorId == '0403') {
      // found FTDI FT232
      note = 'FTDI USB to Serial';
    }
    if (newStatus.comms.interfaces.ports[i].productId == '6015' && newStatus.comms.interfaces.ports[i].vendorId == '0403') {
      // found FTDI FT230x
      note = 'FTDI USD to Serial';
    }
    if (newStatus.comms.interfaces.ports[i].productId == '606D' && newStatus.comms.interfaces.ports[i].vendorId == '1D50') {
      // found TinyG G2
      note = 'Tiny G2';
    }
    if (newStatus.comms.interfaces.ports[i].productId == '003D' && newStatus.comms.interfaces.ports[i].vendorId == '2341') {
      // found Arduino Due Prog Port
      note = 'Arduino Due Prog';
    }
    if (newStatus.comms.interfaces.ports[i].productId == '0043' && newStatus.comms.interfaces.ports[i].vendorId == '2341' || newStatus.comms.interfaces.ports[i].productId == '0001' && newStatus.comms.interfaces.ports[i].vendorId == '2341' || newStatus.comms.interfaces.ports[i].productId == '0043' && newStatus.comms.interfaces.ports[i].vendorId == '2A03') {
      // found Arduino Uno
      note = 'Arduino Uno';
    }
    if (newStatus.comms.interfaces.ports[i].productId == '2341' && newStatus.comms.interfaces.ports[i].vendorId == '0042') {
      // found Arduino Mega
      note = 'Arduino Mega';
    }
    if (newStatus.comms.interfaces.ports[i].productId == '7523' && newStatus.comms.interfaces.ports[i].vendorId == '1A86') {
      // found CH340
      note = 'CH340';
    }
    if (newStatus.comms.interfaces.ports[i].productId == 'EA60' && newStatus.comms.interfaces.ports[i].vendorId == '10C4') {
      // found CP2102
      note = 'NodeMCU';
    }
    if (newStatus.comms.interfaces.ports[i].productId == '2303' && newStatus.comms.interfaces.ports[i].vendorId == '067B') {
      // found CP2102
      note = 'Prolific USB to Serial';
    }
  }

  return {
    note: note
  };
}

function setConnectBar(val, status) {
  if (val == 0) { // Not Connected Yet
    if (laststatus) {
      if (laststatus.comms.interfaces.ports.length == 0) {
        $('#ports').attr('disabled', true);
      } else {
        $('#ports').attr('disabled', false);
      }
    }
    $('#disconnectBtn').hide();
    $('#connectBtn').show();
    $('#playBtn').attr('disabled', true).show();
    $('#pauseBtn').attr('disabled', true).hide();
    $('#resumeBtn').attr('disabled', true).hide();
    $('#stopBtn').attr('disabled', true).show();
    $('#clearAlarmBtn').attr('disabled', true).show();
    $('#consoleBtn').attr('disabled', true);
  } else if (val == 1 || val == 2) { // Connected, but not Playing yet
    $('#ports').attr('disabled', true);
    $('#ports').val(status.comms.interfaces.activePort)
    $('#disconnectBtn').show();
    $('#connectBtn').hide();
    $('#playBtn').attr('disabled', false).show();
    $('#pauseBtn').attr('disabled', true).hide();
    $('#resumeBtn').attr('disabled', true).hide();
    $('#stopBtn').attr('disabled', true).show();
    $('#clearAlarmBtn').attr('disabled', true).show();
    $('#consoleBtn').attr('disabled', false);
  } else if (val == 3) { // Busy Streaming GCODE
    $('#ports').attr('disabled', true);
    $('#ports').val(status.comms.interfaces.activePort)
    $('#disconnectBtn').show();
    $('#connectBtn').hide();
    $('#playBtn').attr('disabled', true).show();
    $('#pauseBtn').attr('disabled', false).hide();
    $('#resumeBtn').attr('disabled', true).hide();
    $('#stopBtn').attr('disabled', false).show();
    $('#clearAlarmBtn').attr('disabled', true).show();
    $('#consoleBtn').attr('disabled', true);
  } else if (val == 4) { // Paused
    $('#ports').attr('disabled', true);
    $('#ports').val(status.comms.interfaces.activePort)
    $('#disconnectBtn').show();
    $('#connectBtn').hide();
    $('#playBtn').attr('disabled', true).hide();
    $('#pauseBtn').attr('disabled', true).hide();
    $('#resumeBtn').attr('disabled', true).show();
    $('#stopBtn').attr('disabled', false).show();
    $('#clearAlarmBtn').attr('disabled', true).show();
    $('#consoleBtn').attr('disabled', false);
  } else if (val == 5) { // Alarm State
    $('#ports').attr('disabled', true);
    $('#ports').val(status.comms.interfaces.activePort)
    $('#disconnectBtn').show();
    $('#connectBtn').hide();
    $('#playBtn').attr('disabled', true).show();
    $('#pauseBtn').attr('disabled', true).hide();
    $('#resumeBtn').attr('disabled', true).hide();
    $('#stopBtn').attr('disabled', false).show();
    $('#clearAlarmBtn').attr('disabled', false).show();
    $('#consoleBtn').attr('disabled', true);
  } else if (val == 6) { // Firmware Upgrade State
    //
  }
}

function setDRO(status) {
  if (status.comms.connectionStatus > 0) {
    $('.xWPos').html(parseFloat(status.machine.status.work.x).toFixed(3))
    $('.xMPos').html((parseFloat(status.machine.status.work.x) + parseFloat(status.machine.status.offset.x)).toFixed(3))
    $('.yWPos').html(parseFloat(status.machine.status.work.y).toFixed(3))
    $('.yMPos').html((parseFloat(status.machine.status.work.y) + parseFloat(status.machine.status.offset.y)).toFixed(3))
    $('.zWPos').html(parseFloat(status.machine.status.work.z).toFixed(3))
    $('.zMPos').html((parseFloat(status.machine.status.work.z) + parseFloat(status.machine.status.offset.z)).toFixed(3))
    $('.fVal').html(parseFloat(status.machine.status.realFeed))
    $('.sVal').html(parseFloat(status.machine.status.realSpindle))
    $('.fValOverride').html(parseFloat(status.machine.overrides.feedOverride) + "%")
    $('.sValOverride').html(parseFloat(status.machine.overrides.spindleOverride) + "%")
    $('.rapidOverride').html(parseFloat(status.machine.overrides.rapidOverride) + "%")
    $('.accSpindleCW').html("off");
    $('.accSpindleCCW').html("off");
    $('.accCoolant').html("off");
    $('.accMist').html("off");
    for (i = 0; i < status.machine.accesories.length; i++) {
      if (status.machine.accesories[i] == "S") {
        $('.accSpindle').html("CW");
      }
      if (status.machine.accesories[i] == "C") {
        $('.accSpindle').html("CCW");
      }
      if (status.machine.accesories[i] == "F") {
        $('.accCoolant').html("on");
      }
      if (status.machine.accesories[i] == "M") {
        $('.accMist').html("on");
      }
    }

  } else {
    $('.xWPos').html("0.000");
    $('.xMPos').html("0.000");
    $('.yWPos').html("0.000");
    $('.yMPos').html("0.000");
    $('.zWPos').html("0.000");
    $('.zMPos').html("0.000");
    $('.sVal').html("0.0")
    $('.fVal').html("0.0")
    $('.sValOverride').html("100%")
    $('.fValOverride').html("100%")
    $('.rapidOverride').html("100%")
  }
}

function logMessage(string) {
  if (document.getElementById("console") !== null) {
    if (string.isString) {
      // split(/\r\n|\n|\r/);
      string = string.replace(/\r\n|\n|\r/, "<br />");
    }
    if ($('#console p').length > 100) {
      // remove oldest if already at 300 lines
      $('#console p').first().remove();
    }
    var template = '<p class="pf">';
    var time = new Date();

    template += '<span class="text-success">[' + (time.getHours() < 10 ? '0' : '') + time.getHours() + ":" + (time.getMinutes() < 10 ? '0' : '') + time.getMinutes() + ":" + (time.getSeconds() < 10 ? '0' : '') + time.getSeconds() + ']</span> ';
    template += '<span class="text-secondary">' + string + '</span>';
    $('#console').append(template);
    $('#console').scrollTop(($("#console")[0].scrollHeight - $("#console").height()) + 20);
  }
}

$.fn.onEnterKey =
  function(closure) {
    $(this).keypress(
      function(event) {
        var code = event.keyCode ? event.keyCode : event.which;

        if (code == 13) {
          closure();
          return false;
        }
      });
  }

function formatBytes(a, b) {
  if (0 == a) return "0 Bytes";
  var c = 1024,
    d = b || 2,
    e = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
    f = Math.floor(Math.log(a) / Math.log(c));
  return parseFloat((a / Math.pow(c, f)).toFixed(d)) + e[f]
}