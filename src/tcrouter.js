
var validateIP      = require('validate-ip-node');
var xml2js          = require('xml2js');
var parseString     = xml2js.parseString;
var xmlBuilder      = new xml2js.Builder({xmldec:{}});
const EventEmitter  = require('events');
const TCPServer     = require('../src/tcp-server.js');
const Email         = require('../src/email.js');
const SMS           = require('../src/sms.js');

/**Manage the tc router device
* @description Manages socket api to TCRouter device
*/
class TCRouter extends EventEmitter {
    /** 
    * @param {string} ip - IP Address of the TC Router
    * @param {number} port - TCP Port number of TC Router socket server
    * @param {number} pollRate - Rate at which data is updated from the TC Router endpoint
    */
    constructor(ip, port,localPort){
        super(ip,port,localPort);
        const that = this;
        //validate IP Address
        var IP;
        if (!ip){
            this.emit('error',new Error('Undefined TC Router IP Address'));
        }else{
            if (!validateIP(ip)){
                this.emit('error',new Error('Invalid TC Router IP Address'));
            }else{
                IP = ip;
            }
        }
        

        //validate TCP port
        var Port = 1432;
        if (port !== undefined){
            if (isNaN(port)){
                this.emit('error',new Error('Invalid TC Router port number'));
            }
            if (port === 80){
                this.emit('error',new Error('Invalid TC Router port number.  Port 80 cannot be used'));
            }
        }else{
            this.emit('error',new Error('Undefined TC Router port number'));
        }

        //Configuration parameters of the socket server
        this.socket = {
            enabled:        {value:true,type:Boolean},
            status:         {value:'Disconnected',type:String},
            ip:             {value: IP,type:String},
            port:           {value: Port,type:String},
            newlineChar:    {value: 'LF',type:String},       //LF, CR, CR+LF
            booleanVals:    {value: 'Verbose',type:String},
            connected:      {value: false,type:Boolean}
        }

        //Manages VPN connections - only updated after using VPN action method
        this.vpn = {
            ipsec: new Array(10),
            openvpn: new Array(10)
        }

        //configure the tcp server
        var lPort = 1432;
        if (localPort){
            lPort = localPort
        }
        let options = {
            // server: {
            //     ip: '0.0.0.0',
            //     port: lPort
            // },
            client: {
                ip: this.socket.ip,
                port: this.socket.port
            }
        }
        
        this._Server = new TCPServer(options);
        
        this._Server.on('error',(e)=>{
            this.emit('error', 'TCP Error: ' + e);
        });

        this._Server.on('client-data',(data)=>{
            this._parseXML_RxType(data);
         });

        this._Server.on('client-connected',()=>{
            this.socket.connected = true;
            this.socket.status = "Connected";
        })

        //this._Server.startServer();

        //two inputs and one output
        this.io = {
            input: [
                {
                    value: false,
                    type:  Boolean
                },
                {
                    value: false,
                    type:  Boolean
                }
            ],
            output: [
                {
                    value: false,
                    type:  Boolean
                }
            ],
            gprs:  {
                value: false,
                type:  Boolean
            }, //switch on data connection
        }

        //status information from the device
        this.info = {
            device: {
                serialno:   {value:'',type: String},  //device serial numberd
                hardware:   {value:'',type: String},  //hardware rev
                firmware:   {value:'',type: String},  //firmware rev
                wbm:        {value:'',type: String},  //web based management rev
                imei:       {value:'',type: String}   //imei of the device
            },
            radio: {
                provider:   {value:'',type: String},  //cellular provider
                rssi:       {value:0, type: Number},  //cell signal strength in integer format
                rssiDBM:    {get value(){             //cell signal strength in dBm
                    return TCRouter._rssiDecode(that.info.radio.rssi.value);
                            },type:Number},
                creg:       {value:0, type: Number},
                cregString: {get value(){
                    return TCRouter._cregToString(that.info.radio.creg.value);
                            },type: String},
                lac:        {value:'',type: String},
                ci:         {value:'',type: String},
                packet:     {value:0, type: Number},
                packetString:{get value(){
                    return TCRouter._infoPacketToString(that.radio.packet.value);
                            },type:String},
                simstatus:  {value:0, type: Number},
                simstatusString: {get value(){
                    return TCRouter._simStatusToString(that.radio.simstatus.value)
                            },type:String},
                simselect:  {value:0, type: Number},
            },
            //internet connection information
            inet: {
                ip:         {value:'',type: String},
                rx_bytes:   {value:0, type: Number},
                tx_bytes:   {value:0, type: Number},
                mtu:        {value:0, type: Number}
            },
            //io - 
            io: {
                gsm:    {value:0,type: Number},
                inet:   {value:0,type: Number},
                vpn:    {value:0,type: Number}
            }
        }



        this._pollingFunc = 0;  //holds a reference to the active polling function

        //bind this to follow self
        this.pollRouter                 = this.pollRouter.bind(this);
        this.sendSMS                    = this.sendSMS.bind(this);
        this.controlVPN                 = this.controlVPN.bind(this);
        this.getAllInfo                 = this.getAllInfo.bind(this);
        this.poll                       = this.poll.bind(this);
        this.controlDataConnection      = this.controlDataConnection.bind(this);
        this.controlOutput              = this.controlOutput.bind(this);
        this._acknowledgeSMS            = this._acknowledgeSMS.bind(this);
        this._buildEmailXML             = this._buildEmailXML.bind(this);
        this._buildSMS_XML              = this._buildSMS_XML.bind(this);
        this._checkRouterForSMS         = this._checkRouterForSMS.bind(this);
        this._parseAckSMS_Rx            = this._parseAckSMS_Rx.bind(this);
        this._parseIOResponse           = this._parseIOResponse.bind(this);
        this._parseInfoResponse         = this._parseInfoResponse.bind(this);
        this._parseReceivedSMS          = this._parseReceivedSMS.bind(this);
        this._parseSentEmailResponse    = this._parseSentEmailResponse.bind(this);
        this._parseSentSMS_Response     = this._parseSentSMS_Response.bind(this);
        this._parseVPN_ActionRx         = this._parseVPN_ActionRx.bind(this);
        this._parseXML_RxType           = this._parseXML_RxType.bind(this);
        this._getRouterData             = this._getRouterData.bind(this);

        //initialize data
        this.getAllInfo = this.getAllInfo.bind(this);

        this._checkRouterForSMS();
    }

