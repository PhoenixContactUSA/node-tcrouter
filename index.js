
var validateIP    = require('validate-ip-node');
var RouterInfo    = require('./src/RouterInfo.js');
var SendSMS       = require('./src/SendSMS.js');
var ReceiveSMS    = require('./src/ReceiveSMS.js');
var RouterEmail   = require('./src/RouterEmail.js'); 
var RouterVPN     = require('./src/RouterVPN.js');
var RouterIO    = require('./src/RouterIO.js');

const SMS       = require('./src/sms.js');
const net       = require("net");
const {PromiseSocket, TimeoutError} = require("promise-socket");

/**Manage the tc router device
* @description Manages socket api to TCRouter device
*/
class TCRouter {
    /** 
    * @param {string} ip - IP Address of the TC Router
    * @param {number} port - TCP Port number of TC Router socket server
    * @param {number} timeout - Timeout in milliseconds for the tcp client
    */
    constructor(ip, port, timeout){
        
        var IP;
        if (!ip){
            throw('Undefined TC Router IP Address');
        }else{
            if (!validateIP(ip)){
               throw('Invalid TC Router IP Address');
            }else{
                IP = ip;
            }
        }
        

        //validate TCP port
        var Port = 1432;
        if (port !== undefined){
            if (isNaN(port)){
                throw('Invalid TC Router port number');
            }
            if (port === 80){
                throw('Invalid TC Router port number.  Port 80 cannot be used');
            }
        }else{
            throw('Undefined TC Router port number');
        }

        //Configuration parameters of the socket server
        this.client = {
            enabled:        {value:true,type:Boolean},
            status:         {value:'Disconnected',type:String},
            ip:             {value: IP,type:String},
            port:           {value: Port,type:String},
            timeout:        {value: timeout,type:Number},
            newlineChar:    {value: 'LF',type:String},       //LF, CR, CR+LF
            booleanVals:    {value: 'Verbose',type:String},
            connected:      {value: false,type:Boolean}
        }

        //Manages VPN connections - only updated after using VPN action method
        this.vpn = {
            ipsec: new Array(10),
            openvpn: new Array(10)
        }

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

        
        this.getIO                      = this.getIO.bind(this);
        this.sendSMS                    = this.sendSMS.bind(this);
        this.controlVPN                 = this.controlVPN.bind(this);
        this.getAllInfo                 = this.getAllInfo.bind(this);
        this.controlGprs                = this.controlGprs.bind(this);
        this.controlOutput              = this.controlOutput.bind(this);

        this._netSocket = new net.Socket()
        this.testClient = new PromiseSocket(this._netSocket)

        //initialize data
        this.getAllInfo = this.getAllInfo.bind(this);
        this.testConnection = this.testConnection.bind(this);

    }

    /*-----------------------Public Functions-------------------------------------*/

        /**
     * @private
     * @description Creates a quick connection to the selected port of the TC Router to test if device communication is open
     * @memberof TCRouter
     * @returns {Promise}
     */
    async testConnection(){
        return new Promise((resolve,reject)=>{
            return this.testClient.connect(this.client.port.value,this.client.ip.value).then(()=>{
                this.client.connected.value = true;
                this.client.status.value = "Connected";
                resolve("Connected");
            }).catch((e)=>{
                this.client.connected.value = false;
                this.client.status.value = "Disconnected";
                this.testClient = undefined
                reject(e);
            })
        })
    }

    /**
     * @private
     * @description Returns TC Router data after last update
     * @memberof TCRouter
     * @returns {Object}
     */

    getRouterData(){
        return {
            socket: this.socket,
            info:   this.info,
            io:     this.io
        }
    }
   
    /** 
    * @public
    * @description Request mutable status info from the router and return last known values
    * of static values
    * @memberof TCRouter
    * @returns {Promise}
    */
    async getMutableInfo(){
        var rInfo = new RouterInfo(this.client.port.value,this.client.ip.value,this.timeout);
        return rInfo.getMutableInfo().then((info)=>{
            this.info = info;
            return info
        }).catch((e)=>{
            this.client.connected.value = false;
            this.client.status.value = "Disconnected";
            rInfo = undefined;      //reclaim the memory
            throw(e)
        })
    }

    /**
    * @public
    * @description Send an SMS message to the TC Router
    * @memberof TCRouter
    * @param {Array} contacts - comma separated list of phone numbers to message
    * @param {String} content - message content 
    * @returns {Promise}
    */
    async sendSMS(contacts,content){
        return new Promise((resolve,reject)=>{
            var sms
            try {
                sms = new SMS(contacts,content)
            }catch(e){
                reject('Failed to send message',e,e.stack);
            }   

            var sendSMS = new SendSMS(this.client.port.value,this.client.ip.value,this.client.timeout.value,sms)
            resolve(sendSMS.send())
        })
        
        
    }

    /**
     * @public
     * @description Checks the TC router for an sms which has been received.  Returns the
     * contents of the sms.  Should be acknowledged after receipt using the ackSmsRx function
     * @memberof TCRouter
     * @returns {Promise}
     */
    async checkForSmsRx(){
        var rSMS = new ReceiveSMS(this.client.port.value,this.client.ip.value,this.client.timeout.value);
        return rSMS.checkForSMS()

    }

    /**
     * @public
     * @description Acknowledges the last received sms - TC Router then deletes this message
     * from its history and is no longer accessible.  Results of the message ack'd should be stored
     * @returns {Promise}
     * @memberof TCRouter
     */
    async ackSmsRx(){
        var rSMS = new ReceiveSMS(this.client.port.value,this.client.ip.value,this.client.timeout.value);
        return rSMS.ackLastSMS()
    }

    /**
    * @public
    * @memberof TCRouter
    * @description Control outputs on the Router
    * @param {integer} index - Index of the output on the router which should be controlled
    * @param {bool} value - False: turn output off, True: turn output on
    * @returns {Promise}
    */
    async controlOutput(index,value){
        const io  = new RouterIO(this.client.port.value,this.client.ip.value,this.client.timeout.value);
        return io.controlOutput(index,value)
    }

    /**
    * @public
    * @memberof TCRouter
    * @description Control Gprs connection if configured correctly on device web page
    * @param {bool} state - turn connection on or off
    * @returns {Promise}
    */
    async controlGprs(state){
        const io = new RouterIO(this.client.port.value,this.client.ip.value,this.client.timeout.value);
        return io.controlGprs(state);
    }

    /**
     * @public
     * @description Polls the TC Router for IO status
     * @returns {Promise}
     * @memberof TCRouter
     */
    async getIO(){
        const io = new RouterIO(this.client.port.value,this.client.ip.value,this.client.timeout.value)
        return io.getIO()
    }


    /**
     * @description Start or stop VPN connections
     * @public 
     * @memberof TCRouter
     * @param {number} type 0:ipsec,1:openvpn
     * @param {number} index Index/Number/ID of the desired vpn tunnel
     * @param {boolean} state 0:turn off,1:turn on
     * @returns {Promise}
     */
    async controlVPN(type,index,state){

    }

    /** 
    * @public
    * @memberof TCRouter
    * @description Build, send, update, and return all device 'info'
    * @returns {Promise}
    */
    async getAllInfo(){
        var rInfo = new RouterInfo(this.client.port.value,this.client.ip.value,this.timeout);
        return rInfo.getInfo().then((info)=>{
            this.info = info;
            return info
        }).catch((e)=>{
            this.client.connected.value = false;
            this.client.status.value = "Disconnected";
            rInfo = undefined;      //reclaim the memory
            throw(e)
        })
    }

}

module.exports = TCRouter;