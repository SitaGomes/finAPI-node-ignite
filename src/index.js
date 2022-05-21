import express from 'express';
import {v4 as uuidv4} from 'uuid'

const app = express();
app.use(express.json());

const costumers = []

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

app.get('/account', (req, res) => {
    return res.status(201).send()
})

const PORT = 3333
app.listen(PORT)