const { request, response } = require("express")
const jwt = require('jsonwebtoken');



const validarjwt = ( req = request, res = response, next) => {

    const token = req.header('x-token');

    if(!token){

        return res.status(401).json({
            ok:   false,
            msg:  'token no definido'
        });
    }

    try{

        const { id , username } = jwt.verify(token, process.env.SECRET_JWT_SEED);

        req.rfc = id;
        req.username = username;

    }catch(err){

        return res.status(401).json({
            ok:   false,
            msg:  'Token no válido'
        });

    }

    next();

}

module.exports  = {
    validarjwt
}