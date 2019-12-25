const builder = require('./Router_XML');
const XML = new builder();
// const net = require("net");
// const {PromiseSocket, TimeoutError} = require("promise-socket");
const Email         = require('../src/email.js');
const RouterMessage = require('./RouterMessage');

class RouterEmail extends RouterMessage {
    constructor(port,host,timeout){
        super(port,host,timeout)

        this.sendEmail = this.sendEmail.bind(this)
    }

    /**
     * @public
     * @description Send an email using the smtp client of the TC Router
     * @param {String} to 
     * @param {String} subject 
     * @param {String} body 
     * @param {String} cc 
     */
    async sendEmail(to,subject,body,cc){
        return new Promise((resolve,reject)=>{
            var email
            try {
                email = new Email(to,subject,body,cc);
            } catch (error) {
                reject('Failed to build email from source',error);
            }

            return resolve(this.constructor._buildEmailXML(email).then((data)=>{
                return this.connect().then((client)=>{
                    return client.write(data,'utf-8').then(()=>{
                        return client.read(500).then((res)=>{
                            this.done(client);
                            return this.constructor._parseSentEmailResponse(res.toString());
                        })
                    })
                })
            }));

        })        
        
    }


        /**
     * @private
     * @description Detects if email was sent successfully
     * @param {string} xmlResponse - XML response from router
     * @callback successCallback - Executed when result is success
     * @callback failCallback - Executed when result is failure
     */
    static async _parseSentEmailResponse(xmlResponse){
        
        return XML.xmlToJSON(xmlResponse).then((data)=>{
            return new Promise((resolve,reject)=>{
                    //walk the object and update the info param
            if (!data.result){
                reject('Parsed email response contains no <result> field',data);
            }else{
                if (!data.result.email){
                    reject("Parsed email response doesn't contain <email> field: " + JSON.stringify(data.result));
                }else{
                    //walk the response object and u
                    let o = data.result.email[0];
                    let message = o['_'];
                    var res
                    var error
                    if (o['$']){
                        error = o['$']['error']
                    }
                    if (typeof error !== "undefined"){
                        res = {
                            success: false,
                            message: message
                        };
                        
                        resolve('Email send failed',res);
                        
                    }else{
                        if (o === 'done'){
                            res = {
                                success: true
                            }
                        }
                    }

                    resolve(res);
                }
            }
            })
            
    
        })

    }

     /**
     *
     *
     * @memberof TCRouter
     * @private
     * @description Build email in xml format from email object
     * @param {Email} Email - Email object which will be used to build the email message
     */
    static async _buildEmailXML(Email){
        return new Promise((resolve,reject)=>{
            if (Email.constructor.name !== 'Email'){
               reject('Input to build email xml was not Email type');
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
                  
                let res = XML.buildObject(obj);
                resolve(res)
                  
                /*<?xml version="1.0"?>
                <email to="xx@xx.com" cc="xx@bb.com">
                 <subject>Test Subject</subject>
                 <body>body example</body>
                </email>*/
            }
        })
        
    }
} 

module.exports = RouterEmail;