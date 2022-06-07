import express from 'express'
import { connectToDatabase } from '../utils/mongodb.js'
import { check, validationResult } from 'express-validator'
const router = express.Router()
const nomeCollection = 'filmes'
const { db, ObjectId } = await connectToDatabase()

/**********************************************
 * Validações
 * 
 **********************************************/
const validaFilme = [
    check('genero')
        .not().isEmpty().trim().withMessage('É obrigatório informar o genero do filme')
        .isIn(['Ação', 'Terror', 'Drama', 'Comédia', 'Documentário']).withMessage('O genêro informado deve ser Ação, Terror, Drama, Comédia ou Documentário'),
    check('nome')
        .not().isEmpty().trim().withMessage('É obrigatório informar o nome do filme')
        .isLength({ min: 2 }).withMessage('O nome do filme informado é muito curto. Informe ao menos 2 caracteres')
        .isLength({ max: 100 }).withMessage('O nome do filme informado é muito longo. Informe ao máximo 100 caracteres'),
    check('diretor')
        .not().isEmpty().trim().withMessage('É obrigatório informar o nome do diretor')
        .isLength({ min: 2 }).withMessage('O nome do diretor é muito curto. Informe ao menos 2 caracteres')
        .isLength({ max: 100 }).withMessage('O nome do diretor é muito longo. Informe no máximo 100 caracteres'),
    check('ano')
        .not().isEmpty().trim().withMessage('É obrigatório informar o ano que o filme foi lançado')
        .isNumeric().withMessage('O ano só pode conter números')
        .isLength({ min: 3 }).withMessage('O ano digitado não pode ser usado. Informe um ano entre 1900 a 2025')
        .isLength({ max: 4 }).withMessage('O ano digitado não pode ser usado. Informe um ano entre 1900 a 2025'),
    check('nota')
        .not().isEmpty().trim().withMessage('É obrigatório informar a nota do filme')
        .isNumeric().withMessage('a nota só pode conter números de 0 a 10')
        .isLength({ min: 0 }).withMessage('O numero digitado não pode ser usado. Informe um número entre 0 a 10')
        .isLength({ max: 2 }).withMessage('O numero digitado não pode ser usado. Informe um número entre 0 a 10'),
    
]

/**********************************************
 * GET /api/filmes
 **********************************************/
router.get('/', async (req, res) => {
    try {
        db.collection(nomeCollection).find({}, {
            projection: { senha: false }
        }).sort({ nome: 1 }).toArray((err, docs) => {
            if (!err) {
                res.status(200).json(docs)
            }
        })
    } catch (err) {
        res.status(500).json({
            errors: [
                {
                    value: `${err.message}`,
                    msg: 'Erro ao obter a listagem dos filmes',
                    param: '/'
                }
            ]
        })
    }
})

/**********************************************
 * GET /filmes/user_id/:user_id
 **********************************************/
router.get("/user_id/:user_id", async (req, res) => {
    try {
        db.collection(nomeCollection).find({ "user_id": { $eq: (req.params.user_id) } }).toArray((err, docs) => {
            if (err) {
                res.status(400).json(err)
            } else {
                res.status(200).json(docs)
            }
        })
    } catch (err) {
        res.status(500).json({ "error": err.message })
    }
})

/**********************************************
 * GET /filmes/razao/:razao
 **********************************************/
router.get("/razao/:razao", async (req, res) => {
    try {
        db.collection(nomeCollection).find({ razao_social: { $regex: req.params.razao, $options: "i" } }).toArray((err, docs) => {
            if (err) {
                res.status(400).json(err)
            } else {
                res.status(200).json(docs)
            }
        })
    } catch (err) {
        res.status(500).json({ "error": err.message })
    }
})

/**********************************************
 * POST /filmes/
 **********************************************/
router.post('/', validaFilme, async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json(({
            errors: errors.array()
        }))
    } else {
        await db.collection(nomeCollection)
            .insertOne(req.body)
            .then(result => res.status(201).send(result))
            .catch(err => res.status(400).json(err))
    }
})

/**********************************************
 * PUT /filmes
 * Alterar um filme pelo ID
 **********************************************/
router.put('/', validaFilme, async (req, res) => {
    let idDocumento = req.body._id
    delete req.body._id
    const schemaErrors = validationResult(req)
    if (!schemaErrors.isEmpty()) {
        return res.status(403).json(({
            errors: schemaErrors.array()
        }))
    } else {
        await db.collection(nomeCollection)
            .updateOne({ '_id': { $eq: ObjectId(idDocumento) } },
                { $set: req.body }
            )
            .then(result => res.status(202).send(result))
            .catch(err => res.status(400).json(err))
    }
})

/**********************************************
 * DELETE /filmes/
 **********************************************/
router.delete('/:id', async (req, res) => {
    await db.collection(nomeCollection)
        .deleteOne({ "_id": { $eq: ObjectId(req.params.id) } })
        .then(result => res.status(202).send(result))
        .catch(err => res.status(400).json(err))
})

export default router