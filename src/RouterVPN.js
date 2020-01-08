const builder = require('./Router_XML');
const XML = new builder();
const RouterMessage = require('./RouterMessage');

class RouterVPN extends RouterMessage {
    constructor(port,host,timeout){
        super(port,host,timeout)
        this.controlVPN = this.controlVPN.bind(this);
    }

     /**
     * @description Start or stop VPN connections
     * @public  
     * @param {number} type 1:ipsec,2:openvpn
     * @param {number} index Index/Number/ID of the desired vpn tunnel
     * @param {boolean} state 0:turn off,1:turn on
     */
    async controlVPN(type,index,state){
        return new Promise((resolve,reject)=>{
            if ((type !== 1) && (type!== 2)){
                reject('VPN Control: VPN type must be 1 (ipsec) or 2 (openvpn)');
            }else{
                var element,o
                let value = (state === true) ? "on":"off";
                if (type === 1){
                    o = '<ipsec';
                }else if (type === 2){
                    o = '<openvpn';
                }
                element =  o + ' no="' + index + '" value="' + value + '"/>'
                let message = XML.addHeader(element);
                resolve(message);

            }
        }).then((message)=>{
            return this.connect().then((client)=>{
                return client.write(message,'utf-8').then(()=>{
                    return client.read(500).then((res)=>{
                        this.done(client);
                        return this.constructor._parseVPN_ActionRx(res.toString())
                    })
                })
            })
        })
       
    }
        /**
     * @private
     * @description Parses response from router after vpn start/stop command
     * @param {string} xmlResult XML Data containing VPN message
     * @callback 
     */
    static async _parseVPN_ActionRx(xmlResult){

        return XML.xmlToJSON(xmlResult).then((data)=>{
            return new Promise((resolve,reject)=>{
                //walk the object and update the info param
            if (!data.result){
                reject('Parsed xml response data contains no <result> field',data);
            }else{
                if (!data.result.vpn){
                    reject('Parsed info data doesnt contain <vpn> field');
                }else{
                    //walk the response object and update this.io
                    var res = {
                        ipsec: new Array(10),
                        openvpn: new Array(10)
                    }

                    let elements = data.result.vpn[0];
                    for (var child in elements){
                        var key = child;
                        if (key === "ipsec"){
                            let index = parseInt(elements[child]['$']['no']);
                            res["ipsec"][index].value = (elements[child]['$']['value'] === "on") ? true : false
                        }else if (key === "openvpn"){
                            let index = parseInt(elements[child]['$']['no']);
                            res["openvpn"][index].value = (elements[child]['$']['value'] === "on") ? true : false
                        }else{
                           reject('Unexpected field in vpn message');
                        }

                    }
                    

                    resolve(res);
                }
            }
            })
            
    
        })

    }
}

module.exports = RouterVPN;