    /**
     * @private
     * @description Returns TC Router data object
     */

    _getRouterData(){
        return {
            socket: this.socket,
            info:   this.info,
            io:     this.io
        }
    }


    /**
    * @private
    * @description Poll the TC Router for mutable data.  Executes all methods which should be updated
    */
    poll(){
        this.getAllInfo();
    }

    /**
     * @private
     * @description Polls the TC Router to check for received SMS messages.  On an error,
     * must close the client
     * 
     */
    _checkRouterForSMS(){
        setInterval(()=>{
            var infoReq =
            this._xmlHeader('<cmgr/>');
            this._Server.sendData(infoReq,true);
        },5000);
    }

    /**
    * @private
    * @description Adds content to xml header
    * @param {string} content - XML content to append to header
    * @param {bool} encoding - Should header encoding param be set?
    */
    _xmlHeader(content,encoding){
        if (encoding === true){
            return '<?xml version="1.0" encoding="UTF-8"?>' + content
        }else{
            return '<?xml version="1.0"?>' + content
        }
        
    }

    /**
     * @private
     * @description Parses incoming XML message and sends to proper parsing function
     * @param {string} message 
     */
    _parseXML_RxType(message){
        this.parseXML(message, (data)=>{

            //walk the object and update the info param
            if (!data.result){
                this.emit('error',new Error('TCRouter: parsed info data contains no <result> field',data))
            }else{
                //io response - inputs, outputs, gprs
                if (data.result.io){
                    this._parseIOResponse(message);
                }//info response - device,radio,inet,io
                else if (data.result.info){
                    this._parseInfoResponse(message,()=>{this._Server.closeClient()});
                }//Sent SMS response
                else if (data.result.cmgs){
                    this._parseSentSMS_Response(message);
                }//Received SMS
                else if (data.result.cmgr){
                    this._parseReceivedSMS(message,()=>{this._Server.closeClient();this._acknowledgeSMS()},()=>{this._Server.closeClient();});
                }//SMS cleared from memory
                else if (data.result.cmga){
                    this._parseAckSMS_Rx(message,()=>{this._Server.closeClient();});
                }//Send Email response
                else if (data.result.email){
                    this._parseSentEmailResponse(message);
                }//VPN configuration response
                else if (data.result.vpn){
                    this._parseVPN_ActionRx(message,()=>{this._Server.closeClient()});
                }else{
                    this.emit('error',new Error('TCRouter: unknown response field',data))
                }
            }

        })
    }

