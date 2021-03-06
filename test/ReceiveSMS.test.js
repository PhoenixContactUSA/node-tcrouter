
var expect    = require('chai').expect;
// var TCRouter  = require('../src/tcrouter.js');
// const Email   = require('../src/email.js');
const SMS     = require('../src/sms.js');
const net = require('net');
const ReceiveSMS = require('../src/ReceiveSMS');


const MOCK_DEVICE = {ip:'127.0.0.1',port: 7984};

describe('ReceiveSMS test cases', function(){

    it('Receive SMS message',function(done){
        const mockRouter = net.createServer();        

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
        const mockRouter = net.createServer();

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

    it('Throws an error if returned unable to parse returned sms message',(done)=>{

        var sms = new ReceiveSMS(MOCK_DEVICE.port+2,MOCK_DEVICE.ip,3000);
        sms.constructor._parseReceivedSMS(`<?xml version="1.0"?>\n<cmga srcaddr="+12025550154">Hello from tcrouter-node</cmga>`)
        .then(()=>{expect.fail();done();})
        .catch((e)=>{
            expect(e).to.exist;
            done();
        })
    });

    it('Returns JSON representation of received sms message',(done)=>{
        var sms = new ReceiveSMS(MOCK_DEVICE.port+3,MOCK_DEVICE.ip,3000);

        sms.constructor._parseReceivedSMS(`<?xml version=“1.0“ encoding=“UTF-8“?>
        <result>
        <cmgr origaddr="+12025550179"
        timestamp="14/06/30,10:01:05+08">SMS message</cmgr>
        </result>`).then((res)=>{
            expect(res.SMS.contactsCS).to.be.equal("+12025550179");
            expect(res.SMS.content).to.be.equal("SMS message");
            done();
        }).catch((e)=>{
            expect.fail();
            done();
        })
    })

    it('Returns no sms error from router',(done)=>{
        var sms = new ReceiveSMS(MOCK_DEVICE.port+4,MOCK_DEVICE.ip,3000);

        sms.constructor._parseReceivedSMS(`<?xml version="1.0" encoding="UTF-8"?>
            <result>
            <cmgr error="1">empty</cmgr>
            </result>`).then((res)=>{
                expect(res.message).to.be.equal("No SMS message received");
                expect(res.success).to.be.equal(false);
                done();
        }).catch((e)=>{
            expect.fail();
            done();
        })
    })

    it('Returns sms busy error from router',(done)=>{
        var sms = new ReceiveSMS(MOCK_DEVICE.port+5,MOCK_DEVICE.ip,3000);

        sms.constructor._parseReceivedSMS(`<?xml version="1.0" encoding="UTF-8"?>
            <result>
            <cmgr error="2">empty</cmgr>
            </result>`).then((res)=>{
                expect(res.message).to.be.equal("Try again later");
                expect(res.success).to.be.equal(false);
                done();
        }).catch((e)=>{
            expect.fail();
            done();
        })
    })

    it('Returns sms system error from router',(done)=>{
        var sms = new ReceiveSMS(MOCK_DEVICE.port+6,MOCK_DEVICE.ip,3000);

        sms.constructor._parseReceivedSMS(`<?xml version="1.0" encoding="UTF-8"?>
            <result>
            <cmgr error="3">empty</cmgr>
            </result>`).then((res)=>{
                expect(res.message).to.be.equal("Communication problem with the radio engine");
                expect(res.success).to.be.equal(false);
                done();
        }).catch((e)=>{
            expect.fail();
            done();
        })
    })

    it('Parses sms acknowledgement',(done)=>{
        var sms = new ReceiveSMS(MOCK_DEVICE.port+6,MOCK_DEVICE.ip,3000);

        sms.constructor._parseAckSMS_Rx(`<?xml version="1.0" encoding="UTF-8"?>
            <result>
            <cmga>ok</cmga>
            </result>`).then((res)=>{
                //expect(res.message).to.be.equal("Communication problem with the radio engine");
                expect(res.success).to.be.equal(true);
                done();
        }).catch((e)=>{
            expect.fail();
            done();
        })
    })

});