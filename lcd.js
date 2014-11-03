/*jshint  unused:false, bitwise:false */
/*global  console */

var API_KEY = 'EA46CD0BE91443688281453930FB027D',
    HOST = '192.168.0.103',
    PORT = '5000';

var serlcd = require('serlcd'),
    request = require('request'),
    lcd = new serlcd('/dev/ttyAMA0'),
    main, rpad, center, finish, ip_address;

var ifaces = require('os').networkInterfaces();
for (var dev in ifaces) {
  ifaces[dev].forEach(function(details){
    if( details.family=='IPv4' && details.internal === false) {
      ip_address = details.address;
    }
  });
}

function main() {
  // request the current printer status
  // http://<host>:<port>/api/state?apikey=API_KEY
  
  request( { url:'http://' + HOST + ':' + PORT + '/api/state?apikey=' + API_KEY, json:true }, function(err, res, data) {
    if( err ) { console.log('error1', err); finish(); return; }

    try {

      var lines;

      if( data.state.flags.printing ) {
        var filament = data.job.filament && data.job.filament.tool0.length ? data.job.filament.tool0.length : '---';
        lines = [
          data.job.file.name.replace(/\.gcode/,''),
          ( Math.round( data.progress.completion * 10 ) / 10 ) + '%  ' + getTime(data.progress.printTimeLeft),
          data.temperatures.bed.actual + 'C' + ' ' + data.temperatures.tool0.actual + 'C',
          Math.round( filament * ( 1 - ( data.progress.completion / 100 ) ) ) + 'mm   z' + parseFloat(data.currentZ)
        ];
      } else {
        lines = [
          'Zeppelin',
          ip_address,
          'z' + parseFloat(data.currentZ),
          data.temperatures.bed.actual + 'C    ' + data.temperatures.tool0.actual + 'C'
        ];
      }

      lcd.clearScreen();
      lcd.write(center(lines[0],20));
      lcd.write(center(lines[1],20));
      lcd.write(center(lines[2],20));
      lcd.write(center(lines[3],20));

    } catch( e ) {
      console.log( 'exception!', e );
    }

    finish();
  });
}

function rpad(str,len) {
  str += '';
  str = str + new Array(len + 1 - str.length).join(' ');
  return str.substr(0,len);
}

function center(str,len) {
  str += '';
  str = str.substr(0,len);
  var _str = new Array( Math.floor( ( len - str.length ) / 2 ) + 1 ).join(' ') + str;
  return _str + new Array( len - _str.length + 1 ).join(' ');
}

function getTime( totalSec, delim ) {
  delim = delim || ':';
  var hours = parseInt( totalSec / 3600 ) % 24,
      minutes = parseInt( totalSec / 60 ) % 60,
      seconds = parseInt(totalSec % 60, 10);

  return (hours < 10 ? '0' + hours : hours) + delim + (minutes < 10 ? '0' + minutes : minutes) + delim + (seconds  < 10 ? '0' + seconds : seconds);
}

function finish() {
  setTimeout( main, 1000 );
}

main();