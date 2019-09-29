---
description: Control ipsec and openvpn tunnels remotely
---

# Control VPN

The node-tcrouter package can control the state of the TC Router's VPN connections.  These include IPSec and OpenVPN networking technologies.

```javascript
const tcr = require(" @phoenixcontactusa/node-tcrouter");

var TCRouter = new tcr("192.168.1.1", 1432, 3000);

//Send an email
//controlVPN(type,index,state)
//type: 1:ipsec,2:openvpn
//index: index of the desired VPN tunnel 
//state: boolean state to connect or disconnect the VPN
//Connect the first ipsec vpn tunnel which was configured
TCRouter.controlVPN(1,0,true)
  .then(res => {
    console.log(res);
  })
  .catch(e => {
    console.log(e);
  });
```



