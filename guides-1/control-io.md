# Control IO

#### Control I/O

The following example shows how to control and monitor the TC Router IO. This functionality includes controlling the built in digital output, reading the digital inputs, and controlling the state of the GPRS module

```javascript
const tcr = require(" @phoenixcontactusa/node-tcrouter");

var TCRouter = new tcr("192.168.1.1", 1432, 3000);

//Get the current values of the TC Router IO
TCRouter.getIO()
  .then(res => {
    console.log(res);
  })
  .catch(e => {
    console.log(e);
  });

//Turn the built in digital output on or off
//requires configuration from the web based management of the device
TCRouter.controlOutput(1, true)
  .then(() => {
    console.log("Turned the digital output to off");
  })
  .catch(e => {
    console.log("Error controlling output", e);
  });

//Turn 2G/3G GPRS on or off
TCRouter.controlGprs(false)
  .then(() => {
    console.log("Turned off gprs");
  })
  .catch(e => {
    console.log("Failed to turn off gprs");
  });
```

