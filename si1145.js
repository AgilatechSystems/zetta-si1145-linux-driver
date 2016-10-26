/*
Copyright © 2016 Agilatech. All Rights Reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy 
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is 
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

const device = require('zetta-device');
const sensor = require('@agilatech/si1145');
const util = require('util');

var si1145 = module.exports = function(options) {
  device.call(this);

  this.options = options || {};
  this.i2cbus  = this.options['bus'] || "/dev/i2c-1";
  this.chronPeriod  = this.options['chronPeriod']  || 60000; //milliseconds
  this.streamPeriod = this.options['streamPeriod'] || 10000;
  
  this.addr    = 0x60;

  this.ir            = 0;
  this.irStream      = 0;
  this.visible       = 0;
  this.visibleStream = 0;
  this.uv            = 0;
  this.uvStream      = 0;
  this._chronInterval  = null;
  this._streamIr       = null;
  this._streamVis      = null;
  this._streamUv       = null;

  this.si1145_sensor = new sensor.Si1145(this.i2cbus, this.addr);
};

util.inherits(si1145, device);

si1145.prototype.init = function(config) {

  config
        .type('SI1145_Sensor')
        .state('chron-off')
        .when('chron-off', {allow: ['start-isochronal']})
        .when('chron-on', {allow: ['stop-isochronal']})
        .stream('irStream', this.streamIr)
        .stream('visibleStream', this.streamVisible)
        .stream('uvStream', this.streamUv)
        .monitor('ir')
        .monitor('visible')
        .monitor('uv')
        .map('stop-isochronal', this.stopIsochronal)
        .map('start-isochronal', this.startIsochronal)
        .name(this.si1145_sensor.deviceName())
        .remoteFetch(function() {
            return {
                active: this.si1145_sensor.deviceActive(),
                ir: this.ir,
                visible: this.visible,
                uv: this.uv
            };
        });
};

si1145.prototype.startIsochronal = function(callback) {
    this.state = 'chron-on';
    
    // load values right away before the timer starts
    this.ir = this.readIr();
    this.visible = this.readVisible();
    this.uv = this.readUv();
    
    var self = this;
    
    this._chronInterval = setInterval(function() {
      self.ir = self.readIr();
      self.visible = self.readVisible();
      self.uv = self.readUv();
    }, this.chronPeriod);
    
    callback();
}

si1145.prototype.stopIsochronal = function(callback) {
    this.state = 'chron-off';

    this.ir = 0;
    this.visible = 0;
    this.uv = 0;

    clearTimeout(this._chronInterval);
    callback();
};

si1145.prototype.streamIr = function(stream) {
    // a stream period of 0 disables streaming
    if (this.streamPeriod <= 0) { 
      stream.write(0);
      return;
    }

    var self = this;
    this._streamIr = setInterval(function() {
        stream.write(self.readIr());
    }, this.streamPeriod);
};

si1145.prototype.streamVisible = function(stream) {
    // a stream period of 0 disables streaming
    if (this.streamPeriod <= 0) {
        stream.write(0);
        return;
    }
    
    var self = this;
    this._streamVis = setInterval(function() {
        stream.write(self.readVisible());
    }, this.streamPeriod);
};

si1145.prototype.streamUv = function(stream) {
    // a stream period of 0 disables streaming
    if (this.streamPeriod <= 0) {
        stream.write(0);
        return;
    }
    
    var self = this;
    this._streamUv = setInterval(function() {
        stream.write(self.readUv());
    }, this.streamPeriod);
};

si1145.prototype.readIr = function() {
    
    if (this.si1145_sensor.deviceActive()) {
      return this.si1145_sensor.valueAtIndexSync(0);
    }
};

si1145.prototype.readVisible = function() {
    
    if (this.si1145_sensor.deviceActive()) {
        return this.si1145_sensor.valueAtIndexSync(1);
    }
};

si1145.prototype.readUv = function() {
    
    if (this.si1145_sensor.deviceActive()) {
        return this.si1145_sensor.valueAtIndexSync(2);
    }
};



