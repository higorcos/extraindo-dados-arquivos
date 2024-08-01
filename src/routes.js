const { Router } = require('express');
const multer = require('multer');
const { Readable } = require('stream');
const readLine = require('readline');
const client = require('./database/client');

const multerConfig = multer();
const routes = Router();

routes.post("/products", multerConfig.single("file"), async( request, response)=>{
    //console.log(request.file);
    const {buffer} = request.file
    
    const readableFile = new Readable();
    readableFile.push(buffer)
    readableFile.push(null)
    const dataLine = readLine.createInterface({
        input: readableFile
    })
    const data = []

    for await(let line of dataLine){
        const lineSplit = line.split('|');
        //console.log(lineSplit[0])
        data.push({
        nome: lineSplit[4],
        vinculo: lineSplit[19],       
        mes_periodo: lineSplit[1],
        ano: lineSplit[2],
        orgao: lineSplit[0],
        cpf: lineSplit[5],
        matricula: lineSplit[6], 
        cargo: lineSplit[8],
        dataAdmissao: lineSplit[10],//10
        cargaHoraria: lineSplit[13],
        valorBruto: parseFloat(lineSplit[15]),
        valorLiquido: parseFloat(lineSplit[16]),
        valorDesconto: parseFloat(lineSplit[15]),
        })
    }

    for await (let {nome,vinculo,mes_periodo,ano,orgao,cpf,matricula,cargo,dataAdmissao,cargaHoraria,valorBruto,valorLiquido,valorDesconto} of data){
        await client.DadosExatraidosFolhaDePagementos.create(
            {
                data:{nome,vinculo,mes_periodo,ano,orgao,cpf,matricula,cargo,cargaHoraria,valorBruto,valorLiquido,valorDesconto}
            })
    }


    return response.json(data);

})
routes.get("/", ( request, response)=>{
    console.log('a')
    return response.send();
})
module.exports = routes