    /**
    * @private
    * @description Parse the returned XML data and update the local props
    * @param {string} xml - returned XML data
    * @callback function which wants updated io data
    */
    _parseInfoResponse(xml,cb){

        this.parseXML(xml, (data)=>{

            //walk the object and update the info param
            if (!data.result){
                this.emit('error',new Error('TCRouter: parsed info data contains no <result> field',data))
            }else{
                if (!data.result.info){
                    this.emit('error', new Error('TCRouter: parsed info data doesnt contain <info> field'));
                }else{
                    //walk the response object and update this.info
                    let info = data.result.info[0];
                    //loop through the categories
                    for (var child in info){
                        var key = child;
                        var children = info[child][0];  //json object with all the properties
                        //loop through the properties of the category
                        //and collect the value
                        for (var prop in children){
                            let value = children[prop][0];
                            this.info[key][prop].value = this.info[key][prop].type(value);
                        }

                    }

                    this.emit('router-info',this.info);
                    this.emit('router-data',this._getRouterData())
                    if (cb) {
                        cb(this.info);
                    }
                }
            }

        })

       
    }

    /**
     * @private
     * @description Parses response from router after vpn start/stop command
     * @param {string} xml XML Data containing VPN message
     * @callback 
     */
    _parseVPN_ActionRx(xml,cb){

        this.parseXML(xml, (data)=>{

            //walk the object and update the info param
            if (!data.result){
                this.emit('error',new Error('TCRouter: parsed info data contains no <result> field',data))
            }else{
                if (!data.result.vpn){
                    this.emit('error', new Error('TCRouter: parsed info data doesnt contain <vpn> field'));
                }else{
                    //walk the response object and update this.io
                    let elements = data.result.vpn[0];
                    for (var child in elements){
                        var key = child;
                        if (key === "ipsec"){
                            let index = parseInt(elements[child]['$']['no']);
                            this.vpn.ipsec[index].value = (elements[child]['$']['value'] === "on") ? true : false
                        }else if (key === "openvpn"){
                            let index = parseInt(elements[child]['$']['no']);
                            this.vpn.openvpn[index].value = (elements[child]['$']['value'] === "on") ? true : false
                        }else{
                            this.emit('error', new Error('TCRouter: Unexpected field in vpn message'))
                        }

                    }
                    

                    this.emit('router-vpn-action',this.vpn);
                    if (cb) {
                        cb(this.io);
                    }
                }
            }
    
        })

    }

    /**
     * @private
     * @description Detects if email was sent successfully
     * @param {string} xml - XML response from router
     * @callback successCallback - Executed when result is success
     * @callback failCallback - Executed when result is failure
     */
    _parseSentEmailResponse(xml,successCallback,failCallback){
        
        this.parseXML(xml, (data)=>{

            //walk the object and update the info param
            if (!data.result){
                this.emit('error',new Error('TCRouter: parsed info data contains no <result> field',data))
            }else{
                if (!data.result.email){
                    this.emit('error', new Error('TCRouter: parsed info data doesnt contain <email> field: ' + JSON.stringify(data.result)));
                }else{
                    //walk the response object and u
                    let o = data.result.email[0];
                    let message = o['_'];
                    var res
                    var error
                    if (o['$']){
                        error = o['$']['error']
                    }
                    if (error){
                        res = {
                            success: false,
                            message: message
                        };
                        if (failCallback){
                            this._Server.closeClient();
                            failCallback(res);
                            this.emit('info','Attempted SMS check: ' + JSON.stringify(res));
                        }
                        
                    }else{
                        if (o === 'done'){
                            res = {
                                success: true
                            }
                        }
                    }

                    this.emit('router-email-sent',res);
                    if (successCallback) {
                        successCallback(res);
                    }
                }
            }
    
        })
    }

