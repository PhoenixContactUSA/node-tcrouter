
var expect    = require('chai').expect;

const net = require('net');
const RouterInfo = require('../src/RouterInfo.js');
const mockRouter = net.createServer();

const MOCK_DEVICE = {ip:'127.0.0.1',port: 7184};

describe('RouterInfo test cases', function(){

    it('Sends an accurately formed info message to the TC Router Socket',function(done){
        const mockRouter = net.createServer();

        mockRouter.listen(MOCK_DEVICE.port,MOCK_DEVICE.ip,function(){
            //TC_Router.sendSMS(message);
            var infoController = new RouterInfo(MOCK_DEVICE.port,MOCK_DEVICE.ip,3000);
            infoController.getInfo().then((success)=>{
                console.log(success);
            }).catch((e)=>{
                expect.fail();
                console.log(e);
                done();
            })
        });
        mockRouter.on('connection',function(socket){
            socket.on('data',function(data){
                console.log(data.toString());
                expect(data.toString()).to.equal(`<?xml version="1.0"?><info>        <device/>        <radio/>        <inet/>        <io/>        </info>`)
                done();
            })
        })

    })

    it('Mutable info requests only mutable info on the tcrouter',function(done){
        const mockRouter = net.createServer();

        mockRouter.listen(MOCK_DEVICE.port+1,MOCK_DEVICE.ip,function(){
            //TC_Router.sendSMS(message);
            var infoController = new RouterInfo(MOCK_DEVICE.port+1,MOCK_DEVICE.ip,3000);
            infoController.getMutableInfo().then((success)=>{
                console.log(success);
            }).catch((e)=>{
                expect.fail();
                console.log(e);
                done();
            })
        });
        mockRouter.on('connection',function(socket){
            socket.on('data',function(data){
                console.log(data.toString());
                expect(data.toString()).to.equal(`<?xml version="1.0"?><info>        <radio/>        <inet/>        <io/>        </info>`)
                done();
            })
        })

    });

    it('Updates state from all info response',function(done){
        
        //sinon.stub(RouterInfo.prototype,'_parseInfoResponse').callsFake(()=>1);

        const infoController = new RouterInfo(MOCK_DEVICE.port,MOCK_DEVICE.ip,3000);

        infoController._parseInfoResponse(mockGetInfoResponse).then(()=>{

            expect(infoController.info.device.serialno.value).to.equal("3034095087");
            expect(infoController.info.device.hardware.value).to.equal("D");
            expect(infoController.info.device.firmware.value).to.equal("2.05.2");
            expect(infoController.info.device.wbm.value).to.equal("1.71.2");
            done();
        })

    });

    it('RSSI can be decoded into units of dBm',function(done){
        
        //sinon.stub(RouterInfo.prototype,'_parseInfoResponse').callsFake(()=>1);

        const infoController = new RouterInfo(MOCK_DEVICE.port,MOCK_DEVICE.ip,3000);

        infoController._parseInfoResponse(mockGetInfoResponse).then(()=>{

            expect(infoController._rssiDecode()).to.equal(-79);
            done();
        })

    });

     it('RSSI can be decoded into a string in units of dBm',function(done){
        
        //sinon.stub(RouterInfo.prototype,'_parseInfoResponse').callsFake(()=>1);

        const infoController = new RouterInfo(MOCK_DEVICE.port,MOCK_DEVICE.ip,3000);

        infoController._parseInfoResponse(mockGetInfoResponse).then(()=>{

            expect(infoController._rssiToString()).to.equal("-79 dBm");
            done();
        })

    });

    it('RSSI value of 99 returns not measured yet string',function(done){
        const infoController = new RouterInfo(MOCK_DEVICE.port,MOCK_DEVICE.ip,3000);

        infoController._parseInfoResponse(mockGetInfoResponse2).then(()=>{

            expect(infoController._rssiToString()).to.equal("Not measured yet or unable to determine");
            done();
        })
    })

    it('CREG function converts creg value to string', function(done){
        const im = new RouterInfo(MOCK_DEVICE.port,MOCK_DEVICE.ip,3000);
        im.info.radio.creg.value = 0;
        expect(im._cregToString()).to.equal("Not registered, not searching for cellular network");
        im.info.radio.creg.value = 1;
        expect(im._cregToString()).to.equal("Registered in home network");
        im.info.radio.creg.value = 2;
        expect(im._cregToString()).to.equal("Not registered yet, searching for cellular network");
        im.info.radio.creg.value = 3;
        expect(im._cregToString()).to.equal("Registration rejected");
        im.info.radio.creg.value = 4;
        expect(im._cregToString()).to.equal("Not used");
        im.info.radio.creg.value = 5;
        expect(im._cregToString()).to.equal("Registration in another network (roaming)");
        im.info.radio.creg.value = 6;
        expect(im._cregToString()).to.equal("Unknown state");

        done();
    });

    it('Can convert info packet to string', function(done){
        const im = new RouterInfo(MOCK_DEVICE.port,MOCK_DEVICE.ip,3000);
        im.info.radio.packet.value = 0;
        expect(im._infoPacketToString()).to.equal("Offline (no internet connection)");
        im.info.radio.packet.value = 1;
        expect(im._infoPacketToString()).to.equal("Online (internet connection)");
        im.info.radio.packet.value = 2;
        expect(im._infoPacketToString()).to.equal("GPRS online");
        im.info.radio.packet.value = 3;
        expect(im._infoPacketToString()).to.equal("EDGE online");
        im.info.radio.packet.value = 4;
        expect(im._infoPacketToString()).to.equal("UMTS online");
        im.info.radio.packet.value = 5;
        expect(im._infoPacketToString()).to.equal("HSDPA online");
        im.info.radio.packet.value = 6;
        expect(im._infoPacketToString()).to.equal("HSUPA online");
        im.info.radio.packet.value = 7;
        expect(im._infoPacketToString()).to.equal("HSDPA+HSUPA online");
        im.info.radio.packet.value = 8;
        expect(im._infoPacketToString()).to.equal("LTE online");
        im.info.radio.packet.value = 9;
        expect(im._infoPacketToString()).to.equal("Unknown state");

        done();
    })

});



