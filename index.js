/*****

BiblioTKjs, aplicativo para registro e gestão de empréstimos de mídias físicas.
Autor: @bwb0de
Github: https://github.com/bwb0de/biblioTKnode
eMail: danielc@unb.br
Licença: GPLv2

*****/

//Importando módulos do a serem usados
const express = require('express'); //http framework
const handlebars = require('express-handlebars').create({defaultLayout:'main'}); //Definindo os padrões dos templates
const body_parser = require('body-parser'); //Necessário para obter dados encaminhados via POST.
const fs = require("fs");

let app = express();

app.disable('x-powered-by'); //Evitando que informações do servidor sejam exibidas.
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.use(body_parser.urlencoded({extended: true}));
app.set('port', process.env.PORT || 3000); //Definindo a porta do servidor HTTP
app.use(express.static(`${__dirname}/public`)); //Definindo pasta de conteúdo estático


/* Criando variáveis para armazenar algumas informações do banco de dados e
minimizar consultas/leituras em disco. Estas variáveis serão preenchidas com
as ações assincronas fs.readdir e fs.readFile */

let formularios;
let fast_data;
let id_list = [];

fs.readdir("./nfo/forms", function(err, folder_f_list) {
  output = {};
  for (i in folder_f_list) {
    atrib = folder_f_list[i].split('.')[0]
    eval(`output.${atrib} = read_json_file("./nfo/forms/"+folder_f_list[i])`)
  }
  formularios = output;
});

fs.readFile('./nfo/midias_metadata.json', function(err, rawdata) {
  output = [];
  db_data = JSON.parse(rawdata)
  for (i in db_data) {
    fast_ob = {
      ID: db_data[i].ID,
      TITULO: db_data[i].TITULO,
      AUTOR: db_data[i].AUTOR,
      STATUS: db_data[i].STATUS
    }
    output.push(fast_ob)
    id_list.push(db_data[i].ID)
  }
  fast_data = output;
});

/***************************************************************************/ 



function find_and_split_midia(target_id, json_file) {
  ml = read_json_file(json_file);
  for (let i in ml) {
    if (ml[i].ID === target_id) {
      target = ml[i];
      ml.splice(i, 1);
      return [target, ml];
    }
  }
}

function find_midia(target_id, json_file) {
  ml = read_json_file(json_file);
  for (let i in ml) {
    if (ml[i].ID === target_id) {
      return ml[i];
    }
  }
}

function get_id_arg(id_param, form_body_id) {
    if (id_param === 'no_id') {
      console.log(form_body_id);
      return form_body_id
    } else {
      console.log(id_param);
      return id_param
    }
  }


function read_json_file(json_file) {
	let rawdata = fs.readFileSync(json_file);
  let jsondata = JSON.parse(rawdata);
	return jsondata;
}

function write_json_file(json_file, data) {
	let data_pretty = JSON.stringify(data, null, 4);
  fs.writeFile(json_file, data_pretty, finished);
  function finished(err) {
    if (err) { throw err;}
  }
}


function make_random_valid_id(midia_tipo){
  while (true) {
    //Tenta criar um número que não exita...
    let num = Math.floor((Math.random() * 1000000) + 1);

    if (midia_tipo === "Livro") {
      cod = "LIV";
    } else if (midia_tipo === "Revista") {
      cod = "RES";
    } else if (midia_tipo === "Fita VHS") {
      cod = "VHS";
    } else if (midia_tipo === "CD") {
      cod = "CDA";
    } else if (midia_tipo === "CD-ROM") {
      cod = "CDR";
    } else if (midia_tipo === "DVD") {
      cod = "DVD";
    } else if (midia_tipo === "BlueRay") {
      cod = "BR";
    }

    let nova_id = cod + num;
    if (id_list.indexOf(nova_id) === -1) {
      return nova_id;
    }
  }
}

function remove_from_fast_data(midia_id) {
  for (idx in fast_data) {
    if (fast_data[idx].ID === midia_id) {
      fast_data.splice(idx,1);
    }
  }
}


function sort_ac(fast_data_arr, atribute) {
  sorted_tmp = [];
  sorted = [];
  for (let idx in fast_data_arr) {
    ob_atribute_value = eval(`fast_data_arr[idx].${atribute}`)
    sorted_tmp.push(ob_atribute_value+"||"+idx)
  }
  sorted_tmp.sort()
  for (let idxx in sorted_tmp) {
    sorted.push(fast_data_arr[sorted_tmp[idxx].split("||")[1]])
  }
  return sorted;
};

function sort_desc(fast_data_arr, atribute) {
  sorted = sort_ac(fast_data_arr, atribute);
  return sorted.reverse();
};



