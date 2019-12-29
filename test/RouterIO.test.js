var expect = require("chai").expect;

const net = require("net");
const RouterIO = require("../src/RouterIO.js");

const MOCK_DEVICE = { ip: "127.0.0.1", port: 7784 };

describe("RouterIO test cases", function(done) {

  it("Sends an accurately formed control output message to the TC Router Socket", function(done) {
    const mockRouter = net.createServer();
    mockRouter.listen(MOCK_DEVICE.port, MOCK_DEVICE.ip, function() {
      var IOController = new RouterIO(MOCK_DEVICE.port, MOCK_DEVICE.ip, 3000);
      IOController.controlOutput(1, true)
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
          `<?xml version="1.0"?><io><output no="1" value="on"/></io>`
        );
        done();
      });
    });
  });

  it("Sends an accurately formed IO status message to the TC Router Socket", function(done) {
    const mockRouter = net.createServer();

    mockRouter.listen(MOCK_DEVICE.port + 1, MOCK_DEVICE.ip, function() {
      var IOController = new RouterIO(MOCK_DEVICE.port + 1, MOCK_DEVICE.ip, 3000);
      IOController.getIO()
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
          `<?xml version="1.0"?><io><output no="1"/><input no="1"/><input no="2"/></io>`
        );
        done();
      });
    });
  });

  it("Can send multiple status messages", function(done) {
    const mockRouter = net.createServer();
    var successCount = 0;

    mockRouter.listen(MOCK_DEVICE.port + 2, MOCK_DEVICE.ip, function() {
      var IOController = new RouterIO(MOCK_DEVICE.port + 2, MOCK_DEVICE.ip, 3000);
      IOController.getIO()
        .then(success => {
          console.log(success);
        })
        .catch(e => {
            console.log('Multiple status request fail',e.message,e.stack);
          expect.fail();
          done();
        });
      IOController.getIO()
        .then(success => {
          console.log(success);
        })
        .catch(e => {
            console.log('Multiple status request fail',e.message,e.stack);
          expect.fail();
          done();
        });
    });
    mockRouter.on("connection", function(socket) {
      socket.on("data", function(data) {
        expect(data.toString()).to.equal(
          `<?xml version="1.0"?><io><output no="1"/><input no="1"/><input no="2"/></io>`
        );
        successCount = successCount + 1;
        if (successCount === 2){
            done();
        }
      });
    });
  });

  it("Can send a properly formed Control GPRS message", function(done) {
    const mockRouter = net.createServer();

    mockRouter.listen(MOCK_DEVICE.port + 3, MOCK_DEVICE.ip, function() {
      var IOController = new RouterIO(MOCK_DEVICE.port + 3, MOCK_DEVICE.ip, 3000);
      IOController.controlGprs(true)
        .then(success => {
          console.log(success);
        })
        .catch(e => {
            console.log('GPRS test failed',e.message,e.stack);
          expect.fail();
          done();
        });
    });
    mockRouter.on("connection", function(socket) {
      socket.on("data", function(data) {
        expect(data.toString()).to.equal(
          `<?xml version="1.0"?><io><gprs value="on"/></io>`
        );
        done();
      });
    });
  });

  it('Can parse io xml response', function(done){
    const ioc = new RouterIO(MOCK_DEVICE.port,MOCK_DEVICE.ip,3000);

    ioc._parseIOResponse(`<?xml version="1.0" encoding="UTF-8"?><result><io><output no="1" value="off"/><input no="1" value="off"/><input no="2" value="off"/></io></result>`)
    .then((res)=>{
      expect(res.input[0].value).to.equal(false);
      expect(res.input[1].value).to.equal(false);
      expect(res.output[0].value).to.equal(false);
      done();
    })
    .catch((e)=>{
      expect.fail();
      done();
    })

  })

  it('Can parse gprs xml response',function(done){
    const ioc = new RouterIO(MOCK_DEVICE.port,MOCK_DEVICE.ip,3000);
    ioc._parseIOResponse(`<?xml version="1.0" encoding="UTF-8"?><result><io><gprs value="on"/></io></result>`)
    .then((res)=>{
      expect(res.gprs.value).to.equal(true);
      done();
    })
    .catch((e)=>{
      expect.fail();
      done();
    })

  })

  it('Handles malformed xml response object', function(done){
    const ioc = new RouterIO(MOCK_DEVICE.port,MOCK_DEVICE.ip,3000);

    ioc._parseIOResponse(`<?xml version="1.0" encoding="UTF-8"?><result><output no="1" value="off"/><input no="1" value="off"/><input no="2" value="off"/></io></result>`)
    .then((res)=>{
      expect.fail();
      done();
    })
    .catch((e)=>{
      expect(e).to.exist;
      done();
    })
  })

  it('Handles malformed xml response object with no result field', function(done){
    const ioc = new RouterIO(MOCK_DEVICE.port,MOCK_DEVICE.ip,3000);

    ioc._parseIOResponse(`<?xml version="1.0" encoding="UTF-8"?><output no="1" value="off"/><input no="1" value="off"/><input no="2" value="off"/></io>`)
    .then((res)=>{
      expect.fail();
      done();
    })
    .catch((e)=>{
      expect(e).to.contain('TCRouter: parsed info data contains no <result> field');
      done();
    })
  })

});
