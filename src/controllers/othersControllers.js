const {executeQuery} = require('../database/type');
const othersModels = require('../models/othersModels')
const { multiplesRandonFilter } = require("../ultils/filterResult");

const SECRET = process.env.SECRET_TOKEN;

module.exports = {
    list: (request, response)=>{
        
        try {
            executeQuery(othersModels.list,[],
                (err, result) => {
                    if (err) {
                        return response.status(502).json({
                            error: true,
                            error_title: "Erro, na resposta do banco de dados",
                            error_msg: err,
                            data: []
                        });
                    }
                    if (result != undefined && result.length != 0) {
                        const newResult = multiplesRandonFilter(result);            
                     


                        return response.status(200).json({
                        error: false,
                        msg: "Sucesso, list",
                        data: newResult
                        });
                }else if(result.length == 0) {
                    return response.json({
                      err: false,
                      
                      msg: "Não Encontrado",
                    });
                } else {
                return response.status(404).json({
                    err: true,
                    auth: false,
                    msg: "Não encontrado",
                });
                }
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
   
}
