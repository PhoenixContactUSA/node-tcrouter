# Status Information

### All Status Information

Execute getAllInfo\(\) to load all available device and status information.

```javascript
const tcr = require("@phoenixcontactusa/node-tcrouter");

var TCRouter = new tcr("192.168.1.1", 1432, 3000);

//All info from the router
TCRouter.getAllInfo()
  .then(info => {
    console.log(info);
  })
  //Catch networking or process errors
  .catch(e => {
    console.log(e, e.stack);
  });
```

### Mutable Information

getMutableInfo should be used after the initial getAllInfo request so that only mutable data is requested.

```javascript
//Upate mutable status info from the TC Router
TCRouter.getMutableInfo()
  .then(info => {
    console.log(info);
  })
  .catch(e => {
    console.log(e, e.stack);
  });
```