    /**
     * @private
     * @description Parse XML response data and return SMS object
     * @param {string} xml - XML message from the router
     * @callback cb Callback function to be called with response data
     */
    _parseReceivedSMS(xml,successCallback,failCallback){
        this.parseXML(xml, (data)=>{

            //walk the object and update the info param
            if (!data.result){
                this.emit('error',new Error('TCRouter: parsed info data contains no <result> field',data))
            }else{
                if (!data.result.cmgr){
                    this.emit('error', new Error('TCRouter: parsed info data doesnt contain <cmgr> field: ' + JSON.stringify(data.result)));
                }else{
                    //walk the response object and update this.info
                    let o = data.result.cmgr[0];
                    let message = o['_'];
                    var res
                    let error = o['$']['error']
                    if (error){
                        var r = '';
                        if (error === "1"){
                            r = 'No SMS message received';
                        }else if (error === "2"){
                            r = 'try again later';
                        }else if (error === "3"){
                            r = 'Communication problem with the radio engine';
                        }
                        res = {
                            success: false,
                            message: r
                        };
                        this.emit('info','Attempted SMS check failed: ' + JSON.stringify(res));
                        this._Server.closeClient();
                        if (failCallback){
                            //this._Server.closeClient();
                            failCallback(res);                           
                        }
                        
                    }else{
                        let number  = o['$']['origaddr'];
                        let timestamp = o['$']['timestamp'];
                        var sms
                        try{
                            sms = new SMS(number,message);
                        }catch(e){
                            this.emit('error','Error receiving SMS message: ' + e);
                        }
                        res = {
                            SMS: sms,
                            timestamp: timestamp,
                            success: true
                        }
                    }

                    this.emit('router-sms',res);
                    if (successCallback) {
                        successCallback(res);
                    }
                }
            }
    
        })
    }

    /**
     * @private
     * @description Send the SMS received acknowledgement to the Router.  Is sent after the SMS has been received.
     * _parseAckSMS_Rx is expected to be received after sending this message (calling this function)
     */
    _acknowledgeSMS(){
        let res = this._xmlHeader('<cmga/>',true);
        this._Server.sendData(res,true);
    }

    /**
     * @private
     * @description parse acknowledge SMS Response from TC Router.  
     * this confirms this acknowledgement has been received and message can be removed from memory
     * @param {string} xml XML string object with cmga response
     * @callback cb 
     */
    _parseAckSMS_Rx(xml,cb){
        this.parseXML(xml, (data)=>{

            //walk the object and update the info param
            if (!data.result){
                this.emit('error',new Error('TCRouter: parsed info data contains no <result> field',data))
            }else{
                if (!data.result.cmga){
                    this.emit('error', new Error('TCRouter: parsed info data doesnt contain <cmga> field: ' + JSON.stringify(data.result)));
                }else{
                    //walk the response object and update this.info
                    let o = data.result.cmga;
                    let message = o['_'];
                    var res = {
                        success: false
                    }
                    if (message !== 'ok'){
                        this.emit('error', new Error('Router failed to clear SMS message from memory'))
                    }else{
                        res = {
                            success: true
                        }
                    }
                    this.emit('router-sms-cleared',res);
                    if (cb) {
                        cb(res);
                    }
                }
            }
    
        })
    }

