
var expect    = require('chai').expect;
// var TCRouter  = require('../src/tcrouter.js');
// const Email   = require('../src/email.js');
const SMS     = require('../src/sms.js');
const net = require('net');
const ReceiveSMS = require('../src/ReceiveSMS');
const mockRouter = net.createServer();

describe('ReceiveSMS test cases', function(){

    afterEach(function() {
        mockRouter.close();
    });

    it('Receive SMS message',function(){
        const ip = '127.0.0.1';
        const port = 6784;

        
        //let message = new SMS('7176026963','Hello from tcrouter-node');
        

        mockRouter.listen(port,ip,function(){
            //TC_Router.sendSMS(message);
            var sms = new ReceiveSMS(1432,'192.168.1.1',3000);
            sms.checkForSMS().then((success)=>{
                console.log(success);
            }).catch((e)=>{
                console.log(e);
            })
        });
        mockRouter.on('connection',function(socket){
            socket.on('data',function(data){
                expect(data.toString()).to.equal(`<?xml version="1.0"?>\n<cmgs destaddr="+17176026963">This is the tcrouter dslink calling</cmgs>`)
            })
        })
        //TC_Router.sendSMS(message);


    })

    it('Acknowledge SMS receipt',function(){
        const ip = '127.0.0.1';
        const port = 6784;

        
        //let message = new SMS('7176026963','Hello from tcrouter-node');
        

        mockRouter.listen(port,ip,function(){
            //TC_Router.sendSMS(message);
            var sms = new ReceiveSMS(1432,'192.168.1.1',3000);
            sms.ackLastSMS().then((success)=>{
                console.log(success);
            }).catch((e)=>{
                console.log(e);
            })
        });
        mockRouter.on('connection',function(socket){
            socket.on('data',function(data){
                expect(data.toString()).to.equal(`<?xml version="1.0"?>\n<cmgs destaddr="+17176026963">This is the tcrouter dslink calling</cmgs>`)
            })
        })
        //TC_Router.sendSMS(message);


    })

});