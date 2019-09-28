
var expect    = require('chai').expect;
// var TCRouter  = require('../src/tcrouter.js');
// const Email   = require('../src/email.js');
const SMS     = require('../src/sms.js');
const net = require('net');
const ReceiveSMS = require('../src/ReceiveSMS');
const mockRouter = net.createServer();

const MOCK_DEVICE = {ip:'127.0.0.1',port: 7984};

describe('ReceiveSMS test cases', function(){

    afterEach(function() {
        mockRouter.close();
    });

    it('Receive SMS message',function(done){        

        mockRouter.listen(MOCK_DEVICE.port,MOCK_DEVICE.ip,function(){
            //TC_Router.sendSMS(message);
            var sms = new ReceiveSMS(MOCK_DEVICE.port,MOCK_DEVICE.ip,3000);
            sms.checkForSMS().then((success)=>{
                console.log(success);
            }).catch((e)=>{
                expect.fail();
                done();
                console.log(e);
            })
        });
        mockRouter.on('connection',function(socket){
            socket.on('data',function(data){
                expect(data.toString()).to.equal(`<?xml version="1.0"?><cmgr/>`)
                done();
            })
        })


    })

    it('Acknowledge SMS receipt',function(done){

        mockRouter.listen(MOCK_DEVICE.port+1,MOCK_DEVICE.ip,function(){
            //TC_Router.sendSMS(message);
            var sms = new ReceiveSMS(MOCK_DEVICE.port+1,MOCK_DEVICE.ip,3000);
            sms.ackLastSMS().then((success)=>{
                console.log(success);
            }).catch((e)=>{
                expect.fail();
                done();
                console.log(e);
            })
        });
        mockRouter.on('connection',function(socket){
            socket.on('data',function(data){
                expect(data.toString()).to.equal(`<?xml version="1.0"?><cmga/>`)
                done();
            })
        })
       
    })

});