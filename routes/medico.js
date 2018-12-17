var express = require('express');
var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');

app.get('/', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando los médicos',
                    errores: err
                });
            }
            Medico.count({}, (err, conteo) => {
                return res.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: conteo
                });

            });

        });
})

app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
        hospital: req.query.idHospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el médico',
                errores: err
            });
        }

        return res.status(200).json({
            ok: true,
            medico: medicoGuardado,
            usuario: req.usuario,
            hospital: req.hospital
        });
    });
});

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Medico.findById(id, (err, medico) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el médico!',
                errores: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'el hospital con el id ' + id + ' no existe',
                errores: { message: 'No existe un hospital con ese ID' }
            });
        }

        medico.nombre = body.nombre;
        medico.img = body.img;

        medico.save((err, medicoActualizado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el hospital!',
                    errores: err
                });
            }
            res.status(200).json({
                ok: true,
                medico: medicoActualizado
            });
        });
    });
});

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoEliminado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar el médico!',
                errores: err
            });
        }
        if (!medicoEliminado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un médico con ese id',
                errores: { message: 'No existe un médico con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: medicoEliminado
        });
    });
});

module.exports = app;