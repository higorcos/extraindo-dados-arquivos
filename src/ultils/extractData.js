const fs = require('fs');
const XLSX = require('xlsx');
const xmljson = require('xml-js');


const extractDataXLS_Servidores = async (file,params) => {

    const {
        columnNome, 
        columnVinculo, 
        columnMes_Periodo,
        columnAno,
        columnOrgao,
        columnCpf, 
        columnMatricula, 
        columnCargo, 
        columnDataAdmissao, 
        columnCargaHoraria, 
        columnValorBruto, 
        columnValorLiquido, 
        columnValorDesconto
            } = params

    const workbook = XLSX.read(file, {type: 'buffer'});

    /* get first worksheet */
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json(worksheet,{ header: 1 });
    rawData.shift()
    const newData = []
    for (let i = 0; i < rawData.length; i++) {
        const lineData = rawData[i]
        newData.push({
            nome: lineData[columnNome],
            vinculo: lineData[columnVinculo],       
            mes_periodo: lineData[columnMes_Periodo],
            ano: lineData[columnAno],
            orgao: lineData[columnOrgao],
            cpf: lineData[columnCpf],
            matricula: lineData[columnMatricula], 
            cargo: lineData[columnCargo],
            dataAdmissao: lineData[columnDataAdmissao],//10
            cargaHoraria: lineData[columnCargaHoraria],
            valorBruto: parseFloat(lineData[columnValorBruto]),
            valorLiquido: parseFloat(lineData[columnValorLiquido]),
            valorDesconto: parseFloat(lineData[columnValorDesconto]),
        })
    } 

    return newData
}
const extractDataXML_Servidores = async (file) =>{
    
    var result = xmljson.xml2json(file, {compact: true, spaces: 4});
    return JSON.parse(result)
}

module.exports = {extractDataXLS_Servidores,extractDataXML_Servidores}




