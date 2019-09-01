
var expect    = require('chai').expect;

const net = require('net');
const RouterIO = require('../src/RouterIO.js');
const mockRouter = net.createServer();

describe('RouterIO test cases', function(){

    // afterEach(function() {
    //     mockRouter.close();
    // });

    it('Sends an accurately formed IO message to the TC Router Socket',function(){
        const ip = '127.0.0.1';
        const port = 6784;

        
        //let message = new SMS('7176026963','Hello from tcrouter-node');
        

        mockRouter.listen(port,ip,function(){
            //TC_Router.sendSMS(message);
            var IOController = new RouterIO(1432,'192.168.1.1',3000);
            IOController.controlOutput(1,true).then((success)=>{
                console.log(success);
            }).catch((e)=>{
                console.log(e);
            })
        });
        mockRouter.on('connection',function(socket){
            socket.on('data',function(data){
                //expect(data.toString()).to.equal(`<?xml version="1.0"?>\n<cmgs destaddr="+17176026963">This is the tcrouter dslink calling</cmgs>`)
            })
        })
        //TC_Router.sendSMS(message);


    })

    it('Sends an accurately formed IO status message to the TC Router Socket',function(){
        const ip = '127.0.0.1';
        const port = 6784;

        
        //let message = new SMS('7176026963','Hello from tcrouter-node');
        

        mockRouter.listen(port,ip,function(){
            //TC_Router.sendSMS(message);
            var IOController = new RouterIO(1432,'192.168.1.1',3000);
            IOController.getIO().then((success)=>{
                console.log(success);
            }).catch((e)=>{
                console.log(e);
            })
        });
        mockRouter.on('connection',function(socket){
            socket.on('data',function(data){
                //expect(data.toString()).to.equal(`<?xml version="1.0"?>\n<cmgs destaddr="+17176026963">This is the tcrouter dslink calling</cmgs>`)
            })
        })
        //TC_Router.sendSMS(message);


    })

    it('Controls GPRS',function(){
        const ip = '127.0.0.1';
        const port = 6784;

        
        //let message = new SMS('7176026963','Hello from tcrouter-node');
        

        mockRouter.listen(port,ip,function(){
            //TC_Router.sendSMS(message);
            var IOController = new RouterIO(1432,'192.168.1.1',3000);
            IOController.controlGprs(true).then((success)=>{
                console.log(success);
            }).catch((e)=>{
                console.log(e);
            })
        });
        mockRouter.on('connection',function(socket){
            socket.on('data',function(data){
                //expect(data.toString()).to.equal(`<?xml version="1.0"?>\n<cmgs destaddr="+17176026963">This is the tcrouter dslink calling</cmgs>`)
            })
        })
        //TC_Router.sendSMS(message);


    })

});