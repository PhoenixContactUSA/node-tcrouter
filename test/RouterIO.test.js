
var expect    = require('chai').expect;

const net = require('net');
const RouterIO = require('../src/RouterIO.js');

const DEVICE = {ip: '192.168.1.1',port:1432};
const MOCK_DEVICE = {ip:'127.0.0.1',port: 7784};

const USE_DEVICE = false;

const TARGET = (USE_DEVICE===true) ? DEVICE:MOCK_DEVICE;

describe('RouterIO test cases', function(){

    it('Sends an accurately formed control output message to the TC Router Socket',function(){
        
        const mockRouter = net.createServer();
        mockRouter.listen(MOCK_DEVICE.port,MOCK_DEVICE.ip,function(){
            
            var IOController = new RouterIO(TARGET.port,TARGET.ip,3000);
            IOController.controlOutput(1,true).then((success)=>{
                console.log(success);
            }).catch((e)=>{
                expect.fail();
            })
        });
        mockRouter.on('connection',function(socket){
            socket.on('data',function(data){
                expect(data.toString()).to.equal(`<?xml version="1.0"?><io><output no="1" value="on"/></io>`)
            })
        })
    })

    it('Sends an accurately formed IO status message to the TC Router Socket',function(){
        const mockRouter = net.createServer();

        mockRouter.listen(MOCK_DEVICE.port+1,MOCK_DEVICE.ip,function(){
            var IOController = new RouterIO(TARGET.port,TARGET.ip,3000);
            IOController.getIO().then((success)=>{
                console.log(success);
            }).catch((e)=>{
                expect.fail();
            })
        });
        mockRouter.on('connection',function(socket){
            socket.on('data',function(data){
                expect(data.toString()).to.equal(`<?xml version="1.0"?><io><output no="1"/><input no="1"/><input no="2"/></io>`)
            })
        })
    })


    it('Can send multiple status messages',function(){
        const mockRouter = net.createServer();     
        

        mockRouter.listen(MOCK_DEVICE.port+2,MOCK_DEVICE.ip,function(){
            var IOController = new RouterIO(TARGET.port,TARGET.ip,3000);
            IOController.getIO().then((success)=>{
                console.log(success);
            }).catch((e)=>{
                expect.fail();
            })
            IOController.getIO().then((success)=>{
                console.log(success);
            }).catch((e)=>{
                expect.fail();
            })
        });
        mockRouter.on('connection',function(socket){
            socket.on('data',function(data){
                expect(data.toString()).to.equal(`<?xml version="1.0"?><io><output no="1"/><input no="1"/><input no="2"/></io>`)
            })
        })
    })

    it('Can send a properly formed Control GPRS message',function(){
        const mockRouter = net.createServer();   

        mockRouter.listen(MOCK_DEVICE.port+3,MOCK_DEVICE.ip,function(){
            var IOController = new RouterIO(TARGET.port,TARGET.ip,3000);
            IOController.controlGprs(true).then((success)=>{
                console.log(success);
            }).catch((e)=>{
                expect.fail();
            })
        });
        mockRouter.on('connection',function(socket){
            socket.on('data',function(data){
                expect(data.toString()).to.equal(`<?xml version="1.0"?><io><gprs value="on"/></io>`)
            })
        })


    });

});