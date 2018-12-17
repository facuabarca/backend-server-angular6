var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');


// Búsqueda por colección
app.get('/coleccion/:tabla/:busqueda', (req, res) => {
    var busqueda = req.params.busqueda;
    var coleccion = req.params.tabla;
    var regex = new RegExp(busqueda, 'i');

    if (coleccion === 'usuario') {
        buscarUsuarios(busqueda, regex).then(response => {
            res.status(200).json({
                ok: true,
                usuarios: response
            });
        });
    } else if (coleccion === 'medico') {
        buscarMedicos(busqueda, regex).then(response => {
            res.status(200).json({
                ok: true,
                medicos: response
            });
        })
    } else if (coleccion === 'hospital') {
        buscarHospitales(busqueda, regex).then(response => {
            res.status(200).json({
                ok: true,
                hospitales: response
            });
        });
    } else {
        res.status(400).json({
            ok: false,
            message: 'No existe ninguna colección espcificada con el nombre: ' + coleccion
        });
    }
});

// Búsqueda general
app.get('/todo/:busqueda', (req, res, next) => {
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([buscarHospitales(busqueda, regex), buscarMedicos(busqueda, regex), buscarUsuarios(busqueda, regex)])
        .then(response => {
            res.status(200).json({
                ok: true,
                hospitales: response[0],
                medicos: response[1],
                usuarios: response[2]
            });
        });
});

function buscarHospitales(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }
            });
    })
}

function buscarMedicos(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec(
                (err, medicos) => {
                    if (err) {
                        reject('Error al cargar hospitales', err);
                    } else {
                        resolve(medicos);
                    }
                });
    })
}

function buscarUsuarios(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email rol')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });
    })
}
module.exports = app;