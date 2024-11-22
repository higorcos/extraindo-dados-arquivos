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
    },
    formatMesReferenciaPI: (mes) => {
        const mesNumerico = parseInt(mes, 10); // Converte o valor para um número
        if (isNaN(mesNumerico) || mesNumerico < 1 || mesNumerico > 12) {
          throw new Error("Mês inválido. Deve ser um número entre 1 e 12.");
        }
        return mesNumerico.toString().padStart(2, "0"); // Garante dois dígitos
    },
}