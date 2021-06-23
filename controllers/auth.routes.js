const { response, request } = require('express');
const bcrypt = require('bcryptjs');
const { jwtgenerate } = require('../helpers/jwt');
const nodemailer = require('nodemailer');


const createUser = async(req = request , res = response ) => {

    const { email , password , username , rfc , type , userdata } = req.body;

    const salt = bcrypt.genSaltSync();

    const pass = bcrypt.hashSync( password , salt);

    const token = await jwtgenerate( rfc , username );

    const data = {

        PROVEMAIL    : email,
        PROVPASS     : pass,
        PROVNAME     : username,
        PROVRFC      : rfc,
        PROVTYPE     : type,
        PROVUSERDATA : userdata
        
    };

    req.getConnection((err, conn ) => {

        conn.query('SELECT * FROM CUSTOMER WHERE PROVRFC = ? ' , [rfc] , (err, status) =>{
            
            if(err){
                return res.status(400).json({
                    ok:   false,
                    msg:  'No existe el ticket'
                });
            }

            if(status[0] != null){   
                return res.status(400).json({
                    ok:   false,
                    msg:  'Usuario ya registrado'
                });
            }else{
                try{
                    conn.query('INSERT INTO CUSTOMER set ? ', [data] , (err, results) => {
                        if (err){
                            return res.status(400).json({
                                ok:   false,
                                msg: `Usuario ya registrado`
                            });
                        }else{
                            return res.status(201).json({
                                ok: true,
                                msg: 'Se ha creado el usuario',
                                username,
                                token
                            });
                        }
                    });
                }catch(error){
                    return res.status(400).json({
                        ok:   false,
                        msg:  error
                    });
                }
            }
        })
    });

}

const saveprofile = async(req = request, res = response) => {
    
        const { nombre , 
                razonsocial , 
                address , 
                numaddress , 
                colonia , 
                city ,
                state ,  
                phone ,
                rfc, 
                username,
                zip,
                userdata } = req.body;

        const data = {

            PROVNAME       : nombre , 
            PROVRAZONSOCIAL: razonsocial , 
            PROVADDRESS    : address , 
            PROVNUM        : numaddress , 
            PROVCOUNTRY    : colonia , 
            PROVCITY       : city ,
            PROVSTATE      : state,  
            PROVPHONE      : phone,
            PROVZIP        : zip,
            PROVUSERDATA   : userdata

        };

        req.getConnection((err, conn ) => {

            conn.query('SELECT * FROM CUSTOMER WHERE PROVRFC = ? ' , [rfc] , (err, status) =>{
                
                if(err){
                    return res.status(400).json({
                        ok:   false,
                        msg:  'No existe el usuario'
                    });
                }
    
                if(status[0] == null){   
                    return res.status(400).json({
                        ok:   false,
                        msg:  'No existe el usuario'
                    });
                }else{
                    try{
                        conn.query('UPDATE CUSTOMER set ? WHERE PROVRFC = ? ', [ data , rfc ], (err, resp) => {
        
                            if(resp){
        
                                return res.status(201).json({
                                    ok: true,
                                    msg: 'Se ha actualizado la información',
                                    rfc,
                                    username
                                });
                            }else{
                                return res.status(400).json({
                                    ok:   false,
                                    msg:  error
                                });
                            }
                        });
                        
                    }catch(err){
                        return res.status(400).json({
                            ok:   false,
                            msg:  error
                        });
                    }
                }
            })
        });
}

const LoginUser = async(req = request , res = response) => {

    const { email , password } = req.body;

    let rfc = '', emailreq = '', type='' ,  pass = '';

    req.getConnection(( err , conn ) => {
        conn.query('SELECT * FROM CUSTOMER WHERE PROVEMAIL = ? ', email , async(err, results) => {

            try{
                results.forEach(element => {
                    pass = element['PROVPASS'];
                    rfc  = element['PROVRFC'];
                    emailreq = element['PROVEMAIL'];
                    type = element['PROVTYPE'];
                    username = element['PROVNAME'];
                });
                let validpass = bcrypt.compareSync(password, pass);

                if(!validpass){
                    return res.status(401).json({
                        ok:   false,
                        msg:  err
                    });
                }else{
                    const token = await jwtgenerate( rfc , username );

                    return res.json({
                        ok: true,
                        msg: 'Se ha logueado el usuario',
                        token,
                        rfc,
                        type
                    });
                }

            }catch(error){
                return res.status(400).json({
                    ok:   false,
                    msg:  error
                });
            }

        });
    });
}

