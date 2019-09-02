var expect = require('chai').expect;
var SMS = require('../src/sms.js');

describe('SMS() test cases', function(){

    //returns a sanitized US phone number
    it('sanitizes a basic US phone number', function(){
        let contact = '1111111111';
        let message = '';
        var s = new SMS(contact,message);
        let data = s.getJSON();
        expect(data.contactsCS).to.equal('+1111111111');
    })

    //throws an error on invalid phone numbers
    it('invalid phone number throws an error', function(){
        let contact = '82743a888';
        let message = '';
        
        expect(()=>{
            let s = new SMS(contact,message);
        }).to.throw('Phone number 82743a888 is invalid')
    })

})