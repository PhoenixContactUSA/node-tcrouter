---
description: >-
  Interacting with digital inputs, digital outputs and the GPRS unit of the
  device
---

# Control IO

### Control I/O

The following example shows how to control and monitor the TC Router IO. This functionality includes controlling the built in digital output, reading the digital inputs, and controlling the state of the GPRS module.

Use .getIO\(\) to return the instantaneous status of the two digital inputs, digital output, and the GPRS module state.

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
```

At the time of writing this document, all TC Router devices have one digital output which can be controlled with this package.  To control this output, the first parameter must be 1, to indicate the first digital output.  The second parameter specifies the intended new state of the output.

```javascript
//Turn the built in digital output on or off
//requires configuration from the web based management of the device
TCRouter.controlOutput(1, true)
  .then(() => {
    console.log("Turned the digital output to off");
    //Confirm the new state of the IO using getIO
    TCRouter.getIO().then((newState)=>{console.log(newState})
  })
  .catch(e => {
    console.log("Error controlling output", e);
  });
```

2G/3G GPRS can be controlled with the .controlGprs\(\) method.  

```javascript
//Turn 2G/3G GPRS on or off
TCRouter.controlGprs(false)
  .then(() => {
    console.log("Turned off gprs");
  })
  .catch(e => {
    console.log("Failed to turn off gprs");
  });
```

