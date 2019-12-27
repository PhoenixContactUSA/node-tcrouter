
var expect    = require('chai').expect;
// var TCRouter  = require('../src/tcrouter.js');
// const Email   = require('../src/email.js');
const SMS     = require('../src/sms.js');
const net = require('net');
const SendSMS = require('../src/SendSMS');
const mockRouter = net.createServer();

const MOCK_DEVICE = {ip:'127.0.0.1',port: 6924};

describe('SendSMS test cases', function(){

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

    });

    it('Parses sent sms success response xml',function(done){
        let message = new SMS('2025550154','Hello from tcrouter-node');
        var sms = new SendSMS(MOCK_DEVICE.port,MOCK_DEVICE.ip,3000,message);
        sms.constructor._parseSentSMS_Response(`<?xml version="1.0"?><result><cmgs length="17">SMS transmitted</cmgs></result>`)
        .then((res)=>{
            expect(res.success).to.be.equal(true);
            expect(res.message).to.be.equal("SMS transmitted");
            expect(res.length).to.be.equal("17");
            done();
        }).catch((e)=>{
            expect.fail();
            done();
        })
        
    });

});