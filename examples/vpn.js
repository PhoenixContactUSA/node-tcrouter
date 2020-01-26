const tcr = require('../index.js');

var TCRouter = new tcr('192.168.0.2',1432,3000);

TCRouter.controlVPN(2,2,true)
.then((res)=>{
    console.log('Received vpn response\n',JSON.stringify(res));
})
.catch((err)=>{
    console.error(err);
})