var API_KEY = 'EA46CD0BE91443688281453930FB027D';
var HOST = 'localhost';
var PORT = '5000';

var serlcd = require('serlcd');
var request = require('request');
var lcd = new serlcd('/dev/ttyAMA0');
var is_printing = false;
var print_start;

main();

function main() {
  // request the current printer status
  // http://<host>:<port>/api/state?apikey=EA46CD0BE91443688281453930FB027D
  
  request( { url:'http://' + HOST + ':' + PORT + '/api/state?apikey=' + API_KEY, json:true }, function(err, res, data) {
    if( err ) { console.log('error1', err); finish(); return; }

    var lines;

    if( data.state.flags.printing ) {
      lines = [
        data.job.filename.replace(/\.gcode/,''),
        ( Math.round( data.progress.progress * 1000 ) / 10 ) + '%  ' + data.progress.printTimeLeft,
        data.progress.printTime + ' ' + data.temperatures.extruder.current + 'C',
        data.job.filament.split(' / ')[0] + ' z' + parseFloat(data.currentZ)
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

    finish();
  });
}

function rpad(str,len) {
  str += '';
  str = str + Array(len + 1 - str.length).join(' ');
  return str.substr(0,len);
}

function center(str,len) {
  str += '';
  str = str.substr(0,len);
  var _str = Array( Math.floor( ( len - str.length ) / 2 ) + 1 ).join(' ') + str;
  return _str + Array( len - _str.length + 1 ).join(' ');
}

function finish() {
  setTimeout( main, 1000 );
}