const RenewToken = async(req = request , res = response) => {

    const { rfc , username } = req;

    const token = await jwtgenerate( rfc  , username );  

    return res.json({
        ok: true,
        msg: 'Token renovado',
        token,
        rfc,
        username
    });
}

const obtaindata = async(req = request, res = response) => {
        
    const { rfc , username } = req;

    const token = await jwtgenerate( rfc , username );

    const data = req.getConnection(( error , conn ) => {
        
        try{
            conn.query('SELECT * FROM tickets WHERE RFC_ID = ?', [rfc], ( err , resp ) => {
                
                if(resp){
                    res.status(201).json({
                        ok: true,
                        msg: 'Se ha realizado con éxito',
                        token,
                        resp
                    });
                }else{
                    res.status(400).json({
                        ok:   false,
                        msg:  'Favor de verificar con el administrador'
                    });
                }

            });
        }catch(err){
            res.status(400).json({
                ok:   false,
                msg:  'Favor de verificar con el administrador'
            });
        }
    })

    return data;

}

const adminobtaindata = async(req = request, res = response) => {
        
    const { rfc , username } = req;


    const token = await jwtgenerate( rfc , username );

    const data = req.getConnection(( error , conn ) => {
        
        try{
            conn.query('SELECT * FROM tickets', ( err , resp ) => {
                
                if(resp){
                    res.status(201).json({
                        ok: true,
                        msg: 'Se ha obtenido con éxito',
                        token,
                        resp
                    });
                }else{

                }

            });
        }catch(err){
            res.status(400).json({
                ok:   false,
                msg:  'Favor de verificar con el administrador'
            });
        }
    })
    return data;
}

const createticket = async(req = request, res = response) => {
    
    const { cargaaddress, entregaaddress, cargatime, cargadate, entregatime, entregadate, product, cantidad, producttype , rfc , username } = req.body;

    const token = await jwtgenerate( rfc , username );											

    const data = {

        PROVCARGAADDRESS          : cargaaddress,
        PROVENTREGAADDRESS        : entregaaddress,
        PROVCARGATIME             : cargatime,
        PROVCARGADATE             : cargadate,
        PROVENTREGACLIENTTIME     : entregatime,
        PROVENTREGACLIENTDATE     : entregadate,
        PROVPRODUCT               : product,
        PROVCANTIDAD              : cantidad,
        PROVEMPRESA               : 'En Proceso',
        PROVSTATUS                : 'En Proceso',
        PROVTIPO                  : producttype,
        RFC_ID                    : rfc


    };

    req.getConnection(( err , conn ) => {
            try{
                conn.query('INSERT INTO Tickets set ? ', [data] , (err, results) => {
                    if (err){
                        return res.status(400).json({
                            ok:   false,
                            msg: `Pedido no realizado`
                        });
                    }else{
                        return res.status(201).json({
                            ok: true,
                            msg: 'Pedido Realizado',
                            username,
                            token
                        });
                    }
                });
            }catch(error){
                return res.status(400).json({
                    ok:   false,
                    msg:  error
                });
            }
    });
}