    /**
     * @private
     * @description Parses an IO input message and updates IO status on this
     * @param {string} xml Received XML string from the router
     * @param {function} cb Callback function to send the data to
     */
    _parseIOResponse(xml,cb){
        this.parseXML(xml, (data)=>{

            //walk the object and update the info param
            if (!data.result){
                this.emit('error',new Error('TCRouter: parsed info data contains no <result> field',data))
            }else{
                if (!data.result.io){
                    this.emit('error', new Error('TCRouter: parsed info data doesnt contain <io> field'));
                }else{
                    //walk the response object and update this.io
                    let io = data.result.io[0];
                    for (var child in io){
                        var key = child;
                        if (key === "output"){
                            let index = parseInt(io[child][0]['$']['no']) - 1;
                            this.io.output[index].value = (io[child][0]['$']['value'] === "on") ? true : false
                        }else if (key === "input"){
                            let index = parseInt(io[child][0]['$']['no']);
                            this.io.input[index].value = (io[child][0]['$']['value'] === "on") ? true : false
                        }else if (key === "gprs"){
                            this.io.gprs.value = (io[child][0]['$']['value']==="on") ? true : false
                        }

                    }
                    

                    this.emit('router-io',this.io);
                    this.emit('router-data',this._getRouterData())
                    if (cb) {
                        cb(this.io);
                    }
                }
            }
    
        })
    }

    /** 
    * @private
    * @description Update the data from the TC Router which will likely change over time.  Placeholder
    */
    getMutableInfo(){
        var infoReq =
        _xmlHeader('<info>\
        <radio/>\
        <inet/>\
        <io/>\
        </info>');

        this._Server._sendData(infoReq).then((data)=>{
         this._parseInfoResponse(data);
     },(failure)=>{
        this.emit('error',new Error('Get info request failed: ' + failure)); 
     });
}

    

    /**
     *
     *
     * @memberof TCRouter
     * @private
     * @description Build email in xml format from email object
     * @param {Email} Email - Email object which will be used to build the email message
     */
    _buildEmailXML(Email){
        if (Email.constructor.name !== 'Email'){
            this.emit('error','Input to build email xml was not Email type');
        }else{
            const data = Email.getJSON();

            let obj = { 
                'email': {
                    $: {
                        "to": data.to,
                    },'subject':{
                         _: data.subject
                    },'body':{
                         _: data.body
                    }
                }
            }

            //if a cc exists, send the email
            if (data.cc){
                obj['email']['$']["cc"] = data.cc;
            }
              
            let res = xmlBuilder.buildObject(obj);
            return res
              
            /*<?xml version="1.0"?>
            <email to="xx@xx.com" cc="xx@bb.com">
             <subject>Test Subject</subject>
             <body>body example</body>
            </email>*/
        }
    }

    /** 
    * @private
    * @description Build an sms in xml format from an sms object
    * @param {SMS} SMS - SMS object which will be used to build the sms message
    */
    _buildSMS_XML(SMS){
        if (SMS.constructor.name !== 'SMS'){
            this.emit('error',new Error('Input to build sms xml was not SMS type'));
        }else{
            const data = SMS.getJSON();

            let obj = { 
                'cmgs': {
                  $: {
                    "destaddr": data.contactsCS,
                  },
                  _: data.content
                }
              };
              
            let res = xmlBuilder.buildObject(obj);
            return res
              
            /*<?xml version="1.0"?>
            <cmgs destaddr="0172 123 4567">Example text</cmgs>
            */
        }
    }

    /*-----------------------Public Functions-------------------------------------*/

    /**
    * @public
    * @description Function to poll the TC Router for data at a preconfigured polling rate
    * @param {Number} rate - Number of seconds between TC Router data polls
    */
   pollRouter(rate){
        if (rate){
            this._pollingFunc = setInterval(()=>{this.poll()}, rate * 1000);
            return this._pollingFunc
        }else{
            this.emit('error', 'Polling rate not configured');
            return undefined
        }
    }
    /** 
    * @public
    * @description Stop polling clears the active polling function
    */
    stopPolling(){
        clearInterval(this._pollingFunc);
    }

    /**
    * @public
    * @description Send an SMS message to the TC Router
    * @param {SMS} message - Send 
    */
    sendSMS(message){
        if (message.constructor.name !== 'SMS'){
            this.emit('error',new Error('Message must be of type SMS'))
        }else{
            let xml = this._buildSMS_XML(message);
            this._Server.sendData(xml,false);
        }
    }

