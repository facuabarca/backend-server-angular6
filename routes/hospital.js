var express = require('express');
var bcrypt = require('bcryptjs');
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');

app.get('/', (req, res, next) => {
    Hospital.find({}, (err, hospitales) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error cargando hospitales',
                errores: err
            });
        }
        return res.status(200).json({
            ok: true,
            hospitales: hospitales
        });
    });
});

app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital!',
                errores: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: hospitalGuardado,
            usuarioToken: req.usuario
        });
    });
});

app.put('/:id', mdAutenticacion.verificaToken, (req, res, next) => {

    var id = req.params.id;

    Hospital.findById(id, (err, hospital) => {
        var body = req.body;

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el hospital!',
                errores: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'el hospital con el id ' + id + ' no existe',
                errores: { message: 'No existe un hospital con ese ID' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.img = body.img;

        hospital.save((err, hospitalActualizado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el hospital!',
                    errores: err
                });
            }

            res.status(200).json({
                ok: true,
                hospita: hospitalActualizado
            });
        });
    });
});

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalEliminado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital!',
                errores: err
            });
        }

        if (!hospitalEliminado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese id',
                errores: { message: 'No existe un hospital con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: hospitalEliminado
        });

    });
});

module.exports = app;