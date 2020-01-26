//const Client = require('./TCP_Client');
const builder = require('./Router_XML');
const XML = new builder();
const SMS = require('./sms');
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
        var messages = []

        //for each contact, build a message
        this.SMS.contacts.forEach((number)=>{
            messages.push(new SMS(number,this.SMS.content))
        })
        var results = [] 

        messages.forEach((sms)=>{
            const p = this.connect().then((client)=>{ 
                return client.write(SendSMS._buildSMS_XML(sms),'utf-8').then(()=>{
                return client.read(100).then((res)=>{    
                    return this.constructor._parseSentSMS_Response(res.toString())
                    this.done(client)
                })
            })
            
            })
            results.push(p);        
        })
        return Promise.all(results).then((resArr)=>{
             //append message details
            
             var result = {
                "success": true
             }
             resArr.forEach((res,index)=>{
                result[this.SMS.contacts[index]] = res;
                if (res["success"] === false){
                    result.success = false;
                }
             })
             return result
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