const refticket = async(req = request, res = response) => {
    
    const { cargaaddress    ,
            entregaaddress  ,
            cargatime       ,
            cargadate       ,
            entregatime     ,
            entregadate     ,
            product         ,
            cantidad        ,
            empresa         ,
            status          ,
            adminasign      ,
            chofer          ,
            rfc             ,
            unidad          ,
            cartaporte      , 
            producttype      } = req.body;										

    const data = {

        PROVCARGAADDRESS          : cargaaddress,
        PROVENTREGAADDRESS        : entregaaddress,
        PROVCARGATIME             : cargatime,
        PROVCARGADATE             : cargadate,
        PROVENTREGACLIENTTIME     : entregatime,
        PROVENTREGACLIENTDATE     : entregadate,
        PROVPRODUCT               : product,
        PROVCANTIDAD              : cantidad,
        PROVEMPRESA               : empresa,
        PROVCHOFER                : chofer,
        PROVASIGN                 : adminasign,
        PROVCP                    : cartaporte,
        PROVSTATUS                : status,
        PROVTIPO                  : producttype,
        PROVUNIDAD                : unidad,
        RFC_ID                    : rfc

    };

    req.getConnection((err, conn ) => {

        conn.query('SELECT * FROM CUSTOMER WHERE PROVRFC = ? ' , [rfc] , (err, status) =>{
            
            if(err){
                return res.status(400).json({
                    ok:   false,
                    msg:  'No existe el ticket'
                });
            }

            if(status[0] == null){   
                return res.status(400).json({
                    ok:   false,
                    msg:  'No existe el ticket'
                });
            }else{
                try{
                    conn.query('INSERT INTO Tickets set ? ', [data] , (err, results) => {
                        if (err){
                            return res.status(400).json({
                                ok:   false,
                                msg: `Pedido no realizado`
                            });
                        }else{
                            return res.status(201).json({
                                ok: true,
                                msg: 'Pedido Realizado'
                            });
                        }
                    });
                }catch(error){
                    return res.status(400).json({
                        ok:   false,
                        msg: `Pedido no realizado`
                    });
                }
            }
        })
    });
}

const asfticket = async(req = request, res = response) => {
    
    const { cargaaddress    ,
            entregaaddress  ,
            cargatime       ,
            cargadate       ,
            product         ,
            cantidad        ,
            empresa         ,
            status          ,
            adminasign      ,
            rfc             ,
            unidad          ,
            chofer          ,
            cartaporte      , 
            producttype } = req.body;										

    const data = {

        PROVCARGAADDRESS     : cargaaddress    ,
        PROVENTREGAADDRESS   : entregaaddress  ,
        PROVCARGATIME        : cargatime       ,
        PROVCARGADATE        : cargadate       ,
        PROVPRODUCT          : product         ,
        PROVCANTIDAD         : cantidad        ,
        PROVEMPRESA          : empresa         ,
        PROVSTATUS           : status          ,
        PROVASIGN            : adminasign      ,
        RFC_ID               : rfc             ,
        PROVUNIDAD           : unidad          ,
        PROVCHOFER           : chofer          ,
        PROVCP               : cartaporte      , 
        PROVTIPO             : producttype 

    };

    req.getConnection(( err , conn ) => {
            try{
                conn.query('INSERT INTO Tickets set ? ', [data] , (err, results) => {
                    if (err){
                        return res.status(400).json({
                            ok:   false,
                            msg: `Pedido No realizado`
                        });
                    }else{
                        return res.status(201).json({
                            ok: true,
                            msg: 'Pedido Realizado'
                        });
                    }
                });
            }catch(error){
                return res.status(400).json({
                    ok:   false,
                    msg:  'Pedido No Realizado'
                });
            }
    });
}

const adminasign = async(req = request, res = response) => {
    
    const { folio, empresa , entregadate , adminuser, unidad , chofer, cartaporte, status , rfc } = req.body;

    const data = {

        PROVEMPRESA               : empresa,
        PROVENTREGACLIENTDATE     : entregadate,
        PROVASIGN                 : adminuser, 
        PROVUNIDAD                : unidad,     
        PROVCHOFER                : chofer,
        PROVCP                    : cartaporte,
        PROVSTATUS                : status,

    };

    req.getConnection((err, conn ) => {

        conn.query('SELECT * FROM Tickets WHERE TICKETID = ? ' , [folio] , (err, status) =>{
            
            if(err){
                return res.status(400).json({
                    ok:   false,
                    msg:  'No existe el ticket'
                });
            }

            if(status[0] == null){   
                return res.status(400).json({
                    ok:   false,
                    msg:  'No existe el ticket'
                });
            }else{
                try{
                    conn.query('UPDATE tickets set ? WHERE TICKETID = ? ', [ data , folio ], (err, resp) => {
        
                        if(resp){
                            return res.status(201).json({
                                ok: true,
                                msg: 'Se ha actualizado la información',
                                rfc
                            });
                        }else{
                            return res.status(400).json({
                                ok:   false,
                                msg:  err
                            });
                        }
                    });
                }catch(err){
                    return res.status(400).json({
                        ok:   false,
                        msg:  'No se ha actualizado el ticket'
                    });
                }
            }
        })
    });
}

