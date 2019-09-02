# Node TC Router

This Nodejs package enables communication with the Phoenix Contact TC Router.  The TC Router is a 4G industrial router with built in firewall and networking services.  This driver supports basic status information collection, controlling and reading IO, sending and receiving text messages, and sending emails.


<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->
<!-- code_chunk_output -->

# Table of Contents

## Router Hardware
* [TC Router Overview](#tc-router-device)
* [Setup](#router-socket-setup)

## Module
* [TCRouter](##TCRouter)


<!-- /code_chunk_output -->

## TC Router Hardware

The [Webpage](https://www.phoenixcontact.com/online/portal/us/?uri=pxc-oc-itemdetail:pid=2702528&library=usen&pcck=P-08-01-03-01&tab=1&selectedCategory=ALL) is the best place to find detailed technical specifications and documentation.  The [Setup](#router-socket-setup) section contains the necessary information to configure the device in order to communicate with the TCRouter nodejs module.

<img src="https://www.phoenixcontact.com/assets/images_pr/product_photos/large/78395_1000_int_04.jpg" alt="drawing" width="200"/>

## Setup

In order to communicate with the TCRouter Nodejs module, the TC Router must be correctly configured.  All of the features described in this documentation are provided by the 'Socket Server' feature of the TC Router.

## Examples

### TCRouter Instantiation

Docs:   [TCRouter](./docs/tcrouter.md)

Description:    The TCRouter class manages a single TC Router endpoint which can be initialized and then polled for status information.  This class also contains the interfaces necessary to send/receive SMS as well as sending Emails.

First, install the package

```bash
npm i --save @phoenixcontactusa/node-tcrouter
```

```javascript
//TCRouter takes 3 arguments
//TCRouter(ip,remotePort,timeout)
//ip - ip address of the TC Router
//remotePort - open port on the TC Router (1432 by default)
//timeout - timeout in millseconds before closing client connection
var router = new TCRouter('192.168.0.1',1432,5000)
```

### Status Info

Execute getAllInfo() to load initial device and status information.  getMutableInfo should generally be used after the initial getAllInfo request so that only mutable data is requested

```javascript
const tcr = require('@phoenixcontactusa/node-tcrouter');

var TCRouter = new tcr('192.168.1.1',1432,3000);

//All info from the router
TCRouter.getAllInfo().then((info)=>{
    console.log(info);
}).catch((e)=>{
    console.log(e,e.stack)
})

//Upate mutable status info from the TC Router
TCRouter.getMutableInfo().then((info)=>{
    console.log(info);
}).catch((e)=>{
    console.log(e,e.stack)
})

```


### Send a Text Message

A valid phone number must be entered.  This function will throw an error if an invalid number is entered

```javascript
const tcr = require(' @phoenixcontactusa/node-tcrouter');

var TCRouter = new tcr('192.168.1.1',1432,3000);

TCRouter.sendSMS('1234567890','Hello world from node-tcrouter')
.then((res)=>{
    console.log(res);
}).catch((e)=>{
    console.log(e);
})

```

### Test Device Connection

The example below shows how to implement a fast connection check to the TC Router device.  This enables the IP and Port addresses to be tested before calling further functionality.

```javascript
const tcr = require(' @phoenixcontactusa/node-tcrouter');

var TCRouter = new tcr('192.168.1.1',1432,3000);

//Quickly test that the TC Router is available at the supplied ip address
//and port
TCRouter.testConnection().then((info)=>{
    console.log(info);
}).catch((e)=>{
    console.log(e)
})


```

### Check for an incoming text message

To monitor incoming text messages, the node module pings the TC Router.  If the device has received a new message, checkForSmsRX() will retrieve this message.  Upon receipt of the message, an acknowledgement must be sent to clear the message from the TC Router memory.

```javascript
const tcr = require('@phoenixcontactusa/node-tcrouter');

var TCRouter = new tcr('192.168.1.1',1432,3000);

TCRouter.checkForSmsRx().then((res)=>{
    if (res.success === true){
        console.log(res);
        TCRouter.ackSmsRx().then((res)=>{
            console.log('message deleted');
        }).catch((e)=>{
            console.log(e);
        })
    }else{
        console.log('No new messages');
    }
    }).catch((e)=>{
    console.log(e);
})

```

### Control I/O

The following example shows how to control and monitor the TC Router IO.  This functionality includes controlling the built in digital output, reading the digital inputs, and controlling the state of the GPRS module

```javascript

const tcr = require(' @phoenixcontactusa/node-tcrouter');

var TCRouter = new tcr('192.168.1.1',1432,3000);

//Get the current values of the TC Router IO
TCRouter.getIO().then((res)=>{
   console.log(res);
}).catch((e)=>{
    console.log(e);
})

//Turn the built in digital output on or off
//requires configuration from the web based management of the device
TCRouter.controlOutput(1,true).then(()=>{
    console.log('Turned the digital output to off')
}).catch((e)=>{
    console.log('Error controlling output',e);
})

//Turn 2G/3G GPRS on or off
TCRouter.controlGprs(false).then(()=>{
    console.log('Turned off gprs')
}).catch((e)=>{
    console.log('Failed to turn off gprs')
})

```

### Control VPN

```javascript


```