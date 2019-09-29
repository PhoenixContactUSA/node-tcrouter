# Sending Text Messages



#### Send a Text Message

A valid phone number must be entered. This function will throw an error if an invalid number is entered

```javascript
const tcr = require(" @phoenixcontactusa/node-tcrouter");

var TCRouter = new tcr("192.168.1.1", 1432, 3000);

TCRouter.sendSMS("1234567890", "Hello world from node-tcrouter")
  .then(res => {
    console.log(res);
  })
  .catch(e => {
    console.log(e);
  });
```

