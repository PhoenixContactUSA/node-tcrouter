
const phone = require('phone');

//object for managing sms validation and cleaning
class SMS {
    constructor(contacts,content){
        let arr = contacts.split(',');
        let numbers = [];
        arr.forEach(function(contact,index){
            var res = phone(contact);
            if (res === undefined || res.length == 0){
                throw new Error('Phone number ' + contact + ' is invalid')
            }else{
                numbers.push(res[0]);
            }
        });
        this.contacts = numbers;
        this.content = content;
        this.multipleContacts = (numbers.length > 1) ? true:false
    }

    getJSON(){
        return {
            contactsArr:        this.contacts,
            contactsCS:         this.contacts.join(','),
            content:            this.content,
            multipleContacts:   this.multipleContacts
        }
    }

}

module.exports = SMS;