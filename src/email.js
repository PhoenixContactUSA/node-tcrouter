var validator = require('email-validator');


//function to validate email properties
class Email {
    constructor(to, subject, body, cc){
        //handle to addressing
        if (to) {
            this.to = this.validateEmailString(to);
        }else{
            throw new Error("Destination email is undefined")
        }

        //handle cc addressing
        if (cc) {
            this.cc = this.validateEmailString(cc);
        }

        if (!subject || subject === ''){
            throw new Error("Email has no subject")
        }else{
            this.subject = subject;
        }

        this.body = body;

    }

    validateEmailString(str){
        var arr = str.split(',');
        arr.forEach(function(item,index){
            if (validator.validate(item)){
                ;
            }else{
                throw new Error("Email address " + item + " is invalid")
            }
        });
        //as long as error isn't thrown, assign the address
        return str
    }

    
    getJSON(){
        return {
            to: this.to,
            cc: this.cc,
            body: this.body,
            subject: this.subject
        }
    }

}

module.exports = Email;