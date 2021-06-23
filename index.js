const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const mysql = require('mysql');
const path = require('path');
const myconnection = require('express-myconnection');
const { database } = require('./database/keys');


//CORS

app.use(cors());


// Lectura y Parseo del Body

app.use( express.json() );


//Conexión con MySQL

app.use(myconnection(mysql, database, 'pool'));



app.use(express.urlencoded({ extended: false }));


// Directorio publico

app.use(express.static('public'))


//Routes
app.use('/api/auth', require('./routes/auth'));

app.get( '*' , (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public/index.html'));
});


app.listen(process.env.PORT , () => {
    console.log(`Esta activo en el puerto ${ process.env.PORT }`);
});