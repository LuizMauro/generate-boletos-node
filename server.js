const path = require("path");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const { Bancos, Boletos, StreamToPromise } = require("./lib");
const express = require("express");

const server = express();

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: "API Boleto",
      description: "API Boletos",
      contact: {
        name: "Luiz Mauro",
      },
      servers: ["http://192.168.15.5:3333"],
    },
  },
  apis: ["server.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
server.use("/api/doc", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
server.use(express.json());

//Servindo os boletos url
server.use(
  "/boletos",
  express.static(path.resolve(__dirname, "./", "tmp", "boletos"))
);

server.post("/api/generateBoleto", (req, resp) => {
  const { nomeBoleto } = req.body;

  console.log("chamou -> ", new Date());
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

  resp.json({
    FileBoletoPDF: `http://192.168.15.5:3333/boletos/${nomeBoleto}.pdf`,
  });
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

/**
 * @swagger
 *
 * paths:
 *  /api/generateBoleto:
 *    post:
 *     tags:
 *     - "Boleto"
 *     summary: "Generate Boleto"
 *     operationId: "GenerateBoleto"
 *     produces:
 *     - "application/xml"
 *     - "application/json"
 *     parameters:
 *     - in: "body"
 *       name: "body"
 *       required: true
 *       schema:
 *         $ref: "#/definitions/Boleto"
 *     responses:
 *       default:
 *         description: "successful operation"
 * definitions:
 *  Boleto:
 *   type: "object"
 *   properties:
 *     nomeBoleto:
 *       type: string
 *     bodyBoleto:
 *       type: object
 *       properties:
 *         banco:
 *           type: string
 *         pagador:
 *          type: object
 *          properties:
 *            nome:
 *              type: string
 *            RegistroNacional:
 *              type: string
 *            endereco:
 *              type: object
 *              properties:
 *                cep:
 *                  type: string
 *                logradouro:
 *                  type: string
 *                bairro:
 *                  type: string
 *                cidade:
 *                  type: string
 *                estadoUF:
 *                  type: string
 *         instrucoes:
 *           type: array
 *           items: {}
 *           example:
 *             - Após o vencimento Mora dia R$ 1,59
 *           instrucoes:
 *             type: array
 *             items: {}
 *             example:
 *               - Após o vencimento, multa de 2%!(MISSING)
 *         beneficiario:
 *           type: object
 *           properties:
 *             nome:
 *               type: string
 *             cnpj:
 *               type: string
 *             dadosBancarios:
 *               type: object
 *               properties:
 *                 agencia:
 *                   type: string
 *                 agenciaDigito:
 *                   type: string
 *                 conta:
 *                   type: string
 *                 contaDigito:
 *                   type: string
 *                 nossoNumero:
 *                   type: string
 *                 nossoNumeroDigito:
 *                   type: string
 *                 carteira:
 *                   type: string
 *                 convenio:
 *                   type: string
 *             endereco:
 *               type: object
 *               properties:
 *                 logradouro:
 *                   type: string
 *                 bairro:
 *                   type: string
 *                 cidade:
 *                   type: string
 *                 estadoUF:
 *                   type: string
 *                 cep:
 *                   type: string
 *         boleto:
 *           type: object
 *           properties:
 *             numeroDocumento:
 *               type: string
 *             especieDocumento:
 *               type: string
 *             valor:
 *               type: integer
 *             datas:
 *               type: object
 *               properties:
 *                 vencimento:
 *                   type: string
 *                 processamento:
 *                   type: string
 *                 documentos:
 *                   type: string
 *   xml:
 *     name: "Boleto"
 */