const refupdate = async(req = request, res = response) => {

    const { folio,
            status,
            pemexllegadatime,
            pemexllegadadate,
            pemexsalidatime,
            pemexsalidadate,
            entregaclienttime,
            entregaclientdate ,
            salidaclienttime,
            salidaclientdate,
            geocerca,
            kilometraje ,
            sello ,
            costo , 
            observaciones } = req.body;

    const data = {

        PROVSTATUS              : status,
        PROVPEMEXLLEGADATIME    : pemexllegadatime,
        PROVPEMEXLLEGADADATE    : pemexllegadadate,
        PROVPEMEXSALIDATIME     : pemexsalidatime,
        PROVPEMEXSALIDADATE     : pemexsalidadate,
        PROVENTREGACLIENTTIME   : entregaclienttime, 
        PROVENTREGACLIENTDATE   : entregaclientdate, 
        PROVSALIDACLIENTTIME    : salidaclienttime,
        PROVSALIDACLIENTDATE    : salidaclientdate,
        PROVGEOCERCA            : geocerca,
        PROVKILOMETRAJE         : kilometraje,
        PROVSELLO               : sello,     
        PROVCOSTO               : costo,
        PROVOBSERVACIONES       : observaciones
    };

    req.getConnection((err, conn ) => {

        conn.query('SELECT * FROM Tickets WHERE TICKETID = ? ' , [folio] , (err, status) =>{
            
            if(err){
                return res.status(400).json({
                    ok:   false,
                    msg:  'No existe el ticket'
                });
            }

            if(status[0] == null){   
                return res.status(400).json({
                    ok:   false,
                    msg:  'No existe el ticket'
                });
            }else{
                try{
                    conn.query('UPDATE tickets set ? WHERE TICKETID = ? ', [ data , folio ], (err, resp) => {
        
                        if(resp){
                            return res.status(201).json({
                                ok: true,
                                msg: 'Se ha actualizado la información'
                            });
                        }else{
                            return res.status(400).json({
                                ok:   false,
                                msg:  'No se ha actualizado la información'
                            });
                        }
                    });
                }catch(err){
                    return res.status(400).json({
                        ok:   false,
                        msg:  'No se ha actualizado la información'
                    });
                }
            }
        })
    });

}

const asfaltupdate =  async(req = request, res = response) => {

    const { folio,
            status,
            pemexllegadadate,
            pemexsalidadate,
            entregaclientdate,
            kilometraje,
            tanque,
            gastos,
            costo,
            observaciones} = req.body;

    const data = {

        PROVSTATUS              : status,
        PROVPEMEXLLEGADADATE    : pemexllegadadate,
        PROVPEMEXSALIDADATE     : pemexsalidadate,
        PROVENTREGACLIENTDATE   : entregaclientdate, 
        PROVKILOMETRAJE         : kilometraje,
        PROVTANQUE              : tanque,
        PROVCOSTO               : costo,
        PROVGASTOS              : gastos,
        PROVOBSERVACIONES       : observaciones

    };

    req.getConnection((err, conn ) => {

        conn.query('SELECT * FROM Tickets WHERE TICKETID = ? ' , [folio] , (err, status) =>{
            
            if(err){
                return res.status(400).json({
                    ok:   false,
                    msg:  'No existe el ticket'
                });
            }

            if(status[0] == null){   
                return res.status(400).json({
                    ok:   false,
                    msg:  'No existe el ticket'
                });
            }else{
                try{
                    conn.query('UPDATE tickets set ? WHERE TICKETID = ? ', [ data , folio ] , (err, resp) => {
        
                        if(resp){
                            return res.status(201).json({
                                ok: true,
                                msg: 'Se ha actualizado el ticket'
                            });
                        }else{
                            return res.status(400).json({
                                ok:   false,
                                msg:  'No se ha actualizado el ticket'
                            });
                        }
                    });
                }catch(err){
                    return res.status(400).json({
                        ok:   false,
                        msg:  'No se ha actualizado la información'
                    });
                }
            }
        })
    });
}

