const folhasDePagamento = [
    { 
      nome: 'JODNA DE AZEVEDO PISON', 
      cpf: '86760068300', 
      mes_periodo: '10', 
      ano: '2023', 
      idTipoPagamento: '2', 
      vinculo: 'AGENTE ADMINISTRATIVO', 
      orgao: '04516638000130', 
      matricula: '6', 
      cargo: 'AGENTE ADMINISTRATIVO', 
      dataAdmissao: ' ', 
      cargaHoraria: '40', 
      valorBruto: 1562.4, 
      valorLiquido: 660.12, 
      valorDesconto: 411010 
    },    
    { 
        nome: 'JODNA DE AZEVEDO PISON', 
        cpf: '86760068300', 
        mes_periodo: '10', 
        ano: '2023', 
        idTipoPagamento: '1', 
        vinculo: 'AGENTE ADMINISTRATIVO', 
        orgao: '04516638000130', 
        matricula: '6', 
        cargo: 'AGENTE ADMINISTRATIVO', 
        dataAdmissao: ' ', 
        cargaHoraria: '40', 
        valorBruto: 1562.4, 
        valorLiquido: 660.12, 
        valorDesconto: 411010 
      }
      
  ];
  
  const rubricas = [
    { cpf: '867600w68300', mes_periodo: '10', ano: '2023', 
        idTipoPagamento: '2', 
        tipoPagamento: '13o. SALARIO', desconto: 'S', valor: 1562.4 },
    { cpf: '86760068300', mes_periodo: '10', ano: '2023',
        idTipoPagamento: '1', 
         tipoPagamento: 'PREVIDÊNCIA 13º SALARIO - INSS', desconto: 'N', valor: 121.08 },
    { cpf: '86760068300', mes_periodo: '10', ano: '2023', 
        idTipoPagamento: '1', 
        tipoPagamento: '13o. SALÁRIO ADIANTADO', desconto: 'N', valor: 781.2 }
  ];
  
  const resultado = folhasDePagamento.map((folha) => {
    // Filtra as rubricas que correspondem ao cpf, mes_periodo e ano
    const rubricasCorrespondentes = rubricas.filter(rubrica =>
      rubrica.cpf === folha.cpf &&
      rubrica.mes_periodo === folha.mes_periodo &&
      rubrica.ano === folha.ano &&
      rubrica.idTipoPagamento === folha.idTipoPagamento
    );
  
    // Retorna o objeto folha com a chave rubricas adicionada
    return {
      ...folha,
      rubricas: rubricasCorrespondentes
    };
  });
  
  
  for (let index = 0; index < resultado.length; index++) {
      console.log(index)
      for (let {mes_periodo,ano,cpf,tipoPagamento,idTipoPagamento,desconto,valor} of resultado[index].rubricas){ 
          console.log('oo')
        
        console.log({mes_periodo,ano,cpf,tipoPagamento,idTipoPagamento,desconto,valor} )
      }  
    
  }
  

  //console.log(resultado[0]['rubricas']);
  