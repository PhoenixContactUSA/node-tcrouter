var expect    = require('chai').expect;
var TCRouter  = require('../src/tcrouter.js');
const Email   = require('../src/email.js');
const SMS     = require('../src/sms.js');
const net = require('net');
const mockRouter = net.createServer();

describe('TCRouter() test cases', function(){

    /*              SOCKET initialization                */

    //connects to a valid TCP server
   

    //throws an error on invalid ip number
    it('Throws an error on invalid IP address', function(){
        const ip = '192.168.a.254';
        const port = 10341;

        
        expect(()=>{
            var TC_Router = new TCRouter(ip,port,port);
        }).to.throw('Invalid TC Router IP Address')
    })

    it('Throws an error on undefined IP Address', function(){
        const port = 9999;
        const ip = undefined;
        expect(()=>{var TC_Router = new TCRouter(ip,port,port);}).to.throw('Undefined TC Router IP Address')
        
    });

    //throws an error on invalid ip address
    it('Throws an error on invalid port number', function(){
        const ip = '192.168.0.254';
        const port = 'b';

        
        expect(()=>{
            var TC_Router = new TCRouter(ip,port,port);
        }).to.throw('Invalid TC Router port number')
    })

    //throws an error on invalid ip address
    it('Throws an error on an undefined port number', function(){
        const ip = '192.168.0.254';
        const port = undefined;

        expect(()=>{
            var TC_Router = new TCRouter(ip,port,port);
        }).to.throw('Undefined TC Router port number')
    })

    it('Throws an error on port 80', function(){
        const ip = '192.168.0.254';
        const port = 80;

        
        expect(()=>{
            var TC_Router = new TCRouter(ip,port,port);
        }).to.throw('Invalid TC Router port number.  Port 80 cannot be used')
    })



    /*                      XML Generation                  */
    it('Wrap function wraps content with xml header', function(){
        const ip = '192.168.0.254';
        const port = 7609;
        
        var TC_Router = new TCRouter(ip,port,port);
        var data = TC_Router._xmlHeader('<test/>');
        expect(data).to.equal('<?xml version="1.0"?><test/>')
    })

    /*                        XML Parsing                      */

    it('Parses an xml document into a readable json format', function(){
        const ip = '192.168.0.254';
        const port = 45232;

        var TC_Router = new TCRouter(ip,port,port);
        const data = 
        '<?xml version="1.0" encoding="UTF-8"?>\
            <result>\
             <info>\
             <device>\
              <serialno>13120004</serialno>\
              <hardware>A</hardware>\
              <firmware>1.04.9</firmware>\
              <wbm>1.40.9</wbm>\
              <imei>359628023404123</imei>\
             </device>\
             <radio>\
              <provider>Vodafone.de</provider>\
              <rssi>15</rssi>\
              <creg>1</creg>\
              <lac>0579</lac>\
              <ci>26330CD</ci>\
              <packet>7</packet>\
              <simstatus>5</simstatus>\
              <simselect>1</simselect>\
             </radio>\
             <inet>\
              <ip>1.2.3.4</ip>\
              <rx_bytes>24255</rx_bytes>\
              <tx_bytes>1753</tx_bytes>\
              <mtu>1500</mtu>\
              </inet>\
              <io>\
              <gsm>1</gsm>\
              <inet>1</inet>\
              <vpn>0</vpn>\
              </io>\
             </info>\
            </result>';

            TC_Router.parseXML(data, function(res){
                //expect(res.info.)
                //console.log(JSON.stringify(res));
                //console.dir(res);

                expect(res.result.info[0].device[0].serialno[0]).to.equal('13120004');
                expect(res.result.info[0].device[0].hardware[0]).to.equal('A');
                expect(res.result.info[0].radio[0].provider[0]).to.equal('Vodafone.de');
                expect(res.result.info[0].radio[0].rssi[0]).to.equal('15');
                expect(res.result.info[0].radio[0].ci[0]).to.equal('26330CD');
            });
            

    })

    /*it('Handles type conversion based on the defined datatype',function(){
        const ip = '192.168.0.254';
        const port = 1432;

        var TC_Router = new TCRouter(ip,port,port);
        TC_Router.typeConv('567',Number)
    })*/

    it('Updates the info class property on a new data input', function(){
        const ip = '192.168.0.254';
        const port = 8976;

        var TC_Router = new TCRouter(ip,port,port);
        const data = 
        '<?xml version="1.0" encoding="UTF-8"?>\
            <result>\
             <info>\
             <device>\
              <serialno>13120004</serialno>\
              <hardware>A</hardware>\
              <firmware>1.04.9</firmware>\
              <wbm>1.40.9</wbm>\
              <imei>359628023404123</imei>\
             </device>\
             <radio>\
              <provider>Vodafone.de</provider>\
              <rssi>15</rssi>\
              <creg>1</creg>\
              <lac>0579</lac>\
              <ci>26330CD</ci>\
              <packet>7</packet>\
              <simstatus>5</simstatus>\
              <simselect>1</simselect>\
             </radio>\
             <inet>\
              <ip>1.2.3.4</ip>\
              <rx_bytes>24255</rx_bytes>\
              <tx_bytes>1753</tx_bytes>\
              <mtu>1500</mtu>\
              </inet>\
              <io>\
              <gsm>1</gsm>\
              <inet>1</inet>\
              <vpn>0</vpn>\
              </io>\
             </info>\
            </result>';


        TC_Router._parseInfoResponse(data);
        TC_Router.on('info',function(res){
            console.log(JSON.stringify(res));
            expect(res).to.not.be.undefined;
        })

    });
    it('Returns SMS Object from incoming SMS message in xml', function(){
        const ip = '192.168.0.254';
        const port = 8977;

        var TC_Router = new TCRouter(ip,port,port);
        const data = 
        `<?xml version="1.0" encoding="UTF-8"?>
         <result>
            <cmgr origaddr="+17176026963" timestamp="14/06/30,10:01:05+08">SMS Message</cmgr>
         </result>`;


        TC_Router._parseReceivedSMS(data);
        TC_Router.on('router-sms',function(sms){
            let r = sms.getJSON();
            console.log(sms);
            expect(r.content).to.equal("SMS Message");
        })

    });
    it('Return error from failed SMS send response', function(done){
        const ip = '192.168.0.254';
        const port = 9977;

        var TC_Router = new TCRouter(ip,port,port);
        const data = 
        `<?xml version="1.0" encoding="UTF-8"?>
         <result>
            <cmgr error="1">empty</cmgr>
         </result>`;

         TC_Router.on('error',function(err){
            expect(err).to.be.an('error');
            done();
        });
        TC_Router._parseSentSMS_Response(data);
        

    });
    it('Return result from SMS send response', function(done){
        const ip = '192.168.0.254';
        const port = 9919;

        var TC_Router = new TCRouter(ip,port,port);
        const data = 
        `<?xml version="1.0" encoding="UTF-8"?>
        <result>
           <cmgs length="17">SMS transmitted</cmgs>
        </result>`;

         TC_Router.on('router-smsreply',function(data){
            expect(data.message).to.be.equal('SMS transmitted');
            done();
        });
        TC_Router._parseSentSMS_Response(data);
        

    });
    it('throws an error if polling rate is undefined but polling function called', function(){
        const ip = '192.168.0.254';
        const port = 7954;

        var TC_Router = new TCRouter(ip,port,port);
        
        TC_Router.on('error',function(e){
            expect(e).to.be.equal('Polling rate not configured');
        });

        TC_Router.pollRouter();
    });

    it('Returns interval function when calling the polling function', function(done){
        const ip = '192.168.0.254';
        const port = 32645;

        var TC_Router = new TCRouter(ip,port,port);
        TC_Router.on('error',function(e){
            assert.fail();
            console.log('error starting server: ' + e);
            done();
        });
        let id = TC_Router.pollRouter(1);
        expect(id).to.not.equal(undefined);
        done()
    })

    //-----------------------------Email API------------------------------------

    it('Build email xml throws error if input object is not a valid email object', function(){
        const ip = '192.168.0.254';
        const port = 55632;

        var TC_Router = new TCRouter(ip,port,port);
        TC_Router.on('error',function(e){
            expect(e).to.be.equal('Input to build email xml was not Email type');
        });
        var xml = TC_Router._buildEmailXML('blah');

    });

    it('Build email xml builds a valid email object', function(){
        const ip = '192.168.0.254';
        const port = 34673;

        var TC_Router = new TCRouter(ip,port,port);
        let email = new Email('zmink@phoenixcon.com','Test Subject','Test Body','jkustan@phoenixcon.com')
        var xml = TC_Router._buildEmailXML(email);
        expect(xml).to.equal(`<?xml version="1.0"?>
<email to="zmink@phoenixcon.com" cc="jkustan@phoenixcon.com">
  <subject>Test Subject</subject>
  <body>Test Body</body>
</email>`);

    });

    
    //--------------------------SMS API----------------------------------------

    it('Build sms xml builds a valid sms object', function(){
        const ip = '192.168.0.254';
        const port = 19823;

        var TC_Router = new TCRouter(ip,port,port);
        let message = new SMS('7176026963','This is the tcrouter dslink calling');
        var xml = TC_Router._buildSMS_XML(message);
        expect(xml).to.equal(`<?xml version="1.0"?>
<cmgs destaddr="+17176026963">This is the tcrouter dslink calling</cmgs>`);

    });


    it('Build sms xml throws error if input object is not a valid sms object', function(){
        const ip = '192.168.0.254';
        const port = 14756;

        var TC_Router = new TCRouter(ip,port,port);
        TC_Router.on('error',function(e){
            expect(()=>{throw e}).to.throw('Input to build sms xml was not SMS type')
        });
        var xml = TC_Router._buildSMS_XML('blah');
    });

    it('Sends an accurately formed SMS message to the TC Router Socket',function(){
        const ip = '127.0.0.1';
        const port = 6784;

        var TC_Router = new TCRouter(ip,port,port);
        let message = new SMS('7176026963','This is the tcrouter dslink calling');
        
        mockRouter.listen(port,ip,function(){
            TC_Router.sendSMS(message);
        });
        mockRouter.on('connection',function(socket){
            socket.on('data',function(data){
                expect(data).to.equal(`<?xml version="1.0"?>
                <cmgs destaddr="+17176026963">This is the tcrouter dslink calling</cmgs>`)
            })
        })
        //TC_Router.sendSMS(message);


    })
    

})