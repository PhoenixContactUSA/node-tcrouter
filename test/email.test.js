var expect = require('chai').expect;
var Email = require('../src/email.js');


describe('Email() test cases', function(){
    //email throws exception on undefined email address
    it('throws exception on undefined destination address',function(){
        const to = undefined;
        const subject = "nothing";
        const body = "abcdedgf";
        expect(()=>{new Email(to,subject,body)}).to.throw("Destination email is undefined");
    })

    //email throws exception on invalid to email address
    it('throws an exception on invalid "to" email address',function(){
        const to = "@wubba";
        const subject = "nothing";
        const body = "abcdefg";

        expect(()=>new Email(to,subject,body)).to.throw('Email address @wubba is invalid');

    })

    //email throws exception on invalid 'nth' invalid email address
    it('throws an exception on multiple invalid email addresses', function(){
        const to = 'test@gmail.com,@wubba';
        const subject = 'nothing';
        const body = 'abcdefg';

        expect(()=>new Email(to,subject,body)).to.throw('Email address @wubba is invalid');
    })

    //email throws exception on invalid to email address
    it('throws an exception on invalid "to" email address',function(){
        const cc = "@wubba";
        const subject = "nothing";
        const body = "abcdefg";
        const to = "zmink@phoenixcon.com";

        expect(()=>new Email(to,subject,body,cc)).to.throw('Email address @wubba is invalid');

    })

    //email throws exception on invalid 'nth' invalid email address
    it('throws an exception on multiple invalid email addresses', function(){
        const cc = 'asdfk@dfasdf.com,@wubba';
        const subject = 'nothing';
        const body = 'abcdefg';
        const to = 'asdfasdf@asdfasdf.com';

        expect(()=>new Email(to,subject,body,cc)).to.throw('Email address @wubba is invalid');
    })

    //email throws an exception on no subject
    it('throws an exception on undefined email subject', function(){
        const to = 'bbb@aaa.com';
        const subject = undefined;
        const body = '';
        
        expect(()=>{new Email(to,subject,body)}).to.throw('Email has no subject');
    })

    //email getJSON
    it('calling getJSON returns json object',function(){
        const t = 'ddd@ccc.com';
        const subject = 'this is a test';
        const body = 'testing 123';
        const cc = 'aaa@bbb.com';

        var j = new Email(t,subject,body,cc);
        var res = j.getJSON();

        expect(res.to).to.equal(t);
        expect(res.subject).to.equal(subject);
        expect(res.body).to.equal(body);
        expect(res.cc).to.equal(cc);
    })

})
