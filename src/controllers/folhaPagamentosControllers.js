const { extractDataXLS_Servidores, extractDataXML_Servidores } = require('../ultils/extractData');

const {executeQuery,executeQueryTrx} = require('../database/type');
const { v4: uuid } = require('uuid');
const { Readable } = require('stream');
const readLine = require('readline');

const processCSV =  async(file, request, response)=>{
    
    const {buffer} = file
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
            } = request.body

    
    const readableFile = new Readable();
    readableFile.push(buffer)
    readableFile.push(null)
    const dataLine = readLine.createInterface({
        input: readableFile
    })
    const data = []
 
    for await(let line of dataLine){
        const lineSplit = line.split('|');

        data.push({
        nome: lineSplit[columnNome],
        vinculo: lineSplit[columnVinculo],       
        mes_periodo: lineSplit[columnMes_Periodo],
        ano: lineSplit[columnAno],
        orgao: lineSplit[columnOrgao],
        cpf: lineSplit[columnCpf],
        matricula: lineSplit[columnMatricula], 
        cargo: lineSplit[columnCargo],
        dataAdmissao: lineSplit[columnDataAdmissao],//10
        cargaHoraria: lineSplit[columnCargaHoraria],
        valorBruto: parseFloat(lineSplit[columnValorBruto]),
        valorLiquido: parseFloat(lineSplit[columnValorLiquido]),
        valorDesconto: parseFloat(lineSplit[columnValorDesconto]),
        })


    }
    
    /*
    for await (let {nome,vinculo,mes_periodo,ano,orgao,cpf,matricula,cargo,dataAdmissao,cargaHoraria,valorBruto,valorLiquido,valorDesconto} of data){
        await client.DadosExatraidosFolhaDePagementos.create(
            {
                data:{nome,vinculo,mes_periodo,ano,orgao,cpf,matricula,cargo,cargaHoraria,valorBruto,valorLiquido,valorDesconto}
            })
        }
        */


    return response.status(200).json({
        error: false,
        title: 'Sucesso, novos dados inserido via csv',
        data: result
    });


}
const processXLS = async(file, request, response)=>{

    const {buffer} = file
    const params = request.body
    
    const data = await extractDataXLS_Servidores(buffer,params)

    response.json({"resultExtract": resultExtract})
    return response.status(200).json({
        error: false,
        title: 'Sucesso, novos dados inserido via XLS',
        data
    });
}
const processXML = async(file, request, response)=>{
    const {buffer} = file

    const data = await extractDataXML_Servidores(buffer)

    return response.status(200).json({
        error: false,
        title: 'Sucesso, novos dados inserido via XML',
        data
    });
}


module.exports = {
    insert: async( request, response)=>{
        const file = request.file   
    
        switch (file.mimetype) {
            case 'text/csv':
                console.log("__CSV")
                processCSV(file, request, response);
                break;
            case 'application/vnd.ms-excel':
                console.log("__XLS_EXECEL")
                processXLS(file,request, response);
                break;
            case 'application/xml':
                console.log("__XML")
                processXML(file,request, response);
                break;
            case 'application/json':
                console.log("__JSON")
                processJSON(file,request, response);
                break;
            default:
                return response.status(502).json({
                    error: true,
                    error_title: "Error, Unsupported file type",
                    data: []
                });
        }
    },
    joinCSV: async( request, response)=>{
        //console.log(request.file);
        const {files} = request
        const {body} = request
        return response.status(200).json({
            error: false,
            title: 'Sucesso, novo arquivo gerado',
            data: files[0].buffer
        });
    },
    show: async (request, response)=>{
        try {/*
        const sql = type.executeQuery(
            
                `INSERT INTO ORGAO
                (ID, CNPJ, NOME, UUID)
                VALUES(?, ?, ?, ?);`,
            [
              uuid(),
              'a',
              'b', 
              'c',
            ],
         
          );*/
    
        executeQuery(
            `SELECT * FROM ORGAO`
             ,[],
            (err, result) => {
                if (err) {
                console.log(err);
                return response.status(502).json({
                    error: true,
                    error_title: "Erro, na resposta do banco de dados",
                    error_msg: error,
                    data: []
                });
                }
             
                return response.status(200).json({
                    error: false,
                    title: 'Sucesso, listagem de dados',
                    data: result
                });
            }
            );
        }catch(error){       
            return response.status(500).json({
                error: true,
                error_title: "Erro inesperado",
                error_msg: error,
                data: []
            });
        }
    },
    list: async ( request, response)=>{
    
        //const a = await client.DadosExatraidosFolhaDePagementos.findMany();
        //console.log(a)
        return response.status(200).json({
            error: false,
            title: 'Sucesso, listagem das folhas de pagamento',
            data: []
            });
    
    },

}
