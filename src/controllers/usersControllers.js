const {executeQuery,executeQueryTrx} = require('../database/type');
const UserModels = require('../models/usersModels')
const { singleRandonFilter } = require("../ultils/filterResult");
const jwt = require("jsonwebtoken");

const SECRET = process.env.SECRET_TOKEN;

module.exports = {
    authorization: (request, response)=>{
        const {email, password} = request.body;

        try {
            executeQuery(UserModels.authorization,[email,password],
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
                    const newResult = singleRandonFilter(result[0]);            
                    
                    return response.status(200).json({
                    error: false,
                    msg: "Sucesso, usuário autorizado",
                    data: newResult
                    });

                }else if(result.length == 0) {

                    return response.status(404).json({
                      err: true,
                      msg: "Erro, usuário não Encontrado",
                      data: []
                    });

                } else {

                    return response.json({
                        err: false,
                        error_title: "Erro inesperado",
                        error_msg: error,
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
    login: (request, response)=>{
        const {email, password} = request.body;
        
        try {
            executeQuery(UserModels.login,[email,password],
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
                        const newResult = singleRandonFilter(result[0]);            
                        const token = jwt.sign({ userId: newResult.ID }, SECRET, {
                          expiresIn: 604800,
                        });


                        return response.status(200).json({
                        error: false,
                        msg: "Seucesso, Login",
                        data: {auth: true, token }
                        });
                }else if(result.length == 0) {
                    return response.json({
                      err: false,
                      auth: false,
                      msg: "Usuário não Encontrado",
                    });
                } else {
                return response.json({
                    err: false,
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
                auth: false,
                data: []
            });
        }
    },
   
}
