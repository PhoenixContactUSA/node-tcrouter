# Status Information



#### Status Info

Execute getAllInfo\(\) to load initial device and status information. getMutableInfo should generally be used after the initial getAllInfo request so that only mutable data is requested

```javascript
const tcr = require("@phoenixcontactusa/node-tcrouter");

var TCRouter = new tcr("192.168.1.1", 1432, 3000);

//All info from the router
TCRouter.getAllInfo()
  .then(info => {
    console.log(info);
  })
  .catch(e => {
    console.log(e, e.stack);
  });

//Upate mutable status info from the TC Router
TCRouter.getMutableInfo()
  .then(info => {
    console.log(info);
  })
  .catch(e => {
    console.log(e, e.stack);
  });
```

