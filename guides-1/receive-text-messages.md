# Receive Text Messages

#### Check for an incoming text message

To monitor incoming text messages, the node module pings the TC Router. If the device has received a new message, checkForSmsRX\(\) will retrieve this message. Upon receipt of the message, an acknowledgement must be sent to clear the message from the TC Router memory.

```javascript
const tcr = require("@phoenixcontactusa/node-tcrouter");

var TCRouter = new tcr("192.168.1.1", 1432, 3000);

TCRouter.checkForSmsRx()
  .then(res => {
    if (res.success === true) {
      console.log(res);
      TCRouter.ackSmsRx()
        .then(res => {
          console.log("message deleted");
        })
        .catch(e => {
          console.log(e);
        });
    } else {
      console.log("No new messages");
    }
  })
  .catch(e => {
    console.log(e);
  });
```

