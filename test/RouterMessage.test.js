var expect = require("chai").expect;

const net = require("net");
const RouterMessage = require("../src/RouterMessage.js");

const MOCK_DEVICE = { ip: "127.0.0.1", port: 9099 };

describe("RouterMessage test cases", function() {

 it('Returns a connected client when succesfully connected to a server',(done)=>{
  const r = new RouterMessage(9099,'127.0.0.1',3000);

  const mockRouter = net.createServer();
    mockRouter.listen(MOCK_DEVICE.port, MOCK_DEVICE.ip, function() {
      r.connect().then((client)=>{
        expect(client.constructor.name).to.be.equal("PromiseSocket");
        done()
      }).catch((e)=>{
        expect.fail();
        done();
      })
    });
 })

 it('Rejects an error on connect failure',(done)=>{
  const r = new RouterMessage(900,'127.0.0.1',2000);

  r.connect().then(()=>{
    expect.fail();
    done();
  }).catch((e)=>{
    expect(e).to.exist;
    done();
  })

 });


});
