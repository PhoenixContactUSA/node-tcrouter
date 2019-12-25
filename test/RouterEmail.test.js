
var expect    = require('chai').expect;
// var TCRouter  = require('../src/tcrouter.js');
// const Email   = require('../src/email.js');
const SMS     = require('../src/sms.js');
const net = require('net');
const RouterEmail = require('../src/RouterEmail');
const mockRouter = net.createServer();

const MOCK_DEVICE = {ip:'127.0.0.1',port: 8884};

describe('SendEmail test cases', function(){

    it('Sends an accurately formed Email message to the TC Router Socket',function(done){        

        mockRouter.listen(MOCK_DEVICE.port,MOCK_DEVICE.ip,function(done){
            //TC_Router.sendSMS(message);
            var routerEmail = new RouterEmail(MOCK_DEVICE.port,MOCK_DEVICE.ip,3000);
            routerEmail.sendEmail('ddd@ddd.com','TC Router Email Test',
            'Hello World Email').then((success)=>{
                console.log(success);
            }).catch((e)=>{
                expect.fail();
                done();
                console.log(e);
            })
        });
        mockRouter.on('connection',function(socket){
            socket.on('data',function(data){
                expect(data.toString()).to.equal(`<?xml version="1.0"?>\n<email to="ddd@ddd.com">\n  <subject>TC Router Email Test</subject>\n  <body>Hello World Email</body>\n</email>`)
                done();
            })
        })
    });

    it('Parses an xml email success response and returns a success response', function(done){
        const routerEmail = new RouterEmail(MOCK_DEVICE.port + 1,MOCK_DEVICE.ip,3000);

        routerEmail.constructor._parseSentEmailResponse(`<?xml version=“1.0“ encoding=“UTF-8“?><result><email>done</email></result>`)
        .then((res)=>{
            expect(res);
            expect(res.success).to.equal(true);
            done();
        })
        .catch((e)=>{
            expect.fail();
            done();
        })

    });

    it('Parsing function throws a rejection on bad xml object',function(done){
        const routerEmail = new RouterEmail(MOCK_DEVICE.port + 2,MOCK_DEVICE.ip,3000);

        routerEmail.constructor._parseSentEmailResponse(`<?xml version=“1.0“ encoding=“UTF-8“esul<email>done</email></result>`)
        .then((res)=>{
            expect.fail();
            done();
        })
        .catch((e)=>{
            expect(e).to.exist;
            done();
        })
    });

    it('Handles no result field',function(done){
        const routerEmail = new RouterEmail(MOCK_DEVICE.port + 3,MOCK_DEVICE.ip,3000);

        routerEmail.constructor._parseSentEmailResponse(`<?xml version=“1.0“ encoding=“UTF-8“?><email>done</email>`)
        .then((res)=>{
            expect.fail();
            done();
        })
        .catch((e)=>{
            expect(e).to.exist;
            done();
        });
    })

    it('Handles no email field', function(done){
        const routerEmail = new RouterEmail(MOCK_DEVICE.port + 4,MOCK_DEVICE.ip,3000);

        routerEmail.constructor._parseSentEmailResponse(`<?xml version=“1.0“ encoding=“UTF-8“?><result>done</result>`)
        .then((res)=>{
            expect.fail();
            done();
        })
        .catch((e)=>{
            expect(e).to.exist;
            done();
        })
    })

});