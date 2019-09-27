
var expect    = require('chai').expect;
// var TCRouter  = require('../src/tcrouter.js');
// const Email   = require('../src/email.js');
const SMS     = require('../src/sms.js');
const net = require('net');
const SendSMS = require('../src/SendSMS');
const mockRouter = net.createServer();

const MOCK_DEVICE = {ip:'127.0.0.1',port: 7984};

describe('SendSMS test cases', function(){

    afterEach(function() {
        mockRouter.close();
    });

    it('Sends an accurately formed SMS message to the TC Router Socket',function(){

        
        let message = new SMS('2025550154','Hello from tcrouter-node');

        mockRouter.listen(MOCK_DEVICE.port,MOCK_DEVICE.ip,function(){
            var sms = new SendSMS(MOCK_DEVICE.port,MOCK_DEVICE.ip,3000,message);
            sms.send().then((success)=>{
                console.log(success);
            }).catch((e)=>{
                console.log(e);
            })
        });
        mockRouter.on('connection',function(socket){
            socket.on('data',function(data){
                expect(data.toString()).to.equal(`<?xml version="1.0"?>\n<cmgs destaddr="+12025550154">Hello from tcrouter-node</cmgs>`)
            })
        })

    })

});