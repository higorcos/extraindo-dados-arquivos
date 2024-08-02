const fs = require('fs');
const XLSX = require('xlsx');

 const extractDataXLS_Servidores = async (file) => {
   
    
    const workbook = XLSX.read(file, {type: 'buffer'});

    /* get first worksheet */
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const raw_data = XLSX.utils.sheet_to_json(worksheet,{ header: 1 });
    raw_data.shift()
    
    
    return raw_data
}

module.exports = {extractDataXLS_Servidores}