//// HOME & ABOUT/////////////////////////////////////////////////////
app.get(['/', '/index', '/home'], function(req, res){
  res.sendFile(__dirname+'/public/index.html');
});

app.get(['/sobre', '/about'], function(req, res) {
  res.sendFile(__dirname+'/public/sobre.html');
});



//// MIDLEWARES /////////////////////////////////////////////////////
app.use(function(req, res, next){
  console.log('Looking for URL : ' + req.url); 
  next();
});

app.use(function(err, req, res, next){
  console.log('Error : ' + err.message); 
  next();
});



//// LISTAS //////////////////////////////////////////////////////
app.get('/main_list', function(req, res){
  m = sort_ac(fast_data, 'TITULO')
  res.render('home', { midias: m, main_list: true });
});

app.get('/main_list/titulo_reverse', function(req, res){
  m = sort_desc(fast_data, 'TITULO');
  res.render('home', { midias: m, main_list: true });
});

app.get('/main_list/autor', function(req, res){
  m = sort_ac(fast_data, 'AUTOR');
  res.render('home', { midias: m, main_list: true });
});

app.get('/main_list/autor_reverse', function(req, res){
  m = sort_desc(fast_data, 'AUTOR');
  res.render('home', { midias: m, main_list: true });
});

app.get('/main_list/situacao', function(req, res){
  m = sort_ac(fast_data, 'STATUS');
  res.render('home', { midias: m, main_list: true });
});

app.get('/main_list/situacao_reverse', function(req, res){
  m = sort_desc(fast_data, 'STATUS');
  res.render('home', { midias: m, main_list: true });
});



//// VISUALIZAÇÃO DETALHADA ///////////////////////////////////////
app.get('/ver_midia/:midiaid', function(req, res){
  midia = find_midia(req.params.midiaid, './nfo/midias_metadata.json')
  res.render('ver_midia', { midia: midia });
});


//// EDIÇÃO DAS INFORMAÇÕES DA MIDIA SELECIONADA ///////////////////////
app.get('/editar_midia/:midiaid', function(req, res){
  //Buscando informações...
  target_id = get_id_arg(req.params.midiaid, req.body.ID)
  target = find_midia(target_id, "./nfo/midias_metadata.json")
  
  //Identificando resposta registrada no campo RADIO
  if (target.MIDIA === "Livro") {
    target.isLivro = true;
  } else if (target.MIDIA === "Revista") {
    target.isRevista = true;
  } else if (target.MIDIA === "Fita VHS") {
    target.isVHS = true;
  } else if (target.MIDIA === "CD") {
    target.isCD = true;
  } else if (target.MIDIA === "CD-ROM") {
    target.isCDR = true;
  } else if (target.MIDIA === "DVD") {
    target.isDVD = true;
  } else if (target.MIDIA === "BlueRay") {
    target.isBR = true;
  }

  res.render('editar_midia', { midia: target });
});


//// GESTÃO DE EMPRESTIMOS /////////////////////////////////////////////
app.get('/emprestar_midia/:midiaid', function(req, res){
  target = find_midia(req.params.midiaid, "./nfo/midias_metadata.json");
  res.render('emprestar_midia', { midia: target });
});


app.get('/emprestados', function(req, res){
  emprestados = []
  for (var idx in fast_data) {

    //Verifica o STATUS para cada midia registrada
    if (fast_data[idx].STATUS === "Emprestado") {
      emprestados.push(fast_data[idx]);
    }
  }
  res.render('home', { midias: emprestados }); 
});


//// RENDERIZAÇÃO E PROCESSAMENTO DE  FORMULÁRIOS //////////////////////
app.get('/apagar/:midia', function(req, res){
  target = find_and_split_midia(req.params.midia, "./nfo/midias_metadata.json");
  write_json_file("./nfo/midias_metadata.json", target[1]);
  remove_from_fast_data(req.params.midia);
  res.sendFile(__dirname+'/public/excluido.html');
});


