/*jshint  unused:false, bitwise:false */
/*global  console */

var API_KEY = 'EA46CD0BE91443688281453930FB027D',
    HOST = 'localhost',
    PORT = '5000';

var serlcd = require('serlcd'),
    request = require('request'),
    lcd = new serlcd('/dev/ttyAMA0'),
    main, rpad, center, finish;

function main() {
  // request the current printer status
  // http://<host>:<port>/api/state?apikey=API_KEY
  
  request( { url:'http://' + HOST + ':' + PORT + '/api/state?apikey=' + API_KEY, json:true }, function(err, res, data) {
    if( err ) { console.log('error1', err); finish(); return; }

    try {

      var lines;

      if( data.state.flags.printing ) {
        var filament = data.job.filament ? data.job.filament.split(' / ')[0] : '---';
        lines = [
          data.job.filename.replace(/\.gcode/,''),
          ( Math.round( data.progress.progress * 1000 ) / 10 ) + '%  ' + data.progress.printTimeLeft,
          data.progress.printTime + ' ' + data.temperatures.extruder.current + 'C',
          filament + ' z' + parseFloat(data.currentZ)
        ];
      } else {
        lines = [
          'Printrbot Simple',
          'Idle',
          '',
          data.temperatures.extruder.current + 'C   z' + parseFloat(data.currentZ)
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

function finish() {
  setTimeout( main, 1000 );
}

main();