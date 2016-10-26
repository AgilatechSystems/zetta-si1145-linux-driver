##Zetta si1145 IR/Visible/UV light sensor driver for Linux

This driver should work on any Linux platform, and has been thouroghly tested on BeagleBone Black

###Install
```
$> npm install @agilatech/zetta-si1145-linux-driver
```
OR
```
$> git clone https://github.com/Agilatech/zetta-si1145-linux-driver zetta-si1145-linux-driver
```
###Usage

```
var zetta = require('zetta');
var si1145 = require('@agilatech/zetta-si1145-linux-driver');

zetta()
.use(si1145, [options])  // where [options] define operational paramters -- omit to accept defaults
.listen(<port number>)   // where <port number> is the port on which the zetta server should listen
```

####[options]
These options are defined in a file named 'options.json' which may be overridden by program definitions

```
"bus":"<i2c bus device>"
/dev/i2c-0, /dev/i2c-1, /dev/i2c-2, etc...  Defaults to /dev/i2c-1

"chronPeriod":<period>
Period in milliseconds for monitored isochronal data

"streamPeriod":<period>
Period in milliseconds for streaming data. A value of 0 disables streaming.
```

####&lt;port number&gt;
Agilatech has definied the open port number 1107 as its standard default for IIOT (Industrial Internet 
Of Things) server application. In practice, most any port above 1024 may be used by other organizations.

###Example
Using directly in the zetta server:
```
const zetta = require('zetta');
const light_sensor = require('@agilatech/zetta-si1145-linux-driver');
zetta().use(light_sensor).listen(1337);
```
Initializes the si1145 driver on i2c bus /dev/i2c-1 with a data monitoring period of 60 seconds and streaming data every second

To override the options defined in the options.json file, supply them in an object in the use statement like this:
```
zetta().use(light_sensor, { "bus":"/dev/i2c-1", "chronPeriod":30000, "streamPeriod":15000 });
```
Overrides the defaults to initialize the bus on **/dev/i2c-1** with a data monitoring period of **30 seconds** and streaming data every **1.5 seconds**

###Properties
All drivers contain the following 5 core properties:
1. **state** : the current state of the device, containing either the value *chron-on* or *chron-off* 
to indicate whether the device is monitoring data isochronally (a predefinied uniform time period of device data query).
2. **active** : a boolean value indicating whether of not the underlying hardware is operational and active.
3. **id** : the unique id for this device.  This device id is used to subscribe to this device streams.
4. **name** : the given name for this device.
5. **type** : the given type for this device, usually containing the category of either *Sensor* or *Actuator*.

####Monitored Properties
In the *chron-on* state and *active* operation, the driver software for this device monitors three values in isochronal 
fashion with a period defined by *chronPeriod*:
1. **ir** - infrared light
2. **visible** - visible light
3. **uv** - ultraviolet exposure index

####Streaming Properties
If the hardware is *active*, the driver software continuously streams three values with a frequency defined by 
*streamPeriod*. Note that a *streamPeriod* of 0 disables streaming.
1. **irStream**
2. **visibleStream**
3. **uvStream**

###State
**chron-off** is the beginning state.  The driver also enters this state after a transition '*stop-isochronal*' command.  
In this state, all monitored data values are set to 0, and no sensor readings are updated.

**chron-on** is the state after a transition '*start-isochronal*' command.  In this state, all monitored data values are 
updated every time period as specified by '*chronPeriod*'.

###Transitions
1. **start-isochronal** : Sets the device state to *chron-on* and begins the periodic collection of sensor data. 
Property values are monitored, with a period defined by the 'chronPeriod' option (defaults to 60 sec).
2. **stop-isochronal** : Sets the device state to *chron-off* and stops data collection for the monitored values.

###Design

This device driver is designed for both streaming and periodic monitored data collection from the Silicon Labs SI1145 sensor.

The driver software does not include any functionality for proximity sensing.  This feature may be enabled in a future release, 
but don't count on it. The main purpose of this addon is for simple light sensing.

The UV Index provided by the SI1145 sensor is not based on direct UV measurement, but is calculated by the linear releationship 
of combined IR and Visible sunlight and is weighted according to the CIE Erythemal Action Spectrum.  The resulting UV index 
is the standardized World Health Organization simplified consumer UV exposure level ranging from 1 to 11.

In any case, this sensor is uncalibrated, so none of the returned values should be considered accurate. The values returned are 
in the right ballpark within a 15-20% tolerance.

### Hardware

* Beaglebone Black
* Beaglebone Green
* Should also work on Raspberry Pi as well as other Linux SBC

###Copyright
Copyright © 2016 Agilatech. All Rights Reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation 
files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, 
modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the 
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE 
WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR 
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, 
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.