const path = require("path");
const { Bancos, Boletos, StreamToPromise } = require("./lib");
const express = require("express");

const server = express();

server.use(express.json());

//Servindo os boletos url
server.use(
  "/boletos",
  express.static(path.resolve(__dirname, "./", "tmp", "boletos"))
);

//Rota gerar boleto
server.post("/generateBoleto", (req, resp) => {
  const { nomeBoleto } = req.body;

  req.body.bodyBoleto.banco = new Bancos[req.body.bodyBoleto.banco]();

  const novoBoleto = new Boletos(req.body.bodyBoleto);
  novoBoleto.gerarBoleto();

  novoBoleto
    .pdfFile({ fileName: nomeBoleto })
    .then(async ({ stream }) => {
      await StreamToPromise(stream);
    })
    .catch((error) => {
      console.log("ERROR -> ", error);
      resp.json({ error: error });
    });

  resp.json({ file: `http://192.168.15.5:3333/boletos/${nomeBoleto}.pdf` });
});

server.listen(3333);

//Exemplo json
// {
// 	"nomeBoleto": "Nome_Boleto_1",
// 	"bodyBoleto": {
// 		"banco": "Bradesco",
// 		"pagador": {
//     "nome": "Zé bene",
//     "RegistroNacional": "12345678",
//     "endereco": {
//       "logradouro": "Rua Pedro Lessa, 15",
//       "bairro": "Centro",
//       "cidade": "Rio de Janeiro",
//       "estadoUF": "RJ",
//       "cep": "20030-030"
//     }
//   },
//   "instrucoes": [
//     "Após o vencimento Mora dia R$ 1,59",
//     "Após o vencimento, multa de 2%",
//     "teste instrução1",
// 		"teste instrução2",
// 		"teste instrução3"
//   ],
//   "beneficiario": {
//     "nome": "Empresa Fictícia LTDA",
//     "cnpj": "43576788000191",
//     "dadosBancarios": {
//       "carteira": "09",
//       "agencia": "0101",
//       "agenciaDigito": "5",
//       "conta": "0326446",
//       "contaDigito": "0",
//       "nossoNumero": "00000000061",
//       "nossoNumeroDigito": "8"
//     },
//     "endereco": {
//       "logradouro": "Rua Pedro Lessa, 15",
//       "bairro": "Centro",
//       "cidade": "Rio de Janeiro",
//       "estadoUF": "RJ",
//       "cep": "20030-030"
//     }
//   },
//   "boleto": {
//     "numeroDocumento": "1001",
//     "especieDocumento": "DM",
//     "valor": 0,
//     "datas": {
//       "vencimento": "02-04-2020",
//       "processamento": "02-04-2019",
//       "documentos": "02-04-2019"
//     }
//   }
//  }
// }
