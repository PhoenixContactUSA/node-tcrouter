var xml2js          = require('xml2js');
var parseString     = xml2js.parseString;
//var xmlBuilder      = new xml2js.Builder();

class Router_XML extends xml2js.Builder{
    constructor(){
        super({xmldec:{}})
        this.addHeader = this.addHeader.bind(this);
        this.xmlToJSON = this.xmlToJSON.bind(this);
    }

    addHeader(content,encoding){
        return this.constructor.xmlHeader(content,encoding);
    }

    async xmlToJSON(xml){
        return this.constructor.parseXML(xml);
    }

    static xmlHeader(content,encoding){
        if (encoding === true){
            return '<?xml version="1.0" encoding="UTF-8"?>' + content
        }else{
            return '<?xml version="1.0"?>' + content
        }
        
    }

    /**
    * @private
    * @description Parse raw xml into a usable json object
    * @param {string} xml - string of xml data to convert to json
    * @callback 
    */
   static async parseXML(xml){
       return new Promise((resolve,reject)=>{
        parseString(xml, (err, result) =>{
            if (err){
                reject(err);
            }else{
                resolve(result);
            }
        });
       })
    
}

    
}


module.exports = Router_XML