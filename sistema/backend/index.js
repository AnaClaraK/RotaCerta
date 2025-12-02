const express = require('express')
const cors = require('cors')
const crypto = require('crypto')
const app = express()
const porta = 3000
const mysql = require('mysql2/promise')
const conexao = require('./db.js')

app.use(express.json())
app.use(cors())

// LOGIN
app.post("/login", async (req, res) => {
    try {
        const { email } = req.body
        let { senha } = req.body

        senha = senha.trim()

        if (email == "") {
            return res.status(400).json({ "resposta": "Preencha o e-mail" })
        } else if (!email.includes('@') || !email.includes('.')) {
            return res.status(400).json({ "resposta": "O e-mail deve ter o formato correto" })
        } else if (senha == "") {
            return res.status(400).json({ "resposta": "Preencha a senha" })
        }

        const senhaHashed = crypto.createHash("sha256").update(senha).digest("hex")

        const sql = `SELECT * FROM cadastro WHERE email = ?`

        let [usuarios] = await conexao.query(sql, [email])
        
        if (usuarios.length === 0) {
            return res.status(401).json({ "resposta": "E-mail ou senha inválidos." })
        }

        const usuario = usuarios[0]
        
        if (usuario.senha === senhaHashed) {
            return res.json({ "resposta": "Login realizado com sucesso!" })
        } else {
            return res.status(401).json({ "resposta": "E-mail ou senha inválidos." })
        }

    } catch (error) {
        console.error("Erro no processo de login:", error)
        return res.status(500).json({ "resposta": "Erro interno do Servidor." })
    }
})

app.listen(porta, () => { 
    console.log(`Servidor rodando em: http://localhost:${porta}`)
})

// CONTATO
app.post("/contato", async(req,res)=>{
    try{
        const {nome, email, telefone, empresa, assunto, mensagem} = req.body
    const dt_hr = new Date(); 
    const status = 'Aguardando Leitura';
        
        if (nome == "") {
            return res.status(400).json({"resposta":"Preencha o nome"})
        }else if (email == "") {
            return res.status(400).json({"resposta":"Preencha o e-mail"})
        }else if (assunto == "") {
            return res.status(400).json({"resposta":"Preencha o assunto"})
        }else if (mensagem == "") {
            return res.status(400).json({"resposta":"Preencha a mensagem"})
        }else if (empresa == "") {
            return res.status(400).json({"resposta":"Preencha o nome da empresa"})
        }else if (email.length < 6){
            return res.status(400).json({"resposta":"E-mail inválido"})
        }else if (nome.length < 6){
            return res.status(400).json({"resposta":"Preencha seu nome completo"})
        }else if (!email.includes('@') || !email.includes('.')){
            return res.status(400).json({"resposta":"O e-mail deve ter o formato correto (ex: @gmail.com ou @hotmail.com)"})
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

//CADASTRO
app.post("/cadastro", async(req,res)=>{
    try{
        const {cpf, empresa, telefone, email} = req.body
        let {senha} = req.body

        senha = senha.trim()

        if (cpf.length == "") {
            return res.status(400).json({"resposta":"Preencha o CPF"})
        } else if (empresa.length == ""){
            return res.status(400).json({"resposta":"Preencha o nome da empresa"})
        } else if (email.length == "") {
            return res.status(400).json({"resposta":"Preencha o e-mail"})
        } else if (senha.length == "") {
            return res.status(400).json({"resposta":"Preencha a senha"})
        } else if (telefone.length == ""){
            return res.status(400).json({"resposta":"Preencha o número de telefone"})
        }else if (cpf.length !== 11){
            return res.status(400).json({"resposta":"O CPF deve ter 11 dígitos. Exemplo: 12345678901 "})
        } else if (senha.length < 6){
            return res.status(400).json({"resposta":"A senha deve ter no mínimo 6 caracteres"})
        } else if (!email.includes('@') || !email.includes('.')){
            return res.status(400).json({"resposta":"O e-mail deve ter o formato correto"})
        }else if (telefone.length !== 11) {
            return res.status(400).json({"resposta":"O telefone deve ter 11 dígitos (com DDD)"});
        }

        let sqlVerificar = `SELECT email FROM cadastro WHERE email = ? or empresa = ? or telefone = ? or cpf = ?`
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

        const sqlInsert = `INSERT INTO cadastro (cpf, empresa, telefone, email, senha) VALUES (?, ?, ?, ?, ?)`

        let [resultado] = await conexao.query(sqlInsert, [cpf, empresa, telefone, email, senhaHashed])

        if (resultado.affectedRows == 1) {
            return res.status(201).json({"resposta":"Cadastro realizado com sucesso! Faça login para continuar."})
        } else {
            return res.status(500).json({ "resposta": "Erro inesperado ao salvar no banco." })
        }

    }catch(error){
        console.error("Erro ao salvar no banco de dados:", error)
        return res.status(500).json({ "resposta": "Erro interno do Servidor." })
    }
})
