import express from 'express';
import { request } from 'express';
import {v4 as uuidv4} from 'uuid'

const app = express();
app.use(express.json());

const costumers = []

function getBalance(statement) {
    const balance = statement.reduce((acc, operation) => {
        if (operation.type === 'credit') 
            return acc + operation.amount
        return acc - operation.amount
    }, 0)
    return balance
}

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

/*? Using the middleware function in every request below */
//app.use(verifyIfAccountExists)

app.get("/statement", verifyIfAccountExists, (req, res) => {
    const {costumer} = req
    return res.status(200).json({Statement: costumer.statement})
})

app.post("/deposit",verifyIfAccountExists, (req, res) => {
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

app.post("/withdraw",verifyIfAccountExists, (req, res) => {
    const {amount, description} = req.body
    const {costumer} = req

    if (!amount)
        return res.status(400).json({error: "Bad request missing amount"})
    if (!description)
        return res.status(400).json({error: "Bad request missing description"})

    const balance = getBalance(costumer.statement)

    if (balance < amount) 
        return res.status(400).json({error: "Insufficient funds!"})

    const statementOperations = {
        amount,
        description,
        created_at: new Date(),
        type: "debit",
    }

    costumer.statement.push(statementOperations)

    return res.status(201).send()
})

app.get("/statement/date", (req, res) => {
    const {costumer} = req
    const {date} = req.query

    const dateFormat = new Date(date + " 00:00")

    const statement = costumer.statement.filter(
        (statement) => 
            statement.created_at.toDateString() === 
            new Date(dateFormat).toDateString())

    return res.status(200).json({Statement: statement})

})

app.put("/account", verifyIfAccountExists, (req, res) => {
    const {name} = req.body
    const {costumer} = req

    costumer.name = name

    return res.status(201).send()
})

app.get("/account", verifyIfAccountExists, (req, res) => {
    const {costumer} = req

    return res.status(200).json({User: costumer})
})

app.delete("/account", verifyIfAccountExists, (req, res) => {
    const {costumer} = req

    costumers.splice(costumer, 1)

    return res.status(204).json(costumers)
})


const PORT = 3333
app.listen(PORT)