const mockGetInfoResponse = `<?xml version="1.0" encoding="UTF-8"?>
<result><info><device><serialno>3034095087</serialno>
<hardware>D</hardware>
<firmware>2.05.2</firmware>
<wbm>1.71.2</wbm>
<imei>354228086778452</imei>
</device>
<radio><provider>Verizon</provider>
<rssi>17</rssi>
<creg>1</creg>
<lac>0000</lac>
<ci>00A02020</ci>
<packet>8</packet>
<simstatus>5</simstatus>
<simselect>1</simselect>
</radio>
<inet><ip>100.69.140.34</ip>
<rx_bytes>2217396</rx_bytes>
<tx_bytes>2774096</tx_bytes>
<mtu>1500</mtu>
</inet>
<io><gsm>on</gsm>
<inet>on</inet>
<vpn>off</vpn>
</io>
</info>
</result>
`;

const mockGetInfoResponse2 = `<?xml version="1.0" encoding="UTF-8"?>
<result><info><device><serialno>3034095087</serialno>
<hardware>D</hardware>
<firmware>2.05.2</firmware>
<wbm>1.71.2</wbm>
<imei>354228086778452</imei>
</device>
<radio><provider>Verizon</provider>
<rssi>99</rssi>
<creg>1</creg>
<lac>0000</lac>
<ci>00A02020</ci>
<packet>8</packet>
<simstatus>5</simstatus>
<simselect>1</simselect>
</radio>
<inet><ip>100.69.140.34</ip>
<rx_bytes>2217396</rx_bytes>
<tx_bytes>2774096</tx_bytes>
<mtu>1500</mtu>
</inet>
<io><gsm>on</gsm>
<inet>on</inet>
<vpn>off</vpn>
</io>
</info>
</result>
`;

const getMutableInfoResponse = `<?xml version="1.0" encoding="UTF-8"?>
<result><info><radio><provider>Verizon</provider>
<rssi>18</rssi>
<creg>1</creg>
<lac>0000</lac>
<ci>00A02020</ci>
<packet>8</packet>
<simstatus>5</simstatus>
<simselect>1</simselect>
</radio>
<inet><ip>100.69.140.34</ip>
<rx_bytes>2217396</rx_bytes>
<tx_bytes>2774390</tx_bytes>
<mtu>1500</mtu>
</inet>
<io><gsm>on</gsm>
<inet>on</inet>
<vpn>off</vpn>
</io>
</info>
</result>`;