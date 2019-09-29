# TCRouter

## TCRouter

Manage the tc router device

**Kind**: global class

* [TCRouter](tcrouter.md#TCRouter)
  * [new TCRouter\(ip, port, timeout\)](tcrouter.md#new_TCRouter_new)
  * [.getMutableInfo\(\)](tcrouter.md#TCRouter+getMutableInfo)
  * [.sendSMS\(contacts, content\)](tcrouter.md#TCRouter+sendSMS)
  * [.checkForSmsRx\(\)](tcrouter.md#TCRouter+checkForSmsRx) ⇒ `Promise`
  * [.ackSmsRx\(\)](tcrouter.md#TCRouter+ackSmsRx) ⇒ `Promise`
  * [.controlOutput\(index, value\)](tcrouter.md#TCRouter+controlOutput)
  * [.controlDataConnection\(state\)](tcrouter.md#TCRouter+controlDataConnection)
  * [.controlVPN\(type, index, state\)](tcrouter.md#TCRouter+controlVPN)
  * [.getAllInfo\(\)](tcrouter.md#TCRouter+getAllInfo)

### new TCRouter\(ip, port, timeout\)

Manages socket api to TCRouter device

| Param | Type | Description |
| :--- | :--- | :--- |
| ip | `string` | IP Address of the TC Router |
| port | `number` | TCP Port number of TC Router socket server |
| timeout | `number` | Timeout in milliseconds for the tcp client |

### tcRouter.getMutableInfo\(\)

Request mutable status info from the router and return last known values of static values

**Kind**: instance method of [`TCRouter`](tcrouter.md#TCRouter)  
**Access**: public  


### tcRouter.sendSMS\(contacts, content\)

Send an SMS message to the TC Router

**Kind**: instance method of [`TCRouter`](tcrouter.md#TCRouter)  
**Access**: public

| Param | Type | Description |
| :--- | :--- | :--- |
| contacts | `Array` | - |
| content | `String` | message content |

### tcRouter.checkForSmsRx\(\) ⇒ `Promise`

Checks the TC router for an sms which has been received. Returns the contents of the sms. Should be acknowledged after receipt using the ackSmsRx function

**Kind**: instance method of [`TCRouter`](tcrouter.md#TCRouter)  
**Access**: public  


### tcRouter.ackSmsRx\(\) ⇒ `Promise`

Acknowledges the last received sms - TC Router then deletes this message from its history and is no longer accessible. Results of the message ack'd should be stored

**Kind**: instance method of [`TCRouter`](tcrouter.md#TCRouter)  
**Access**: public  


### tcRouter.controlOutput\(index, value\)

Control outputs on the Router

**Kind**: instance method of [`TCRouter`](tcrouter.md#TCRouter)  
**Access**: public

| Param | Type | Description |
| :--- | :--- | :--- |
| index | `integer` | Index of the output on the router which should be controlled |
| value | `bool` | False: turn output off, True: turn output on |

### tcRouter.controlDataConnection\(state\)

Control data connection if configured correctly on device web page

**Kind**: instance method of [`TCRouter`](tcrouter.md#TCRouter)  
**Access**: public

| Param | Type | Description |
| :--- | :--- | :--- |
| state | `bool` | turn connection on or off |

### tcRouter.controlVPN\(type, index, state\)

Start or stop VPN connections

**Kind**: instance method of [`TCRouter`](tcrouter.md#TCRouter)  
**Access**: public

| Param | Type | Description |
| :--- | :--- | :--- |
| type | `number` | 0:ipsec,1:openvpn |
| index | `number` | Index/Number/ID of the desired vpn tunnel |
| state | `boolean` | 0:turn off,1:turn on |

### tcRouter.getAllInfo\(\)

Build, send, update, and return all device 'info'

**Kind**: instance method of [`TCRouter`](tcrouter.md#TCRouter)  
**Access**: public

