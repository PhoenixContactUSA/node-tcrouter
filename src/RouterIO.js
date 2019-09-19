const builder = require('./Router_XML');
const XML = new builder();
const net = require("net");
const {PromiseSocket, TimeoutError} = require("promise-socket");

class RouterIO {
    constructor(port,host,timeout){
        this.port = port;
        this.host = host;
        this.timeout = timeout;
        this._netSocket = new net.Socket()
        this.client = new PromiseSocket(this._netSocket)
        this._sendingMessage = false;

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
            }
        }

        this._parseIOResponse = this._parseIOResponse.bind(this);
        this.connect = connect.bind(this);
    }


    /**
     * @public
     * @description Control 2G/3G service - European devices only
     * @param {Boolean} state - turn gprs on or off
     */
    async controlGprs(state){
        let val = this.constructor.boolToValueToString(state);
        let message = XML.addHeader('<io><gprs value="'+val+'"/></io>');
        return this.client.connect(this.port,this.host).then(()=>{
            return this.client.write(message,'utf-8').then(()=>{
                return this.client.read(300).then((res)=>{
                    return this._parseIOResponse(res.toString())
                })
            })
        })
    }

    /**
     * @public
     * @description Get the IO status of the TC Router - inputs, outputs, and gprs
     * 
     */
    async getIO(){
        this._sendingMessage = true;
        const message = XML.addHeader('<io><output no="1"/><input no="1"/><input no="2"/></io>');
        return this.connect().then((client)=>{
            return client.write(message,'utf-8').then(()=>{
                return client.read(1000).then((res)=>{
                    client.destroy();
                    client = null;
                    return this._parseIOResponse(res.toString())
                }).catch((e)=>{
                    throw e
                })
            })
        })
        
    }

    /**
    * @public
    * @description Control outputs on the Router
    * @param {integer} index - Index of the output on the router which should be controlled
    * @param {bool} value - False: turn output off, True: turn output on
    */
    async controlOutput(index,value){
        let val = this.constructor.boolToValueToString(value);
        let message = XML.addHeader('<io><output no="' + index + '" value="' + val + '"/></io>');
        
        return this.client.connect(this.port,this.host).then(()=>{
            return this.client.write(message,'utf-8').then(()=>{
                return this.client.read(500).then((res)=>{
                    return this._parseIOResponse(res.toString())
                }).catch((e)=>{
                    return e
                })
            }).catch((e)=>{
                console.error(e);
            })
        })
    }

    static boolToValueToString(value){
        return (value === true) ? 'on':'off';
    }


        /**
     * @private
     * @description Parses an IO input message and updates IO status on this
     * @param {string} xml Received XML string from the router
     * @param {function} cb Callback function to send the data to
     */
    async _parseIOResponse(xmlResponse){
        
        return XML.xmlToJSON(xmlResponse).then((data)=>{
            return new Promise((resolve,reject)=>{
                //walk the object and update the info param
                if (!data.result){
                    reject('TCRouter: parsed info data contains no <result> field',data);
                }else{
                    if (!data.result.io){
                        reject('TCRouter: parsed info data doesnt contain <io> field');
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
                        

                        resolve(this.io);
                    }
                }
            });
               
        })
            
    }
    
}

module.exports = RouterIO;

async function connect(){
    return new Promise((resolve,reject)=>{
        //if socket is connected, just resolve
        let _netSocket = new net.Socket();
        let client = new PromiseSocket(_netSocket)
        client.connect(this.port,this.host).then(()=>{
            resolve(client);
        });
        // if (this.client.socket.readyState === "open"){
        //     if (this._sendingMessage === true){
        //         setTimeout(resolve,500);
        //     }else{
        //         resolve();
        //     }
        // }else if (this.client.socket.readyState === "opening"){
        //     this.client.socket.on('ready',()=>{
        //         if (this._sendingMessage === true){
        //             setTimeout(resolve,500);
        //         }else{
        //             resolve();
        //         }
        //     })
        // }else if (this.client.socket.destroyed === "closed") {
        //     return this.client.connect(this.port,this.host).then(()=>{
        //         resolve()
        //     })
        // }
    })
}