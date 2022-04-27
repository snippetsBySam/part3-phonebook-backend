const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

app.use(express.json())
morgan.token('tinyPost', (tokens,req, res) => {
  // tiny config
  let logData = [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms'
  ].join(' ')
  // add response body if post request
  if (req.method === 'POST') {
    return [
      logData,
      JSON.stringify(req.body)
    ].join(' ')
  }
  else {
    return logData
  }
})
app.use(morgan('tinyPost'))
app.use(cors())
app.use(express.static('build'))

// all persons
app.get('/api/persons', (request, response) => {
  response.json(persons)
})

// info endpoint
app.get('/info', (request, response) => {
  let personsCount = persons.length
  let currentTime = Date()
  response.send(`
    <div>
    <p>Phonebook has info for ${personsCount} people</p>
    <p>${currentTime}</p>
    </div>`
  )
})

//single person endpoint
app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

// delete person
app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)
  response.status(204).end()
})

// add person
const generateId = () => Math.floor(Math.random() * 1000)

app.post('/api/persons', (request, response) => {
  const body = request.body
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name AND number required'
    })
  }

  if (persons.find(person => person.name.toLowerCase() === body.name.toLowerCase())) {
    return response.status(400).json({
      error: 'name already exists'
    })
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
  }
  persons = persons.concat(person)
  response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
