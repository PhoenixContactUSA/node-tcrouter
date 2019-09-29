# Welcome

## Node TC Router

This Nodejs package enables communication with the Phoenix Contact TC Router. The TC Router is a 4G industrial router with built in firewall and networking services. This driver supports basic status information collection, controlling and reading IO, sending and receiving text messages, and sending emails.

```bash
npm i --save @phoenixcontactusa/node-tcrouter
```

Before being able to communicate with a TC Router device, you'll need to set up the "socket server" feature of the device.  More information on this can be found in [hardware setup](setup/device-setup.md).

The TCRouter class constructor accepts 3 arguments

```javascript
//TCRouter(ip,remotePort,timeout)
//ip - ip address of the TC Router
//remotePort - open port on the TC Router (1432 by default)
//timeout - timeout in millseconds before closing client connection
var router = new TCRouter("192.168.0.1", 1432, 5000);
```

