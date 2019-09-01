# Node TC Router

This Nodejs package enables communication with the Phoenix Contact TC Router.  The TC Router is a 4G industrial router with built in firewall and networking services.  This driver supports basic status information collection, controlling and reading IO, sending and receiving text messages, and sending emails.


<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->
<!-- code_chunk_output -->

# Table of Contents

## Router Hardware
* [TC Router Overview](#tc-router-device)
* [Setup](#router-socket-setup)

## Code
* [Supporting Modules](#modules)
    * [Email](#email)
    * [SMS](#sms)
    * [TCPServer](#tcp-server)
    * [TC Router](#tc-router)

<!-- /code_chunk_output -->

## TC Router Hardware

The [Webpage](https://www.phoenixcontact.com/online/portal/us/?uri=pxc-oc-itemdetail:pid=2702528&library=usen&pcck=P-08-01-03-01&tab=1&selectedCategory=ALL) is the best place to find detailed technical specifications and documentation.  The [Setup](#router-socket-setup) section contains the necessary information to configure the device in order to communicate with the TCRouter nodejs module.

<img src="https://www.phoenixcontact.com/assets/images_pr/product_photos/large/78395_1000_int_04.jpg" alt="drawing" width="200"/>

## Setup

In order to communicate with the TCRouter Nodejs module, the TC Router must be correctly configured.  All of the features described in this documentation are provided by the 'Socket Server' feature of the TC Router.

# Code

## Supporting Modules

The following modules are supporting functions for the main application.  Find the full code documentation in the links

### Email

Docs:   [Email](./docs/email.md)

Description:  The Email javascript class stores the information necessary
to send emails.  The class constructor will cleanse the incoming information or throw associated errors if necessary.  

```javascript
//Email(to,subject,body,cc)
var email = new Email('zmink@phoenixcon.com','Test Subject','Test Body');

//if uncertain about the quality of the input, place inside try catch
try{
    var mail = new Email('abcd','test','test2');    //will throw an error with invalid email address
    let data = mail.getJSON();
    console.log(data.to);
}catch(e){
    console.log(e); //email address abcd is invalid
}

```

### SMS

Docs:   [SMS](./docs/sms.md)

Description:    The SMS javascript class cleans and maintains data necessary to send or receive SMS messages through the calling functions.  The SMS will format all phone numbers input into the expected format of the TC Router.  If the input is not valid, an error will be thrown

```javascript
//basic usage - SMS(phone number,message)
var sms = new SMS('7176026963','Hello World');

//if the input is unknown, use a try catch statement
try {
    let s = new SMS('abcd','Hello World');
    let data = s.getJSON();
    console.log(s.contactsArr); //will print all contacts if successful
}catch(e){
    console.log(e); //abcd is an invalid phone number
}

```

### TCPServer

Docs:   [TCPServer](./docs/TCPServer.md)

Description:    The TCPServer class can create both a TCP server and a TCP Client which can be used to send or receive any basic TCP communication.

```javascript

//The TCPServer takes a configuration object as input
var options: {
    server: {
        ip: '0.0.0.0', //expose port to all incoming traffic on localhost
        port: 1543      //port to listen on
    },
    client: {
        ip: '192.168.0.1',   //IP address target of the client
        port: 1432
    }
}
var tcpBroker = new TCPServer(options);
```

### TCRouter

Docs:   [TCRouter](./docs/tcrouter.md)

Description:    The TCRouter class manages a single TC Router endpoint which can be initialized and then polled for status information.  This class also contains the interfaces necessary to send/receive SMS as well as sending Emails.

```javascript
//TCRouter takes 3 arguments
//TCRouter(ip,remotePort,localPort)
//the remote port is the open port on the TC Router and localPort is the port for receiving data if necessary
var router = new TCRouter('192.168.0.1',1432,1432)
```