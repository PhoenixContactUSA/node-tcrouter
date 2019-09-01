const net = require("net");
const {PromiseSocket, TimeoutError} = require("promise-socket");

class TCP_Client extends PromiseSocket {
    constructor(port,host,timeout){
        super(port,host,timeout)
        this.port = port;
        this.host = host;

        this._connectionState = "Disconnected";
        this._stateStatus = "Queue not started";

        this._msgSequence = 0;   //initialize the state to initialized
        this._netSocket = new net.Socket()
        this._socket = new PromiseSocket(this._netSocket)
        this.connect = this.connect.bind(this);
        this.disconnect = this.disconnect.bind(this);
        this.send = this.send.bind(this);
    }

    async connect(){
        this._connectionState = "Connecting";
        this._socket.setTimeout(5000);
        return this._socket.connect({port:this.port,host:this.host}).then((res)=>{
            //console.log(res);
            this._connectionState = "Connected";
        })
        .catch((e)=>{
            if (e instanceof TimeoutError) {
                console.error("Socket timeout")
            }
        })
        
        
    }

    async send(data){
        if (this._connectionState !== "Connected"){
            console.error('Socket not connected');
            console.error(new Error().stack)
        }else{
            //let fullMessage = this._xmlHeader(message);
             this._netSocket.write(data,'utf-8')
        }
    }

    async read()

    disconnect(){
        this._socket.destroy();
        this._connectionState = "Socket Destroyed";
    }

}

module.exports = TCP_Client