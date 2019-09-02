//const Client = require('./TCP_Client');
const builder = require('./Router_XML');
const XML = new builder();
const net = require("net");
const {PromiseSocket, TimeoutError} = require("promise-socket");
const SMS           = require('../src/sms.js');

class ReceiveSMS {
    constructor(port,host,timeout){
        this.port = port;
        this.host = host;
        this.timeout = timeout;
        this._netSocket = new net.Socket()
        this.client = new PromiseSocket(this._netSocket)
       
    }

    /**
     * @public
     * @description Checks the TC Router for received SMS messages.
     */
    async checkForSMS(){
        const message =
        XML.addHeader('<cmgr/>');
        
        return this.client.connect(this.port,this.host).then(()=>{
            return this.client.write(message,'utf-8').then(()=>{
                return this.client.read(300).then((res)=>{
                    return this.constructor._parseReceivedSMS(res.toString())
                })
            })
        })
    }

    /**
     * @public
     * @description Acknowledges the last received SMS message.
     */
    async ackLastSMS(){
        let message = XML.addHeader('<cmga/>');
        return this.client.connect(this.port,this.host).then(()=>{
            return this.client.write(message,'utf-8').then(()=>{
                return this.client.read(300).then((res)=>{
                    return this.constructor._parseAckSMS_Rx(res.toString())
                })
            })
        })
        

    }

        /**
     * @private
     * @description Parse XML response data and return SMS object
     * @param {string} xmlResponse - XML message from the router
     */
    static async _parseReceivedSMS(xmlResponse){
        return XML.xmlToJSON(xmlResponse).then((data)=>{
            return new Promise((resolve,reject)=>{
                //walk the object and update the info param
                if (!data.result){
                    reject('Response contains no <result> field',data);
                }else{
                    if (!data.result.cmgr){
                        reject("Parsed sms response data doesn't contain <cmgr> field: " + JSON.stringify(data.result));
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
                            resolve(res);                        
                        }else{
                            let number  = o['$']['origaddr'];
                            let timestamp = o['$']['timestamp'];
                            var sms
                            try{
                                sms = new SMS(number,message).getJSON();
                            }catch(e){
                                reject('Error receiving SMS message: ' + e);
                            }
                            res = {
                                SMS: sms,
                                timestamp: timestamp,
                                success: true
                            }
                        }

                        resolve(res);
                    }
                }
            })
            
    
        })
    }

    /**
     * @private
     * @description parse acknowledge SMS Response from TC Router.  
     * this confirms this acknowledgement has been received and message can be removed from memory
     * @param {string} xmlResponse XML string object with cmga response
     * @callback cb 
     */
    static async _parseAckSMS_Rx(xmlResponse){
        return XML.xmlToJSON(xmlResponse).then((data)=>{
            return new Promise((resolve,reject)=>{
                    //walk the object and update the info param
                if (!data.result){
                    reject('Parsed info data contains no <result> field',data);
                }else{
                    if (!data.result.cmga){
                        reject('Parsed info data doesnt contain <cmga> field: ' + JSON.stringify(data.result));
                    }else{
                        //walk the response object and update this.info
                        let o = data.result.cmga;
                        let message = o[0];
                        var res = {
                            success: false
                        }
                        if (message !== 'ok'){
                            reject('Router failed to clear SMS message from memory');
                        }else{
                            res = {
                                success: true
                            }
                        }
                        resolve(res);
                    }
                }
            })
            
    
        })
    }

}

module.exports = ReceiveSMS