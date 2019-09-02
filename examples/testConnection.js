const tcr = require('../index.js');

var TCRouter = new tcr('192.168.1.1',1432,3000);

//Quickly test that the TC Router is available at the supplied ip address
//and port
TCRouter.testConnection().then((info)=>{
    console.log(info);
}).catch((e)=>{
    console.log(e)
})