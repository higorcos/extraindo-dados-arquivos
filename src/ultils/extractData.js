const fs = require('fs');
const XLSX = require('xlsx');
const xmljson = require('xml-js');


const extractDataXLS_Servidores = async (file) => {

    const workbook = XLSX.read(file, {type: 'buffer'});

    /* get first worksheet */
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const raw_data = XLSX.utils.sheet_to_json(worksheet,{ header: 1 });
    raw_data.shift()


    return raw_data
}
const extractDataXML_Servidores = async () =>{
    
    var xml = require('fs').readFileSync('./foo.xml', 'utf8');

    var result = xmljson.xml2json(xml, {compact: true, spaces: 4});
    return JSON.parse(result)
}

module.exports = {extractDataXLS_Servidores,extractDataXML_Servidores}




