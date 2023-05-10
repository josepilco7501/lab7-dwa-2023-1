const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');


const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

//Configuramos la ruta para guardar las imagenes
app.use(express.static('public'));

//Configuramos el motor de plantilla EJS
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

//Nos conectamos a la base de datos
mongoose.connect('mongodb://0.0.0.0:27017/videojuegos', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected!');
}).catch((error) => {
  console.error('MongoDB connection error:', error);
});

//Creamos un modelo
const videojuegoSchema = new mongoose.Schema({
    nombre: String,
    descripcion: String,
    imagen: String
  });
  
const Videojuego = mongoose.model('Videojuego', videojuegoSchema);

//Configuramos la direccion de ruta donde se guardaran nuestras imagenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

const upload = multer({ storage: storage })

//Metodo post para enviar los datos al servidor
app.post('/guardar', upload.single('imagen'), (req, res) => {
  const nombre = req.body.nombre;
  const descripcion = req.body.descripcion;
  const imagen = req.file.filename;

  // guardar los datos en la base de datos
  const videojuego = new Videojuego({
    nombre,
    descripcion,
    imagen
  });

  try {
    videojuego.save();
    res.redirect('/ver-videojuegos');
  } catch (err) {
    next(err);
  }

});

//Ruta inicial donde esta el formulario para crear un videojuego
app.get('/', (req, res) =>{
    res.render('create');
})

//Ruta para ver los videojuegos guardados
app.get('/ver-videojuegos', async (req, res, next) => {
    try {
      const videojuegos = await Videojuego.find();
      res.render('ver-videojuegos', { videojuegos });
    } catch (err) {
      next(err);
    }
});

//Escucharemos el servidor en el puerto 3000
const port = 3000; 
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});








  

