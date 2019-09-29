# Sending Emails

The node-tcrouter package supports sending emails to multiple recipients.  Note that only basic text is supported for email body content.  Please note that the email feature must be setup through the web based management portal of the device before this functionality will work.

```javascript
const tcr = require(" @phoenixcontactusa/node-tcrouter");

var TCRouter = new tcr("192.168.1.1", 1432, 3000);

//Send an email
//to,subject,body,cc
TCRouter.sendEmail('john@doe.com','Test Email','Hello World','jane@doe.com')
  .then(res => {
    console.log(res);
  })
  .catch(e => {
    console.log(e);
  });
```

