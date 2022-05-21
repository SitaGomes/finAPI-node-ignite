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

    if (!cpf) 
        return res.status(400).json({error: "Bad request missing cpf"})

    if (!name) 
        return res.status(400).json({error: "Bad request missing name"})

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

app.use(verifyIfAccountExists)

app.get("/statement", (req, res) => {
    const {costumer} = req
    return res.status(200).json({Statement: costumer.statement})

})

app.post("/deposit", (req, res) => {
    const { description, amount } = req.body
    const {costumer} = req

    if (!description) 
        return res.status(400).json({error: "Bad request missing description"})
    
    if (!amount) 
        return res.status(400).json({error: "Bad request missing amount"})
    
    const statementOperations = {
        description,
        amount,
        created_at: new Date(),
        type: "credit",
    }
    
    costumer.statement.push(statementOperations)

    return res.status(201).send()
})

const PORT = 3333
app.listen(PORT)