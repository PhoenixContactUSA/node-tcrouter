var expect = require('chai').expect;
var SMS = require('../src/sms.js');

describe('SMS() test cases', function(){

    //returns a sanitized US phone number
    it('sanitizes a basic US phone number', function(){
        let contact = '361-346-9364';
        let message = '';
        var s = new SMS(contact,message);
        let data = s.getJSON();
        expect(data.contactsCS).to.equal('+13613469364');
    });

    it('handles an array of strings for contacts',()=>{
        let contacts = ['361-346-9364','361-346-9365'];
        let message = '';
        var s = new SMS(contacts,message);
        let data = s.getJSON();
        expect(data.contactsCS).to.equal('+13613469364,+13613469365')
    })

    it('handles an comma separated string for contacts',()=>{
        let contacts = '361-346-9364,361-346-9365';
        let message = '';
        var s = new SMS(contacts,message);
        let data = s.getJSON();
        expect(data.contactsCS).to.equal('+13613469364,+13613469365')
    })


    //returns a sanitized US phone number
    it('Builds a json representation of a text message', function(){
        let contact = '361-346-9364';
        let message = 'Hello World';
        var s = new SMS(contact,message);
        let data = s.getJSON();
        try{

        }catch(e){
            console.log(data);
            throw e
        }
        expect(data).to.deep.equal({
            contactsCS: "+13613469364",
            contactsArr: ["+13613469364"],
            content: "Hello World",
            multipleContacts: false
            
        })
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