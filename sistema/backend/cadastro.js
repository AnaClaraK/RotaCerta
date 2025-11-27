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

app.post("/cadastro", async(req,res)=>{
    try{
        const {cpf, empresa, telefone, email} = req.body
        let {senha} = req.body

        senha = senha.trim()

        if (cpf == "") {
            return res.json({"resposta":"Preencha o CPF"})
        } else if (empresa.length == ""){
            return res.json({"resposta":"Preencha o nome da empresa"})
        } else if (email == "") {
            return res.json({"resposta":"Preencha o e-mail"})
        } else if (senha == "") {
            return res.json({"resposta":"Preencha a senha"})
        } else if (telefone.length == ""){
            return res.json({"resposta":"Preencha o número de telefone"})
        }else if (cpf.length !== 11){
            return res.json({"resposta":"O CPF deve ter 11 dígitos. Exemplo: 12345678901 "})
        } else if (senha.length < 6){
            return res.json({"resposta":"A senha deve ter no mínimo 6 caracteres"})
        } else if (!email.includes('@') || !email.includes('.')){
            return res.json({"resposta":"O e-mail deve ter o formato correto"})
        }else if (telefone.length !== 11) {
            return res.json({"resposta":"O telefone deve ter 11 dígitos (com DDD)"});
        }

        let sqlVerificar = `SELECT email FROM clientes WHERE email = ? or empresa = ? or telefone = ? or cpf = ?`
        let [usuariosExistentes] = await conexao.query(sqlVerificar, [email, empresa, telefone, cpf])

        if (usuariosExistentes.length > 0) {
            const usuarioDuplicado = usuariosExistentes[0]

            if (usuarioDuplicado.email === email) {
                return res.status(409).json({"resposta":"Este e-mail já está cadastrado."})
            }
            if (usuarioDuplicado.cpf === cpf) {
                return res.status(409).json({"resposta":"Este CPF já esta cadastrado."})
            }
            if (usuarioDuplicado.empresa === empresa) {
                return res.status(409).json({"resposta":"Esta empresa já esta cadastrada."})
            }
            if (usuarioDuplicado.telefone === telefone) {
                return res.status(409).json({"resposta":"Este telefone já esta cadastrado."})
            }
        }

        const senhaHashed = crypto.createHash("sha256").update(senha).digest("hex") 

        const sqlInsert = `INSERT INTO clientes (cpf, empresa, telefone, email) VALUES (?, ?, ?, ?)`

        let [resultado] = await conexao.query(sqlInsert, [cpf, empresa, telefone, email, senhaHashed])

        if (resultado.affectedRows == 1) {
            return res.status(201).json({"resposta":"Cadastro realizado com sucesso!"})
        } else {
            return res.status(500).json({ "resposta": "Erro inesperado ao salvar no banco." })
        }

    }catch(error){
        console.error("Erro ao salvar no banco de dados:", error)
        return res.status(500).json({ "resposta": "Erro interno do Servidor." })
    }
})