
var expect    = require('chai').expect;

const net = require('net');
const RouterInfo = require('../src/RouterInfo.js');
const mockRouter = net.createServer();

describe('RouterInfo test cases', function(){

    afterEach(function() {
        mockRouter.close();
    });

    it('Sends an accurately formed info message to the TC Router Socket',function(){
        const ip = '127.0.0.1';
        const port = 6784;

        
        //let message = new SMS('7176026963','Hello from tcrouter-node');
        

        mockRouter.listen(port,ip,function(){
            //TC_Router.sendSMS(message);
            var infoController = new RouterInfo(1432,'192.168.1.1',3000);
            infoController.getInfo().then((success)=>{
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