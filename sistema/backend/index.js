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
app.post("/login", async(req,res)=>{
    const senhaHashed = crypto.createHash("sha256").update(senha).digest("hex")
    const sql = `SELECT * FROM clientes WHERE email = ?`

    let [usuarios] = await conexao.query(sql, [email])

    if (usuarios.length === 0) {
        return res.status(401).json({"resposta": "E-mail ou senha inválidos."})
    }
    const usuario = usuarios[0] 
    if (usuario.senha === senhaHashed) {
        return res.json({"resposta":"Login realizado com sucesso!"})
    } else {
        return res.status(401).json({"resposta": "E-mail ou senha inválidos."})
    }
    
})