const cancelticket = async(req = request, res = response) => {

    const { folio , status , cancel } = req.body;

    const data = {
        PROVSTATUS : status,
        PROVOBSERVACIONES: cancel
    };

    
    req.getConnection((err, conn ) => {

        conn.query('SELECT * FROM Tickets WHERE TICKETID = ? ' , [folio] , (err, status) =>{
            
            if(err){
                return res.status(400).json({
                    ok:   false,
                    msg:  'No existe el ticket'
                });
            }

            if(status[0] == null){   
                return res.status(400).json({
                    ok:   false,
                    msg:  'No existe el ticket'
                });
            }else{
                try{
            
                    conn.query('UPDATE tickets set ? WHERE TICKETID = ? ', [ data , folio ], (err, resp) => {
        
                        if(resp){
                            return res.status(201).json({
                                ok: true,
                                msg: 'Se ha actualizado la información'
                            });
                        }else{
                            return res.status(400).json({
                                ok:   false,
                                msg:  'No pudo cancelarse el ticket'
                            });
                        }
        
                    });
                    
                }catch(err){
                    return res.status(400).json({
                        ok:   false,
                        msg:  'No pudo cancelarse el ticket'
                    });
                }
            }
        })
    });
}

const facturarticket = async( req = request , res = response ) => {

    const { folio , status , factura } = req.body;

    const data = {

        PROVSTATUS: status,
        PROVFACTURA: factura

    }

    req.getConnection((err, conn ) => {

        conn.query('SELECT * FROM Tickets WHERE TICKETID = ? ' , [folio] , (err, status) =>{
            
            if(err){
                return res.status(400).json({
                    ok:   false,
                    msg:  'No existe el ticket'
                });
            }

            if(status[0] == null){   
                return res.status(400).json({
                    ok:   false,
                    msg:  'No existe el ticket'
                });
            }else{
                try{
                    conn.query('UPDATE tickets set ? WHERE TICKETID = ? ', [ data , folio ], (err, resp) => {
        
                        if(resp){
                            return res.status(201).json({
                                ok: true,
                                msg: 'Se ha actualizado la información'
                            });
                        }else{
                            return res.status(400).json({
                                ok:   false,
                                msg:  'No se ha actualizado la información'
                            });
                        }
                    });
                }catch(err){
                    return res.status(400).json({
                        ok:   false,
                        msg:  'No se ha actualizado la información'
                    });
                }
            }
        })
    });
}

const forgotpass = async( req = request , res = response) => {

    const { email } = req.body;

    let rfc , username;

    req.getConnection((err, conn ) => {

        conn.query('SELECT * FROM CUSTOMER WHERE PROVEMAIL = ? ' , [email] , async(err, status) =>{
            
            if(err){
                console.log("Entro a 1");
                return res.status(400).json({
                    ok:   false,
                    msg:  'No existe el ticket'
                });
            }

            if(status[0] == null){   
                console.log("Entro a 2");
                return res.status(400).json({
                    ok:   false,
                    msg:  'Usuario inválido'
                });
            }else{
                
                status.forEach( data => {
                    rfc = data['PROVRFC'];
                    username = data['PROVNAME'];
                });

                const token = await jwtgenerate( rfc  , username );
                
                const output = `
                <p> Solicitud de Restablecimiento de Contraseña </p>
                <h3> Información de Contacto </h3>
                <ul>  
                <li>Name: Fletes4003 </li>
                <li>Company: Fletes4003 </li>
                <li>Email: ${ email }</li>
                <li>Phone: 8281050726 </li>
                </ul>
                <h3>Message</h3>
                <p> 
                
                    Para restablecer la contraseña hacer click en el siguiente link http://localhost:4200/auth/resetpass?token=${ token } 
                
                </p>`;

                // create reusable transporter object using the default SMTP transport
                let transporter = nodemailer.createTransport({
                    host: 'fletes4003.mx',
                    port: 587,
                    secure: false, // true for 465, false for other ports
                    auth: {
                        user: 'request@fletes4003.mx', // generated ethereal user
                        pass: '@$fletes4003 $'  // generated ethereal password
                    },
                    tls:{
                    rejectUnauthorized:false
                    }
                });

                // setup email data with unicode symbols
                let mailOptions = {
                    from: '"Fletes4003" <request@fletes4003.mx>', // sender address
                    to: `${ email }`, // list of receivers
                    subject: 'Respaldo de Contraseña', // Subject line
                    text: '', // plain text body
                    html: output // html body
                };

                // send mail with defined transport object
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log("Entro a 3");
                        return res.status(400).json({
                            ok:   false,
                            msg:  'Usuario inválido'
                        });
                    }

                    return res.status(201).json({
                        ok: true,
                        msg: 'Proceso exitoso'
                    });
        
                
                });

            }
        })
    });
}

