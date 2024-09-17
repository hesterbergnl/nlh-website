import express from 'express'
const app = express()
app.use(express.json())

const PORT = 3000

app.get('/ping', (_req, res) => {
    console.log('someone pinged here!')
    res.status(200).send('Welcome!')
})

app.listen(PORT, () => {
    console.log('listening on port', PORT)
})