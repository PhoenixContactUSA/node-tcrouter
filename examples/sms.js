const tcr = require('../index.js');

var TCRouter = new tcr('192.168.1.1',1432,3000);

TCRouter.sendSMS('7176026963','Hello world from node-tcrouter')
.then((res)=>{
    console.log(res);
}).catch((e)=>{
    console.log(e);
})