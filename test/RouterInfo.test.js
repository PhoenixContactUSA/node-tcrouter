
var expect    = require('chai').expect;

const net = require('net');
const RouterInfo = require('../src/RouterInfo.js');
const mockRouter = net.createServer();

const MOCK_DEVICE = {ip:'127.0.0.1',port: 7884};

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

        mockRouter.listen(MOCK_DEVICE.port,MOCK_DEVICE.ip,function(){
            //TC_Router.sendSMS(message);
            var infoController = new RouterInfo(MOCK_DEVICE.port,MOCK_DEVICE.ip,3000);
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

    })

});