app.get('/:pagina/:subpagina', function(req, res){
  if (req.params.pagina === 'form') {
    ids_existentes = [];
    if (req.params.subpagina === 'nova_midia') {
      //Faça uma lista com as IDs existente no acervo para validação
      fields = formularios.nova_midia;
      for (let idx in fast_data) {
        ids_existentes.push(fast_data[idx].ID)
      }
    
    } else if (req.params.subpagina === 'registro_devolucao') {
      fields = formularios.registro_devolucao;
    
    } else if (req.params.subpagina === 'registro_emprestimo') {
      fields = formularios.registro_emprestimo
    }

    //Executa um laço para percorrer a variável com as informações dos formulário.
    for (var idx in fields.campos) {

      //Adiciona propriedade ao campo conforme o tipo para renderização seletiva do template.
      if (fields.campos[idx].tipo == 'textarea') {
        fields.campos[idx].isTextarea = true;

      } else if (fields.campos[idx].tipo == 'subt1') {
        fields.campos[idx].isSubt1 = true;

      } else if (fields.campos[idx].tipo == 'subt2') {
        fields.campos[idx].isSubt2 = true;

      } else if (fields.campos[idx].tipo == 'escala') {
        fields.campos[idx].isEscala = true;

      } else if (fields.campos[idx].tipo == 'checkbox') {
        fields.campos[idx].isCheckbox = true;
        fields.campos[idx].options = [];
        for (var iidx in fields.campos[idx].ops) {
          fields.campos[idx].options.push({ item_id: fields.campos[idx].id + iidx, item_nome: fields.campos[idx].nome, item_val: fields.campos[idx].ops[iidx] });
        }

      } else if (fields.campos[idx].tipo == 'radio-text') {
        fields.campos[idx].isRadioText = true;  
        fields.campos[idx].options = [];
        for (var iidx in fields.campos[idx].ops) {
          fields.campos[idx].options.push({ item_id: fields.campos[idx].id + iidx, item_nome: fields.campos[idx].nome, item_val: fields.campos[idx].ops[iidx] });
        }

      } else if (fields.campos[idx].tipo == 'radio') {
        fields.campos[idx].isRadio = true;

        fields.campos[idx].options = [];
        for (var iidx in fields.campos[idx].ops) {
          fields.campos[idx].options.push({ item_id: fields.campos[idx].id + iidx, item_nome: fields.campos[idx].nome, item_val: fields.campos[idx].ops[iidx] });
        }

      } else if (fields.campos[idx].tipo == 'number') {
        fields.campos[idx].isNumber = true;
        if (fields.campos[idx].form_col_pos == 1) {
          fields.campos[idx].isFormcol1 = true;
        } else {
          fields.campos[idx].isFormcol2 = true;
        }

      } else if (fields.campos[idx].tipo == 'date') {
        fields.campos[idx].isDate = true;
        if (fields.campos[idx].form_col_pos == 1) {
          fields.campos[idx].isFormcol1 = true;
        } else {
          fields.campos[idx].isFormcol2 = true;
        }

      } else {
        fields.campos[idx].isText = true;
      }

      //Se o campo for do tipo ID, renderiza script JS para alertar duplicidade de ID no navegador...
      if (fields.campos[idx].id == 'ID') {
        fields.campos[idx].isIDField = true;
      }
    }

    //Entraga as informações obtidas para o template...
    res.render('form', { titulo: fields.titulo, ids: ids_existentes, descricao: fields.descricao, form_ref: fields.form_ref, campos: fields.campos, formulario: 'ok' });
    
  } else {
    res.status(404);
    res.render('404');
  }
});


