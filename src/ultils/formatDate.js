module.exports = {
    formatDataDB:(date)=>{
        // Separar a data usando o separador '/'
        
    if(date == undefined || date == " "|| date==''){
        return null
    }
    let [day, month, year] = date.split('/');

    // Retornar no formato desejado
    return `${year}/${month}/${day}`;
    },
    formatDataDB_importPI:(date)=>{
        // Separar a data usando o separador '/'
        
    if(date == undefined || date == " "|| date==''){
        return null
    }
    let [day, month, year] = date.split('-');

    // Retornar no formato desejado
    return `${year}/${month}/${day}`;
    }
}