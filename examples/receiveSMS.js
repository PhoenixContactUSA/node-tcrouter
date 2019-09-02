const tcr = require('../index.js');

var TCRouter = new tcr('192.168.1.1',1432,3000);

TCRouter.checkForSmsRx().then((res)=>{
    if (res.success === true){
        console.log(res);
        TCRouter.ackSmsRx().then((res)=>{
            console.log('message deleted');
        }).catch((e)=>{
            console.log(e);
        })
    }else{
        console.log('No new messages');
    }
    
}).catch((e)=>{
    console.log(e);
})