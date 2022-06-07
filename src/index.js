import express from 'express'
import cors from 'cors'
import rotasUsuarios from './routes/usuarios.js'
import rotasPrestadores from './routes/filmes.js'

const app = express();
const port = process.env.PORT || 4000

app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.disable('x-powered-by')

// Rotas do conteúdo público 
app.use('/', express.static('public'))

// Rota default
app.get('/api', (req, res) => {
    res.status(200).json({
        message: 'API filmesLocadora rodando!',
        version: '1.0.0'
    })

})

//Rotas 
app.use('/api/usuarios', rotasUsuarios)
app.use('/api/filmes', rotasPrestadores)

app.use(function (req, res) {
    res.status(404).json({
        errors: [
            {
                value: `${req.originalUrl}`,
                msg: `Rota ${req.originalUrl} não existe`,
                param: 'routes'
            }
        ]
    }
    )
})

app.listen(port, function () {
    console.log(`Servidor rodando na porta ${port}`)
})

