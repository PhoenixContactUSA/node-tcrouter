const builder = require('./Router_XML');
const XML = new builder();
const net = require("net");
const {PromiseSocket, TimeoutError} = require("promise-socket");

class RouterInfo {
    constructor(port,host,timeout){
        this.port = port;
        this.host = host;
        this.timeout = timeout;
        this._netSocket = new net.Socket()
        this.client = new PromiseSocket(this._netSocket)

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
                    return Router_Info._rssiDecode(this.info.radio.rssi.value);
                            },type:Number},
                creg:       {value:0, type: Number},
                cregString: {get value(){
                    return Router_Info._cregToString(this.info.radio.creg.value);
                            },type: String},
                lac:        {value:'',type: String},
                ci:         {value:'',type: String},
                packet:     {value:0, type: Number},
                packetString:{get value(){
                    return Router_Info._infoPacketToString(this.radio.packet.value);
                            },type:String},
                simstatus:  {value:0, type: Number},
                simstatusString: {get value(){
                    return Router_Info._simStatusToString(this.radio.simstatus.value)
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

        this.getInfo = this.getInfo.bind(this);
        this._parseInfoResponse = this._parseInfoResponse.bind(this);
    }

    async getInfo(){
        var infoReq =
        XML.addHeader('<info>\
        <device/>\
        <radio/>\
        <inet/>\
        <io/>\
        </info>');

        return this.client.connect(this.port,this.host).then(()=>{
            this.client.write(infoReq,'utf-8')
            return this.client.read(2000).then((res)=>{
                return this._parseInfoResponse(res.toString())
            })
        })
    }

    async getMutableInfo(){
        var infoReq =
        XML.addHeader('<info>\
        <radio/>\
        <inet/>\
        <io/>\
        </info>');

        return this.client.connect(this.port,this.host).then(()=>{
            return this.client.write(infoReq,'utf-8').then(()=>{
                return this.client.read(2000).then((res)=>{
                    return this._parseInfoResponse(res.toString())
                })
            })
        })
     
    }

    async _parseInfoResponse(xmlResponse){

        return XML.xmlToJSON(xmlResponse).then((data)=>{
            return new Promise((resolve,reject)=>{
                //walk the object and update the info param
                if (!data.result){
                   reject('TCRouter: parsed info data contains no <result> field' + data);
                }else{
                    if (!data.result.info){
                        reject('TCRouter: parsed info data doesnt contain <info> field');
                    }else{
                        //walk the response object and build infoRes
                        var infoRes
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

                        resolve(this.info);
                    }
                }
            })
            

        })

       
    }

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

module.exports = RouterInfo