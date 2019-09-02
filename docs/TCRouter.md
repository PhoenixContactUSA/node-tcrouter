<a name="TCRouter"></a>

## TCRouter
Manage the tc router device

**Kind**: global class  

* [TCRouter](#TCRouter)
    * [new TCRouter(ip, port, timeout)](#new_TCRouter_new)
    * [.getMutableInfo()](#TCRouter+getMutableInfo)
    * [.sendSMS(contacts, content)](#TCRouter+sendSMS)
    * [.checkForSmsRx()](#TCRouter+checkForSmsRx) ⇒ <code>Promise</code>
    * [.ackSmsRx()](#TCRouter+ackSmsRx) ⇒ <code>Promise</code>
    * [.controlOutput(index, value)](#TCRouter+controlOutput)
    * [.controlDataConnection(state)](#TCRouter+controlDataConnection)
    * [.controlVPN(type, index, state)](#TCRouter+controlVPN)
    * [.getAllInfo()](#TCRouter+getAllInfo)

<a name="new_TCRouter_new"></a>

### new TCRouter(ip, port, timeout)
Manages socket api to TCRouter device


| Param | Type | Description |
| --- | --- | --- |
| ip | <code>string</code> | IP Address of the TC Router |
| port | <code>number</code> | TCP Port number of TC Router socket server |
| timeout | <code>number</code> | Timeout in milliseconds for the tcp client |

<a name="TCRouter+getMutableInfo"></a>

### tcRouter.getMutableInfo()
Request mutable status info from the router and return last known valuesof static values

**Kind**: instance method of [<code>TCRouter</code>](#TCRouter)  
**Access**: public  
<a name="TCRouter+sendSMS"></a>

### tcRouter.sendSMS(contacts, content)
Send an SMS message to the TC Router

**Kind**: instance method of [<code>TCRouter</code>](#TCRouter)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| contacts | <code>Array</code> | - |
| content | <code>String</code> | message content |

<a name="TCRouter+checkForSmsRx"></a>

### tcRouter.checkForSmsRx() ⇒ <code>Promise</code>
Checks the TC router for an sms which has been received.  Returns thecontents of the sms.  Should be acknowledged after receipt using the ackSmsRx function

**Kind**: instance method of [<code>TCRouter</code>](#TCRouter)  
**Access**: public  
<a name="TCRouter+ackSmsRx"></a>

### tcRouter.ackSmsRx() ⇒ <code>Promise</code>
Acknowledges the last received sms - TC Router then deletes this messagefrom its history and is no longer accessible.  Results of the message ack'd should be stored

**Kind**: instance method of [<code>TCRouter</code>](#TCRouter)  
**Access**: public  
<a name="TCRouter+controlOutput"></a>

### tcRouter.controlOutput(index, value)
Control outputs on the Router

**Kind**: instance method of [<code>TCRouter</code>](#TCRouter)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| index | <code>integer</code> | Index of the output on the router which should be controlled |
| value | <code>bool</code> | False: turn output off, True: turn output on |

<a name="TCRouter+controlDataConnection"></a>

### tcRouter.controlDataConnection(state)
Control data connection if configured correctly on device web page

**Kind**: instance method of [<code>TCRouter</code>](#TCRouter)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>bool</code> | turn connection on or off |

<a name="TCRouter+controlVPN"></a>

### tcRouter.controlVPN(type, index, state)
Start or stop VPN connections

**Kind**: instance method of [<code>TCRouter</code>](#TCRouter)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>number</code> | 0:ipsec,1:openvpn |
| index | <code>number</code> | Index/Number/ID of the desired vpn tunnel |
| state | <code>boolean</code> | 0:turn off,1:turn on |

<a name="TCRouter+getAllInfo"></a>

### tcRouter.getAllInfo()
Build, send, update, and return all device 'info'

**Kind**: instance method of [<code>TCRouter</code>](#TCRouter)  
**Access**: public  
