module.exports = {
    getTypePortal:(name)=>{ 
        if(name.indexOf("Câmara") >= 0){
            return 'CM';
          }else if((name.indexOf("Prefeitura")) >= 0){
            return 'PM';
          }else{
            return null;
          }
    }
}