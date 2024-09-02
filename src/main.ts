import express = require('express')
import {GenerateRandomToken} from "./auth/token";
const app = express()
app.use([
    express.text({
        type: "text/plain",
    }),
    express.json({
        type: "application/json",
    }),
    express.urlencoded({
        type: "application/x-www-form-urlencoded",
    })
])
app.post('/new', (_, res) => {
    let token: string = GenerateRandomToken()
    res.end(token)
})
app.post('/end', (req, res) => {

})
app.listen(8080,() => {
    console.log('Server started. Listening on 8080.')
})