const resetpass = async(req = request , res = response ) =>{

    const{ rfc , password } = req.body;

    req.getConnection((err, conn ) => {

        conn.query('SELECT * FROM CUSTOMER WHERE PROVRFC = ? ' , [rfc] , async(err, status) =>{
            
            if(err){
                return res.status(400).json({
                    ok:   false,
                    msg:  'Ha fallado el proceso'
                });
            }

            if(status[0] == null){   
                return res.status(400).json({
                    ok:   false,
                    msg:  'Usuario no encontrado'
                });
            }else{
                status.forEach( data => {
                    username = data['PROVNAME'];
                });

                const salt = bcrypt.genSaltSync();

                const pass = bcrypt.hashSync( password , salt);

                const token = await jwtgenerate( rfc , username );
                
                const data = {

                    PROVPASS     : pass,

                };
            
                req.getConnection((err, conn ) => {
            
                    conn.query('SELECT * FROM CUSTOMER WHERE PROVRFC = ? ' , [rfc] , (err, status) =>{
                        
                        if(err){
                            return res.status(400).json({
                                ok:   false,
                                msg:  'No existe el ticket'
                            });
                        }
            
                        if(status[0] == null){   
                            return res.status(400).json({
                                ok:   false,
                                msg:  'Usuario no registrado'
                            });
                        }else{
                            try{
                                conn.query('UPDATE customer set ? WHERE PROVRFC = ? ', [data, rfc] , (err, results) => {
                                    if (err){
                                        return res.status(400).json({
                                            ok:   false,
                                            msg: `Usuario ya registrado`
                                        });
                                    }else{
                                        return res.status(201).json({
                                            ok: true,
                                            msg: 'Se ha creado el usuario',
                                            username,
                                            token
                                        });
                                    }
                                });
                            }catch(error){
                                return res.status(400).json({
                                    ok:   false,
                                    msg:  error
                                });
                            }
                        }
                    })
                });
            }
        });
    });


}

const validate = async(req = request, res = response) => {

    const { rfc } = req;

    let validuser; 

    req.getConnection(( err , conn ) => {
        conn.query('SELECT * FROM CUSTOMER WHERE PROVRFC = ? ', rfc , async(err, results) => {

            try{
                results.forEach(element => {

                    if(element['PROVUSERDATA'] == 'true'){
                        validuser = true;
                    }else{
                        validuser = false;
                    }
                });
                
                if(validuser == null){
                    return res.json({
                        ok:   false,
                        msg:  err,
                        validuser
                    });
                }else{
                    return res.json({
                        ok: true,
                        validuser
                    });
                }

            }catch(error){
                return res.status(400).json({
                    ok:   false,
                    msg:  error,
                    validuser
                });
            }

        });
    });
}

module.exports = {
    createUser,
    LoginUser,
    RenewToken,
    createticket,
    saveprofile,
    obtaindata,
    adminobtaindata,
    adminasign,
    refupdate,
    asfaltupdate,
    cancelticket,
    refticket,
    asfticket,
    facturarticket,
    resetpass,
    forgotpass,
    validate
}