    /**
    * @public
    * @description Control outputs on the Router
    * @param {integer} index - Index of the output on the router which should be controlled
    * @param {bool} value - False: turn output off, True: turn output on
    */
    controlOutput(index,value){
        let val = (value === true) ? 1:0;
        let message = this._xmlHeader('<io><output no="' + index + '" value="' + val + '"/></io>');
        this._Server.sendData(message,'utf-8');
    }

    /**
    * @public
    * @description Control data connection if configured correctly on device web page
    * @param {bool} state - turn connection on or off
    */
    controlDataConnection(state){
        let s = (state === true) ? "on":"off";
        let message = this._xmlHeader('<io><gprs value="' + s + '"/></io>');
        this._Server.sendData(message,'utf-8');
    }




    /**
     * @description Start or stop VPN connections
     * @public  
     * @param {number} type 0:ipsec,1:openvpn
     * @param {number} index Index/Number/ID of the desired vpn tunnel
     * @param {boolean} state 0:turn off,1:turn on
     */
    controlVPN(type,index,state){
        if ((type !== 1) || (type!== 2)){
            this.emit('error',new Error('VPN Control: VPN type must be 0 (ipsec) or 1 (openvpn)'));
        }else{
            var element,o
            let value = (state === true) ? "on":"off";
            if (type === 1){
                o = '<ipsec';
            }else if (type === 2){
                o = '<openvpn';
            }
            element =  o + ' no="' + index + '" value="' + value + '"/>'
            let data = this._xmlHeader(element);
            this._Server.sendData(data,true);
        }
    }

    /** 
    * @public
    * @description Build, send, update, and return all device 'info'
    */
   getAllInfo(){
    var infoReq =
    this._xmlHeader('<info>\
      <device/>\
      <radio/>\
      <inet/>\
      <io/>\
     </info>');

     this._Server.sendData(infoReq,true);
    }

    /*----------------------Utility functions------------------------- */
    //Returns rssi based on integer value from router
    static _rssiDecode(input){
        let int = parseInt(input);  //ensure integer 
        if (int < 31){
            //normalize
            let norm = int/31;
            //dBm range - -113 to -51
            const min = -113;
            const max = -51;
            let newRange = max - min;
            return (norm * newRange + min)
        }else if (int < 99){
            return -51
        }else if (int === 99){
            return 99
        }
    }

    static _rssiToString(val){
        if (val !== 99){
            return String(val) + " dBm";
        }else{
            return "Not measured yet or unable to determine"
        }
    }

    static _cregToString(key){
        switch (key) {
            case 0:
                return "Not registered, not searching for cellular network";
                break;
            case 1:
                return "Registered in home network";
                break;
            case 2:
                return "Not registered yet, searching for cellular network";
                break;
            case 3:
                return "Registration rejected";
                break;
            case 4:
                return "Not used";
                break;
            case 5:
                return "Registration in another network (roaming)";
                break;
            default:
                break;
        }

    }


    /**
     * @description Convert packet property of info to string
     * @param {number} int 
     */
    static _infoPacketToString(int){
        switch (int) {
            case 0:
                return "Offline (no internet connection)";
                break;
            case 1:
                return "Online (internet connection)";
                break;
            case 2:
                return "GPRS online";
                break;
            case 3:
                return "EDGE online";
                break;
            case 4:
                return "UMTS online";
                break;
            case 5:
                return "HSDPA online";
                break;
            case 6:
                return "HSUPA online";
                break;
            case 7:
                return "HSDPA+HSUPA online";
                break;
            case 8:
                return "LTE online";
                break;
            default:
                break;
        }
    }

    /**
     * @private
     * @description Convert sim status integer to string value
     * @param {number} int 
     */
    static _simStatusToString(int) {
        switch (int) {
            case 0:
                return "Unknown";
                break;
            case 1:
                return "No SIM card";
                break;
            case 2:
                return "Waiting for PIN";
                break;
            case 3:
                return "Incorrect PIN entered";
                break;
            case 4:
                return "Waiting for PUK";
                break;
            case 5:
                return "Ready";
                break;
            default:
                break;
        }
    } 

}

module.exports = TCRouter;