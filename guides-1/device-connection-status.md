# Device Connection Status

#### Test Device Connection

The example below shows how to implement a fast connection check to the TC Router device. This enables the IP and Port addresses to be tested before calling further functionality.

```javascript
const tcr = require(" @phoenixcontactusa/node-tcrouter");

var TCRouter = new tcr("192.168.1.1", 1432, 3000);

//Quickly test that the TC Router is available at the supplied ip address
//and port
TCRouter.testConnection()
  .then(info => {
    console.log(info);
  })
  .catch(e => {
    console.log(e);
  });
```