app.post('/processar_formulario/:form_ref/:idnum', function(req, res){ 
  /* form_ref: atributo do formulário que leva à diferentes pares dessa view.
     idnum: número de identificação da mídia, pode assumir o valor 'no_id' nas mídias novas */

  if (req.params.form_ref === 'nova_midia' ) { ///////////////////////////////////////////////////
    if (!req.body.ID) {
      nova_midia_id = make_random_valid_id(req.body.MIDIA)
    } else {
      nova_midia_id = req.body.ID
    }

    //Cria o objeto com as informações completas do formulário...
    nova_midia = {
      ID: nova_midia_id,
      TITULO: req.body.TITULO,
      AUTOR: req.body.AUTOR,
      AUTORESP: req.body.AUTORESP,
      GN: req.body.GN,
      EDITORA: req.body.EDITORA,
      EDICAO: req.body.EDICAO,
      KEYWORD: req.body.KEYWORD,
      MIDIA: req.body.MIDIA,
      RESUMO: req.body.RESUMO,
      DTE: "",
      DTD: "",
      NOME_EMP: "",
      HISTORICO: "",
      STATUS: "Disponível"
    }

    //Insere o objeto no arquivo de dados...
    midia_list = read_json_file("./nfo/midias_metadata.json")
    midia_list.push(nova_midia)
    write_json_file("./nfo/midias_metadata.json", midia_list)

    //Adiciona novo registro à lista rápida, gerada quando o programa é carregado...
    new_fast_data_ob = {
      ID: nova_midia_id,
      TITULO: req.body.TITULO,
      AUTOR: req.body.AUTOR,
      STATUS: "Disponível"
    }
    fast_data.push(new_fast_data_ob);



  } else if (req.params.form_ref === 'atualizar_nfo') { ///////////////////////////////////////////
    target_id = req.params.idnum
    target = find_and_split_midia(target_id, "./nfo/midias_metadata.json")
    midia_atualizada = {
      ID: target[0].ID,
      TITULO: req.body.TITULO,
      AUTOR: req.body.AUTOR,
      AUTORESP: req.body.AUTORESP,
      GN: req.body.GN,
      EDITORA: req.body.EDITORA,
      EDICAO: req.body.EDICAO,
      KEYWORD: req.body.KEYWORD,
      MIDIA: req.body.MIDIA,
      RESUMO: req.body.RESUMO,
      DTE: target[0].DTE,
      DTD: target[0].DTD,
      NOME_EMP: target[0].NOME_EMP,
      HISTORICO: target[0].HISTORICO,
      STATUS: target[0].STATUS
    }
    target[1].push(midia_atualizada)
    write_json_file("./nfo/midias_metadata.json", target[1])

    //Adiciona registro atualizado à lista rápida, gerada quando o programa é carregado...
    update_fast_data_ob = {
      ID: target[0].ID,
      TITULO: req.body.TITULO,
      AUTOR: req.body.AUTOR,
      STATUS: target[0].STATUS
    }
    remove_from_fast_data(target[0].ID)
    fast_data.push(update_fast_data_ob);

  } else if (req.params.form_ref === 'registro_emprestimo' ) { /////////////////////////////////////////////
    target_id = get_id_arg(req.params.idnum, req.body.ID)
    target = find_and_split_midia(target_id, "./nfo/midias_metadata.json")
    midia_atualizada = {
      ID: target[0].ID,
      TITULO: target[0].TITULO,
      AUTOR: target[0].AUTOR,
      AUTORESP: target[0].AUTORESP,
      GN: target[0].GN,
      EDITORA: target[0].EDITORA,
      EDICAO: target[0].EDICAO,
      KEYWORD: target[0].KEYWORD,
      MIDIA: target[0].MIDIA,
      RESUMO: target[0].RESUMO,
      DTE: req.body.DTE,
      DTD: target[0].DTD,
      NOME_EMP: req.body.NOME_EMP,
      HISTORICO: target[0].HISTORICO + " Emprestado para " + req.body.NOME_EMP + " em " + req.body.DTE + ".",
      STATUS: "Emprestado"
    }
    
    //Escrevendo mudanças...
    target[1].push(midia_atualizada)
    write_json_file("./nfo/midias_metadata.json", target[1])

    //Adiciona registro atualizado à lista rápida, gerada quando o programa é carregado...
    update_fast_data_ob = {
      ID: target[0].ID,
      TITULO: target[0].TITULO,
      AUTOR: target[0].AUTOR,
      STATUS: "Emprestado"
    }
    remove_from_fast_data(target[0].ID)
    fast_data.push(update_fast_data_ob);    

  } else if (req.params.form_ref === 'registro_devolucao' ) { ///////////////////////////////////////////////
    target_id = get_id_arg(req.params.idnum, req.body.ID)
    target = find_and_split_midia(target_id, "./nfo/midias_metadata.json")
    midia_atualizada = {
      ID: target[0].ID,
      TITULO: target[0].TITULO,
      AUTOR: target[0].AUTOR,
      AUTORESP: target[0].AUTORESP,
      GN: target[0].GN,
      EDITORA: target[0].EDITORA,
      EDICAO: target[0].EDICAO,
      KEYWORD: target[0].KEYWORD,
      MIDIA: target[0].MIDIA,
      RESUMO: target[0].RESUMO,
      DTE: target[0].DTE,
      DTD: req.body.DTD,
      NOME_EMP: "",
      HISTORICO: target[0].HISTORICO + " Devolvido em " + req.body.DTD + ".",
      STATUS: "Disponível"
    }

    //Gravando...
    target[1].push(midia_atualizada)
    write_json_file("./nfo/midias_metadata.json", target[1])

    //Adiciona registro atualizado à lista rápida, gerada quando o programa é carregado...
    update_fast_data_ob = {
      ID: target[0].ID,
      TITULO: target[0].TITULO,
      AUTOR: target[0].AUTOR,
      STATUS: "Disponível"
    }
    remove_from_fast_data(target[0].ID)
    fast_data.push(update_fast_data_ob);    
  }
  res.redirect(303, '/');
});


////////////////////////////////////////////////////////////////////////////////




// Define página customizada ao status 500, erro interno do servidor.
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500);
  res.render('500');
});


// Define página customizada ao status 404, rota não é encontrada.
app.use(function(req, res) {
  res.type('text/html');
  res.status(404);
  res.render('404');
});


let port = app.get('port');

//Inicia o aplicativo...
app.listen(port, function(){
  console.log(`Node.JS iniciado em http://localhost:${port}/ aperte Ctrl-C para fechar.`);
});
