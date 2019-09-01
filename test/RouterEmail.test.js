
var expect    = require('chai').expect;
// var TCRouter  = require('../src/tcrouter.js');
// const Email   = require('../src/email.js');
const SMS     = require('../src/sms.js');
const net = require('net');
const RouterEmail = require('../src/RouterEmail');
const mockRouter = net.createServer();

describe('SendSMS test cases', function(){

    afterEach(function() {
        mockRouter.close();
    });

    it('Sends an accurately formed Email message to the TC Router Socket',function(){
        const ip = '127.0.0.1';
        const port = 6784;
        

        mockRouter.listen(port,ip,function(){
            //TC_Router.sendSMS(message);
            var routerEmail = new RouterEmail(1432,'192.168.1.1',3000);
            routerEmail.sendEmail('zacharylmink@gmail.com','TC Router Email Test',
            'Hello World Email').then((success)=>{
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