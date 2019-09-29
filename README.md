# Overview



## Node TC Router

[![Build Status](https://travis-ci.org/PhoenixContactUSA/node-tcrouter.svg?branch=master)](https://travis-ci.org/PhoenixContactUSA/node-tcrouter)

This Nodejs package enables communication with the Phoenix Contact TC Router. The TC Router is a 4G industrial router with built in firewall and networking services. This driver supports basic status information collection, controlling and reading IO, sending and receiving text messages, and sending emails.

### TC Router Hardware

The [Webpage](https://www.phoenixcontact.com/online/portal/us/?uri=pxc-oc-itemdetail:pid=2702528&library=usen&pcck=P-08-01-03-01&tab=1&selectedCategory=ALL) is the best place to find detailed technical specifications and documentation. The [Setup]() section contains the necessary information to configure the device in order to communicate with the TCRouter nodejs module.

![drawing](https://www.phoenixcontact.com/assets/images_pr/product_photos/large/78395_1000_int_04.jpg)

### Setup

In order to communicate with the TCRouter Nodejs module, the TC Router must be correctly configured. All of the features described in this documentation are provided by the 'Socket Server' feature of the TC Router.

### Examples

#### TCRouter Instantiation

Docs: [TCRouter](https://github.com/PhoenixContactUSA/node-tcrouter/tree/d8d2a587e17db5800492ec62ee00589935ff8d98/docs/tcrouter.md)

Description: The TCRouter class manages a single TC Router endpoint which can be initialized and then polled for status information. This class also contains the interfaces necessary to send/receive SMS as well as sending Emails.

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
var router = new TCRouter("192.168.0.1", 1432, 5000);
```

