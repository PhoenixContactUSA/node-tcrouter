var expect = require("chai").expect;

const net = require("net");
const RouterVPN = require("../src/RouterVPN.js");

const MOCK_DEVICE = { ip: "127.0.0.1", port: 8784 };

describe("RouterVPN test cases", function() {

  it("Sends an accurately formed control vpn message to the TC Router Socket", function(done) {
    const mockRouter = net.createServer();

    mockRouter.listen(MOCK_DEVICE.port, MOCK_DEVICE.ip, function() {
      var IOController = new RouterVPN(MOCK_DEVICE.port, MOCK_DEVICE.ip, 3000);
      IOController.controlVPN(1,0,true)
        .then(success => {
          console.log(success);
        })
        .catch(e => {
          expect.fail();
          done();
        });
    });
    mockRouter.on("connection", function(socket) {
      socket.on("data", function(data) {
        expect(data.toString()).to.equal(
          `<?xml version="1.0"?><ipsec no="0" value="on"/>`
        );
        done();
      });
    });
  });


});
