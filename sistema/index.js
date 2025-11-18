const express = require('express') 
const cors = require('cors')
const crypto = require('crypto')
const app = express() 
const porta = 3000 
const mysql = require('mysql2/promise')
app.use(express.json()) 
app.use(cors())

const conexao = require ('./db.js')

app.listen(porta,()=>{ 
    console.log(`Servidor rodando em: http://localhost:${porta}`) 
}) 

// JSON: {
 // "nome_completo": "Joano Jogado",
 // "email" : "joanojogados@gmail.com",
 // "senha": "Joanao8",
 // "caminho_foto": "https://cdn-icons-png.flaticon.com/512/17/17004.png",
 // "rua":"Jertis",
 // "bairro":"Vila Jogos",
 // "cidade":"Jernesville",
 //"uf":"sp",
 // "n_casa":"108",
 // "dt_nasc":"2003-02-28"
// }
// -------------------------------------------------------------------------------------------------------
app.post("/contato", async(req,res)=>{
    try{
        const {nome, email, telefone, empresa, assunto, mensagem} = req.body
    const dt_hr = new Date(); 
    const status = 'Aguardando Leitura';
        
        if (nome == "") {
            return res.json({"resposta":"Preencha o nome"})
        }else if (email == "") {
            return res.json({"resposta":"Preencha o e-mail"})
        }else if (assunto == "") {
            return res.json({"resposta":"Preencha o assunto"})
        }else if (mensagem == "") {
            return res.json({"resposta":"Preencha a mensagem"})
        }else if (empresa == "") {
            return res.json({"resposta":"Preencha o nome da empresa"})
        }else if (email.length < 6){
            return res.json({"resposta":"E-mail inválido"})
        }else if (nome.length < 6){
            return res.json({"resposta":"Preencha seu nome completo"})
        }else if (!email.includes('@') || !email.includes('.')){
            return res.json({"resposta":"O e-mail deve ter o formato correto (ex: @gmail.com ou @hotmail.com)"})
        }
        
        const sql = `insert into contato (nome, email, telefone, empresa, assunto, mensagem, dt_hr, status) VALUES (?,?,?,?,?,?,?,?)`

        let [resultado] = await conexao.query(sql,[nome, email, telefone, empresa, assunto, mensagem, dt_hr, status])

        if (resultado.affectedRows == 1) {
            return res.json({"resposta":"Mensagem enviada com sucesso!"})
        } else {
            return res.status(500).json({ "resposta": "Erro inesperado. Falha no Servidor." })
        }

    }catch(error){
        console.error("Erro ao salvar no banco de dados:", error)
        return res.status(500).json({ "resposta": "Erro inesperado. Falha no Servidor." })
    }
})