const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const ejs = require('ejs');

const session = require('express-session');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');


const app = express();



const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    // If the user is authenticated, proceed to the next middleware
    return next();
  }

  // If the user is not authenticated, redirect to the login page or return an error
  res.redirect('/login');
};


app.set('view engine', 'ejs');


const port = process.env.PORT || 3000;

// Configuration de la base de données MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'mydb'
});

// Connexion à la base de données MySQL
connection.connect((err) => {
  if (err) throw err;
  console.log('Connecté à la base de données MySQL!');
});

// Utilisation de body-parser pour traiter les données POST
app.use(bodyParser.urlencoded({ extended: true }));



app.use(session(
  {  
  secret: 'TOTO', // Changez cela par une chaîne secrète aléatoire et sécurisée
  resave: false,
  saveUninitialized: false
  
}));


// Configuration de la stratégie d'authentification locale
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {


    // Recherchez l'utilisateur dans la base de données en fonction de l'email
const query = 'SELECT * FROM users WHERE email = ?';
connection.query(query, [email], async (error, results) => {
 
  
  
  
  if (error) {
    console.log("error");
    return done(error);
  }

  // Vérifiez si aucun résultat n'a été retourné
  if (results.length === 0) {
    console.log("Identifiants invalides 1")
    return done(null, false, { message: 'Identifiants invalides' });
  }

  // Si l'utilisateur n'est pas trouvé ou si le mot de passe ne correspond pas, retournez une erreur d'authentification
  if (!bcrypt.compareSync(password, results[0].password)) {
    console.log("eIdentifiants invalides 2")
    return done(null, false, { message: 'Identifiants invalides' });
  }

  // L'authentification a réussi, retournez l'utilisateur
  return done(null, results[0]);
});
  }
));

// Configuration de la sérialisation de l'utilisateur
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    // Recherchez l'utilisateur dans la base de données en fonction de son ID
    const query = 'SELECT * FROM users WHERE id = ?';
    connection.query(query, [id], (error, results) => {
      if (error) {
        return done(error);
      }
      done(null, results[0]);
    });
  } catch (error) {
    done(error);
  }
});


// Middleware d'initialisation et de session de Passport.js
app.use(passport.initialize());
app.use(passport.session());





app.post('/login', passport.authenticate('local'), (req, res) => {
  // Cette fonction ne sera exécutée que si l'authentification réussit
  res.redirect('/home'); // Rediriger vers la page d'accueil après l'authentification réussie
});

app.get('/login', (req, res) => {
    res.render('login');
  
});


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/home.html');
});

app.get('/home', (req, res) => {
  res.send(`
    <h1>Bienvenue sur la page d'accueil !</h1>
    <button onclick="window.location.href='/claims'">Réclamations</button>
    <button onclick="window.location.href='/orders'">Commandes</button>
  `);
});



// Route pour récupérer toutes les réclamations
app.get('/claims', (req, res) => {
  connection.query('SELECT * FROM claims', (err, results) => {
    if (err) throw err;
    res.render('claims', { claims: results });
  });
});

// Route pour ajouter une nouvelle réclamation
app.post('/claims', (req, res) => {
  const { customer_name, issue_description } = req.body;
  connection.query(`INSERT INTO claims (customer_name, issue_description) VALUES ('${customer_name}', '${issue_description}')`, (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

// Route pour récupérer toutes les commandes
app.get('/orders', (req, res) => {
  connection.query('SELECT * FROM orders', (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

// Route pour ajouter une nouvelle commande
app.post('/orders', (req, res) => {
  const { customer_name, product_name, quantity } = req.body;
  connection.query(`INSERT INTO orders (customer_name, product_name, quantity) VALUES ('${customer_name}', '${product_name}', '${quantity}')`, (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});