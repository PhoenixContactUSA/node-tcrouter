
var expect    = require('chai').expect;
// var TCRouter  = require('../src/tcrouter.js');
// const Email   = require('../src/email.js');
const SMS     = require('../src/sms.js');
const net = require('net');
const RouterEmail = require('../src/RouterEmail');
const mockRouter = net.createServer();

const MOCK_DEVICE = {ip:'127.0.0.1',port: 8884};

describe('SendSMS test cases', function(){

    afterEach(function() {
        mockRouter.close();
    });

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
    })

});