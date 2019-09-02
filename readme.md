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

# Code

## TCRouter

Docs:   [TCRouter](./docs/tcrouter.md)

Description:    The TCRouter class manages a single TC Router endpoint which can be initialized and then polled for status information.  This class also contains the interfaces necessary to send/receive SMS as well as sending Emails.

```javascript
//TCRouter takes 3 arguments
//TCRouter(ip,remotePort,timeout)
//ip - ip address of the TC Router
//remotePort - open port on the TC Router (1432 by default)
//timeout - timeout in millseconds before closing client connection
var router = new TCRouter('192.168.0.1',1432,5000)
```

### Status Info

```javascript
const tcr = require('../index.js');

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

```javascript
const tcr = require('../index.js');

var TCRouter = new tcr('192.168.1.1',1432,3000);

TCRouter.sendSMS('7176026963','Hello world from node-tcrouter')
.then((res)=>{
    console.log(res);
}).catch((e)=>{
    console.log(e);
})

```
