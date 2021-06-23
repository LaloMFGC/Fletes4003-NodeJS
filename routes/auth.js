const { Router } = require('express');
const { check } = require('express-validator');
const { createUser ,
        RenewToken ,
        LoginUser ,
        createticket ,
        saveprofile , 
        obtaindata ,
        adminobtaindata , 
        adminasign , 
        refupdate ,
        asfaltupdate ,
        cancelticket ,
        refticket ,
        asfticket ,
        facturarticket ,
        forgotpass , 
        resetpass, 
        validate} = require('../controllers/auth.routes');
const { validarcampos } = require('../middlewares/Validar-Campos');
const { validarjwt } = require('../middlewares/validar-jwt');


const router = Router();

router.post('/signin', [
            check('email','Email no reconocido').isEmail(),
            check('password','Favor de registrar una contraseña de mas de 6 digitos').isLength({ min: 6}),
            check('name','Nombre no reconocido').matches(/[a-zñó]*[ ]*[#,]*([A-ZÑ]*)[a-zñó]*/),
            check('rfc','RFC invalido'),
            validarcampos],
            createUser);

router.post('/login',[
            check( 'email' , 'Email no reconocido' ).isEmail(),
            check( 'password' , 'Password no reconocido').isLength( { min: 6 } ),
            validarcampos ],
            LoginUser );

router.get( '/renew' , validarjwt , RenewToken );


router.post('/userticket', [
            check('cargaaddress','Favor de escribir la direccion correctamente').matches(/[a-zñó0-9]*[ ]*[#,]*([A-ZÑ]*)[a-zñó0-9]*/),
            check('entregaaddress','Favor de escribir la direccion correctamente').matches(/[a-zñó0-9]*[ ]*[#,]*([A-ZÑ]*)[a-zñó0-9]*/),
            validarcampos],
            createticket);


router.post('/updateprofile',[
             check('nombre','Favor de escribir los datos correctamente').matches(/[a-zñó0-9]*[ ]*[#,]*([A-ZÑ]*)[a-zñó0-9]*/),
             check('razonsocial','Favor de escribir los datos correctamente').matches(/[a-zñó0-9]*[ ]*[#,]*([A-ZÑ]*)[a-zñó0-9]*/),
             check('address','Favor de escribir los datos correctamente').matches(/[a-zñó0-9]*[ ]*[#,]*([A-ZÑ]*)[a-zñó0-9]*/),
             check('numaddress','Favor de escribir los datos correctamente').matches(/[a-zñó0-9]*[ ]*[#,]*([A-ZÑ]*)[a-zñó0-9]*/),
             check('colonia','Favor de escribir los datos correctamente').matches(/[a-zñó0-9]*[ ]*[#,]*([A-ZÑ]*)[a-zñó0-9]*/),
             check('city','Favor de escribir los datos correctamente').matches(/[a-zñó]*[ ]*[#,]*([A-ZÑ]*)[a-zñó]*/),
             check('state','Favor de escribir los datos correctamente').matches(/[a-zñó]*[ ]*[#,]*([A-ZÑ]*)[a-zñó]*/),
             check('phone','Favor de escribir los datos correctamente').matches(/[0-9]+/).isLength(10),
             check('username','Favor de escribir los datos correctamente').matches(/[a-zñó0-9]*[ ]*[#,]*([A-ZÑ]*)[a-zñó0-9]*/),
             validarcampos],
             saveprofile)
             check('address','Favor de escribir los datos correctamente').matches(/[a-zñó0-9]*[ ]*[#,]*([A-ZÑ]*)[a-zñó0-9]*/),

router.get('/obtaindata',
            validarjwt,
            obtaindata);

router.get('/adminobtaindata',
            validarjwt,
            adminobtaindata);

router.post('/asignar',[
            check('folio','Favor de escribir los datos correctamente').matches('[0-9]*'),
            check('empresa','Favor de escribir los datos correctamente').matches(/[a-zñó0-9]*[ ]*[#,]*([A-ZÑ]*)[a-zñó0-9]*/),
            check('adminuser','Favor de escribir los datos correctamente').matches(/[a-zñó0-9]*[ ]*[#,]*([A-ZÑ]*)[a-zñó0-9]*/),
            check('unidad','Favor de escribir los datos correctamente').matches(/[a-zñó0-9]*[ ]*[#,-]*([A-ZÑ]*)[a-zñó0-9]*/),
            check('chofer','Favor de escribir los datos correctamente').matches(/[a-zñó0-9]*[ ]*[#,]*([A-ZÑ]*)[a-zñó0-9]*/),
            check('cartaporte','Favor de escribir los datos correctamente').matches(/[a-zñó0-9]*[ ]*[#,]*([A-ZÑ]*)[a-zñó0-9]*/),
            validarcampos],
            adminasign);

router.post('/refupdate',[
            check('folio','Favor de escribir los datos correctamente').matches(/[0-9]*/),
            check('geocerca','Favor de escribir los datos correctamente').matches(/[a-zñó0-9]*[ ]*[#,]*([A-ZÑ]*)[a-zñó0-9]*/),
            check('kilometraje','Favor de escribir los datos correctamente').matches(/[0-9]+/),
            check('sello','Favor de escribir los datos correctamente').matches(/[a-zñó0-9]*[ ]*[#,]*([A-ZÑ]*)[a-zñó0-9]*/),
            check('costo','Favor de escribir los datos correctamente').matches(/[0-9]*/),
            check('observaciones','Favor de escribir los datos correctamente').matches(/[a-zñó0-9]*[ ]*[#,]*([A-ZÑ]*)[a-zñó0-9]*/),
            validarcampos],
            refupdate);

router.post('/asfupdate',[
            check('folio','Favor de escribir los datos correctamente').matches(/[0-9]+/),
            check('kilometraje','Favor de escribir los datos correctamente').matches(/[0-9]+/),
            check('tanque','Favor de escribir los datos correctamente').matches(/[a-zñó0-9]*[ ]*[#,]*([A-ZÑ]*)[a-zñó0-9]*/),
            check('gastos','Favor de escribir los datos correctamente').matches(/[0-9]+/),
            check('costo','Favor de escribir los datos correctamente').matches(/[0-9]+/),
            check('observaciones','Favor de escribir los datos correctamente').matches(/[a-zñó0-9]*[ ]*[#,]*([A-ZÑ]*)[a-zñó0-9]*/),
            validarcampos],
            asfaltupdate);

router.post('/cancelticket',[
            check('folio','Favor de escribir los datos correctamente').matches(/[0-9]+/),    
            check('observaciones','Favor de escribir los datos correctamente').matches(/[a-zñó0-9]*[ ]*[#,]*([A-ZÑ]*)[a-zñó0-9]*/),
            validarcampos],
            cancelticket);

router.post('/refticket', [
            check('cargaaddress','Favor de escribir la direccion correctamente').matches(/[a-zñó0-9]*[ ]*[#,]*([A-ZÑ]*)[a-zñó0-9]*/),
            check('entregaaddress','Favor de escribir la direccion correctamente').matches(/[a-zñó0-9]*[ ]*[#,]*([A-ZÑ]*)[a-zñó0-9]*/),
            check('adminasign','Favor de escribir los datos correctamente').matches(/[a-zñó]*[ ]*[#,]*([A-ZÑ]*)[a-zñó]*/),
            check('unidad','Favor de escribir los datos correctamente').matches(/[a-zñó]*[ ]*[#,]*([A-ZÑ]*)[a-zñó]*/),
            check('chofer','Favor de escribir los datos correctamente').matches(/[a-zñó]*[ ]*[#,]*([A-ZÑ]*)[a-zñó]*/),
            check('cartaporte','Favor de escribir los datos correctamente').matches(/[a-zñó]*[ ]*[#,]*([A-ZÑ]*)[a-zñó]*/),
            validarcampos],
            refticket);

router.post('/asfticket', [
            check('cargaaddress','Favor de escribir la direccion correctamente').matches(/[a-zñó0-9]*[ ]*[#,]*([A-ZÑ]*)[a-zñó0-9]*/),
            check('entregaaddress','Favor de escribir la direccion correctamente').matches(/[a-zñó0-9]*[ ]*[#,]*([A-ZÑ]*)[a-zñó0-9]*/),
            check('adminasign','Favor de escribir los datos correctamente').matches(/[a-zñó]*[ ]*[#,]*([A-ZÑ]*)[a-zñó]*/),
            check('unidad','Favor de escribir los datos correctamente').matches(/[a-zñó]*[ ]*[#,]*([A-ZÑ]*)[a-zñó]*/),
            check('chofer','Favor de escribir los datos correctamente').matches(/[a-zñó]*[ ]*[#,]*([A-ZÑ]*)[a-zñó]*/),
            check('cartaporte','Favor de escribir los datos correctamente').matches(/[a-zñó]*[ ]*[#,]*([A-ZÑ]*)[a-zñó]*/),  
            validarcampos],
            asfticket);

router.post( '/facturar', [
              check('folio','Favor de escribir los datos correctamente').matches(/[0-9]+/),  
              validarcampos] ,
              facturarticket );

router.post('/resetpass',
            resetpass);

router.post('/forgotpass',
            forgotpass);

router.get( '/validate' , validarjwt , validate );

module.exports = router;