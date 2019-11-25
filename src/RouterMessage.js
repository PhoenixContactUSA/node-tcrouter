const net = require("net");
const {PromiseSocket, TimeoutError} = require("promise-socket");

class RouterMessage {
    constructor(port,ip,timeout){
        this.ip = ip;
        this.port = port;
        this.timeout = timeout;
    }

    async connect(){
        return new Promise((resolve,reject)=>{
            //if socket is connected, just resolve
            let _netSocket = new net.Socket();
            let client = new PromiseSocket(_netSocket)
            client.connect(this.port,this.ip).then(()=>{
                resolve(client);
            }).catch((e)=>{
                reject(e);
            });
        })
    }

    done(client){
        client.destroy();
        client = null;
    }
}

module.exports = RouterMessage;