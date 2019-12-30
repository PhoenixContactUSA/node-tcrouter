//const Client = require('./TCP_Client');
const builder = require('./Router_XML');
const XML = new builder();
// const net = require("net");
// const {PromiseSocket, TimeoutError} = require("promise-socket");
const RouterMessage = require('./RouterMessage');


class SendSMS extends RouterMessage {
    constructor(port,host,timeout,SMS){
        super(port,host,timeout)
        // super(port,host,timeout);
        // this.port = port;
        // this.host = host;
        // this.timeout = timeout;
        // this._netSocket = new net.Socket()
        // this.client = new PromiseSocket(this._netSocket)
        this.SMS = SMS;

        this.send = this.send.bind(this);
    }

    async send(){
        return this.connect().then((client)=>{
            client.write(SendSMS._buildSMS_XML(this.SMS),'utf-8')
            return client.read(100).then((res)=>{
                this.done(client);
                return this.constructor._parseSentSMS_Response(res.toString())
            })            
        })
    }

    
    /**
    * @private
    * @description Parses the returned XML data and update the local props
    * @param {string} xml - returned XML data
    * @callback cb function which wants updated io data
    */
    static async _parseSentSMS_Response(d){
    
    return XML.xmlToJSON(d).then((data)=>{
        return new Promise((resolve,reject)=>{
    //walk the object and update the info param
    if (!data.result){
        reject('TCRouter: parsed info data contains no <result> field');
    }else{
        if (!data.result.cmgs){
            reject('TCRouter: parsed info data doesnt contain <cmgs> field');
        }else{
            //walk the response object and update this.info
            let o = data.result.cmgs[0];
            let message = o['_'];
            let length  = o['$']['length'];
            let res = {
                message: message,
                length:  length,
                success: false
            }
            if (message === 'SMS transmitted'){
                res.success = true
            }else{
                res.success = false
                //reject('Failed SMS Message: ' + message);
            }
            resolve(res);
        }
    }
        })
    

    })


    }


    static _buildSMS_XML(SMS){
        if (SMS.constructor.name !== 'SMS'){
            console.error('Message was not a valid SMS class');
            console.log(new Error().stack);
            //this.emit('error',new Error('Input to build sms xml was not SMS type'));
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
              
            let res = XML.buildObject(obj);
            return res
              
            /*<?xml version="1.0"?>
            <cmgs destaddr="0172 123 4567">Example text</cmgs>
            */
        }
    }

}

module.exports = SendSMS