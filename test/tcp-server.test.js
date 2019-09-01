var expect = require('chai').expect;
var TCPServer = require('../src/tcp-server.js');
const net = require('net');
//const mockRouter = net.createServer();



//Units tests for the TCP socket server
describe('TCPServer() test cases', function(){

    //---------------------------Server--------------------------------------------

    //throws an error if server is started but no server configuration was provided
    it('TCPServer throws error if no server was configured but server was started', function(){
        let options = {
            client: {
                ip: '192.168.0.254',
                port: 9325
            }
        }
        var Server = new TCPServer(options);
        expect(()=>{let res = Server.startServer();}).to.throw('Server cannot start because it was not configured')

    })
    //throws error on an undefined server port
    it('TCPServer throws error on no server port defined', function(){
        let options = {
            client: {
                ip: '192.168.0.254',
                port: 8845
            },
            server: {
                ip: '0.0.0.0',
            }
        }
        expect(()=>{
            var Server = new TCPServer(options);
        }).to.throw('Server port not defined in configuration')

    })

    //start the server returns active status
    it('TCPServer can be started', function(done){
        let options = {
            client: {
                ip: '192.168.0.254',
                port: 9978
            },
            server: {
                ip: '0.0.0.0',
                port: 57992
            }
        }
        var Server = new TCPServer(options);
        Server.on('server-started',function(e){
            expect(e).to.be.not.undefined;
            done();
        })
        let res = Server.startServer();

        //expect(res).to.equal('TCP Server started on port: 1432');
    });


    //returns valid data when data is sent
    it('TCPServer emits valid data when client sends it', function(done){
        let options = {
            server: {
                ip: '0.0.0.0',
                port: 12476
            }
        }
        var mockClient = new net.Socket();
        mockClient.on('error',function(e){
            console.log(e);
            mockClient.end();
            assert.fail(e);
            done();
        })

        var Server = new TCPServer(options);
        Server.on('server-data',function(res){
            expect(res.data).to.be.equal('hello world');
            mockClient.end();
            done();
        })
        Server.on('server-started',function(){
            mockClient.connect(12476,'127.0.0.1',function(){
                mockClient.write('hello world');
            });
        })
        Server.on('error',function(e){
            console.log(e);
            mockClient.end();
            assert.fail(e);
            done();
        })
        let res = Server.startServer();
        
    });


    it('Server throws error when address is in use',function(done){
        let options = {
            server: {
                ip: '0.0.0.0',
                port: 12476
            }
        }
       var Server1 = new TCPServer(options);
       Server1.on('error',function(e){
           console.log('Server 1 error: ' + e);
           expect(e).to.be.an('error');
           done();
       })

       var Server2 = new TCPServer(options);
        Server2.on('error',function(e){
            expect(e).to.be.an('error');
            Server1.stopServer();
            Server2.stopServer();
            done();
        })
        Server1.startServer();
        Server1.on('server-started',()=>{
            Server2.startServer();
        })
    })

    it('Stops server on stopServer call',function(){
        let options = {
            server: {
                ip: '0.0.0.0',
                port: 33476
            }
        }
       var Server = new TCPServer(options);
       Server.on('server-stopped',(message)=>{
        expect(message).to.be.equal('TCP Server stopped');
       })
        
        Server.on('server-started',()=>{
            Server.stopServer();
        })
        Server.startServer();
        
    });
    it('Emits an error if the server is stopped but DNE',function(){
        let options = {
            server: {
                ip: '0.0.0.0',
                port: 12476
            }
        }
       var Server = new TCPServer(options);
       Server.on('error',(message)=>{
        expect(message).to.exist;
       })
        Server.startServer(()=>{
            Server._server = null;
            Server.stopServer();
        }); 
    })
    

    //------------------------Client-------------------------------
    //throws error on an undefined client port
    it('TCPServer throws error on no client port defined', function(){
        let options = {
            client: {
                ip: '192.168.0.254'
            },
            server: {
                ip: '0.0.0.0',
                port: 22222
            }
        }
        expect(()=>{
            var Server = new TCPServer(options);
        }).to.throw('Client port not defined in configuration')

    })
    //throws error on an undefined client ip 
    it('TCPServer throws error on no client ip defined', function(){
        let options = {
            client: {
                port: 5834
            },
            server: {
                ip: '0.0.0.0',
                port: 5834
            }
        }
        expect(()=>{
            var Server = new TCPServer(options);
        }).to.throw('Client IP address not defined in configuration')

    })
    //throws an error if client is started but no client configuration provided
    it('TCP Client sendData called but no client configuration provided', function(){
        let options = {
            server: {
                ip: '0.0.0.0',
                port: 23411
            }
        }
        var Server = new TCPServer(options);
        expect(()=>{
            Server.sendData('',false)
        }).to.throw('Cannot send data.  Client was not configured');
    })

    it('Closes the client connection after data is sent',function(done){
        let options = {
            client: {
                ip:   '127.0.0.1',
                port: 61033
            },
            server: {
                ip: '0.0.0.0',
                port: 61033
            }
        }
        var mockRouter = net.createServer();
        var Server = new TCPServer(options);
        Server.on('error',function(e){
            console.log('Server error: ' + e);
            expect.fail();
            done();
        });
        mockRouter.on('error',function(e){
            console.log('Server error: ' + e);
            expect.fail();
            done();
        });
        mockRouter.listen(options.client.port,options.client.ip);
        mockRouter.on('connection',function(socket){
            socket.on('data',function(data){
            //console.log('Socket data: ' + data.toString());
               //expect(data.toString()).to.be.equal('testing 1234');
               setTimeout(()=>{
                   expect(Server._client.destroyed).to.be.equal(true);
                   done();
               },100)
            })
        });

        
        Server.sendData('testing 1234',false);
        
        
    })

})