const express = require('express')
const graphqlHTTP = require('express-graphql')
const schema = require('./schema/schema')
const mongoose = require('mongoose')
const auth = require('./utils/auth')

console.log(process.env.SECRET_KEY_JWT_COURSE_API)

mongoose.connect('mongodb://localhost/graphqlnode', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})
  .then(() => console.log("Conectado a MongoDB correctamente"))
  .catch(error => console.log("No se ha conectado a MongoDB"))

  const app = express()

  app.use(
    auth.checkHeaders
  )

app.use('/graphql', graphqlHTTP((req) => {
    return {
        schema,
        context: {
            user: req.user
        },
        graphiql:true // Esto saca la documnetación de GraphQL
    }
}))

app.listen(3131, () => {
    console.log("Escuchando en el puerto: 3131")
})