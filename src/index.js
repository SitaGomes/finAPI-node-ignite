import express from 'express';
import { request } from 'express';
import {v4 as uuidv4} from 'uuid'

const app = express();
app.use(express.json());

const costumers = []

//* Middleware
function verifyIfAccountExists(req, res, next) {
    const { cpf } = req.headers

    const costumer = costumers.find((costumer) => costumer.cpf === cpf)

    if (!costumer)
        return res.status(400).json({Error: 'Costumer not found'})

    request.costumer = costumer

    return next()
}

app.post('/account', (req, res) => {
    const {cpf, name} = req.body

    const costumerAlreadyExists = costumers.some(
        (costumers) => costumers.cpf === cpf 
    )

    if (costumerAlreadyExists) 
        return res.status(400).json({Error: 'Customer already exists'})

    costumers.push({
        name, 
        cpf,
        id: uuidv4(),
        statement: []
    })

    return res.status(201).send()

})

//app.use(verifyIfAccountExists)

app.get("/statement", verifyIfAccountExists, (req, res) => {
    const {costumer} = req
    return res.status(200).json({Statement: costumer.statement})

})

const PORT = 3333
app.listen(PORT)