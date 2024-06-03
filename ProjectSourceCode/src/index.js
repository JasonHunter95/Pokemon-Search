/*
importing modules: express, express-handlebars, 
                   path, pg-promise, express-session, 
                   bcryptjs, axios, express-flash, fs
*/
const express = require('express');
const app = express(); // creates an express application
const exphbs = require('express-handlebars'); // allows use of handlebars in express
const path = require('path'); // provides utilities for working with file and directory paths
const pgPromise = require('pg-promise'); // allows use of pg-promise in express (PostgreSQL database)
const pgp = pgPromise();
const session = require('express-session'); // allows use of sessions in express (for user login)
const bcryptjs = require('bcryptjs'); // used for hashing passwords
const axios = require('axios'); // used for making HTTP requests (fetching data from the PokeAPI)
const flash = require('express-flash'); // used for flashing messages to the user
const { constants } = require('fs');

const hbs = exphbs.create({
    extname: 'hbs', // specifies the file extension for .hbs files
    layoutsDir: path.join(__dirname, '/views/layouts'), // specifies the directory for layout files
    partialsDir: path.join(__dirname, '/views/partials'), // specifies the directory for partial files
});

// database configuration to connect to the PostgreSQL database
const dbConfig = {
    host: 'db', // the database host (name of the docker container)
    port: 5432, // the database port (default for PostgreSQL)
    database: process.env.POSTGRES_DB, // the database name (in the .env file)
    user: process.env.POSTGRES_USER, // the user account to connect with (in the .env file)
    password: process.env.POSTGRES_PASSWORD, // the password of the user account (in the .env file)
};

const db = pgp(dbConfig); // creates a new database connection to the PostgreSQL database

// test database connection
db.connect()
    .then(obj => {
        console.log('Database connection successful'); // you can view this message in the docker compose logs
        obj.done(); // success, release the connection;
    })
    .catch(error => {
        console.log('ERROR:', error.message || error);
    });

// set up the express application
app.engine('hbs', hbs.engine); // sets the handlebars engine for the express application
app.set('view engine', 'hbs'); // sets the view engine to handlebars
app.set('views', path.join(__dirname, 'views')); // specifies the directory for view files
app.use(express.json()); // specify the usage of JSON for parsing request body data
app.use(express.static('public')); // specify the usage of static files
app.use(express.static(__dirname + '/')); // serves static files (e.g. images, stylesheets, etc.)

// initialize session variables using express-session for user login functionalities
app.use(
    session({
        secret: process.env.SESSION_SECRET, // the secret key for the session (in the .env file)
        saveUninitialized: false, // forces a session that is "uninitialized" to not be saved to the store 
        resave: false, // forces the session to be saved back to the session store (even if the session was never modified during the request)    
    })
);
app.use(flash()); // allows flash messages to be used in the express application

app.use( // allows the express application to parse incoming requests with urlencoded payloads (e.g. form data from POST requests)
    express.urlencoded({
        extended: true,
    })
);

// function to fetch individual pokemon information by name from the PokeAPI
async function fetch_pokemon_info(pokemon_name) {
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon_name}`);
    return response.data;
}

function capitalize(string) {
    return string.slice(0,1).toUpperCase() + string.slice(1);
}

async function fetch_pokemon_info(pokemon_name) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon_name}`);
        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        const img_url = data.sprites.other['official-artwork'].front_default;
        const stats = data.stats;
        const hp = stats[0].base_stat;
        const attack = stats[1].base_stat;
        const defense = stats[2].base_stat;
        const special_attack = stats[3].base_stat;
        const special_defense = stats[4].base_stat;
        const speed = stats[5].base_stat;
        const types = data.types.map(obj => obj.type.name);
        const types_string = types.join(', ');
        const first_type = types[0];

        return {
            name: capitalize(pokemon_name),
            img_url,
            hp,
            attack,
            defense,
            special_attack,
            special_defense,
            speed,
            types_string,
            first_type,
        };
    } catch (err) {
        console.error(err);
        return {};
    }
}

async function fetch_detailed_pokemon_info(pokemon_name) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon_name}`);
    if (!response.ok) {
        return null;
    }

    const data = await response.json();
    const img_url = data.sprites.front_default;
    const img_back_url = data.sprites.back_default;
    const img_shiny_url = data.sprites.front_shiny;
    const img_shiny_back_url = data.sprites.back_shiny;
    const img_female_url = data.sprites.front_female;
    const img_back_female_url = data.sprites.back_female;
    const img_shiny_female_url = data.sprites.front_shiny_female;
    const img_shiny_back_female_url = data.sprites.back_shiny_female;
    const stats = data.stats;
    const hp = stats[0].base_stat;
    const attack = stats[1].base_stat;
    const defense = stats[2].base_stat;
    const special_attack = stats[3].base_stat;
    const special_defense = stats[4].base_stat;
    const speed = stats[5].base_stat;
    const types_string = data.types.map(obj => obj.type.name).join(', ');
    const abilities = data.abilities.map(obj => obj.ability.name).join(', ');
    const base_experience = data.base_experience;
    const height = data.height;
    const weight = data.weight;
    const moves = data.moves.map(obj => obj.move.name).join(', ');


    return {
        name: capitalize(pokemon_name),
        img_url,
        img_back_url,
        img_shiny_url,
        img_shiny_back_url,
        img_female_url,
        img_back_female_url,
        img_shiny_female_url,
        img_shiny_back_female_url,
        hp,
        attack,
        defense,
        special_attack,
        special_defense,
        speed,
        types_string,
        abilities,
        base_experience,
        height,
        weight,
        moves,
    };
}

/*
- renders the home page of the application with 151 default pokemon.
*/
app.get('/', async (req, res) => {
    const limit = req.query.limit || 151; // default limit is 151 
    try {
        const results = await axios({
            url: `https://pokeapi.co/api/v2/pokemon?limit=${limit}`,
            method: 'GET',
            dataType: 'json',
            headers: {
                'Accept-Encoding': 'application/json',
            }
        });

        let pokemons = [];
        if (results && results.data.results) {
            pokemons = results.data.results;
        }

        const pokemon_data = await Promise.all(pokemons.map(pokemon =>
            fetch_pokemon_info(pokemon.name)));

        res.render('pages/home', {
            results: pokemon_data,
        });
    } catch (error) {
        console.log(error);
        res.render('pages/home', {
        });
    }
});

// route to display more detailed pokemon information
app.get('/pokemon/:name', (req, res) => {
    const pokemon_name = req.params.name.toLowerCase();
    fetch_detailed_pokemon_info(pokemon_name)
        .then((pokemon_info) => {
            res.render('pages/pokemon', {
                pokemon: pokemon_info,
            });
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({
                message: 'There has been an error. Please try again later.',
                error: true,
            });
        });
});

app.get('/search', async (req, res) => {
    const limit = req.query.limit || 151; // default limit is 151 
    try {
        const results = await axios({
            url: `https://pokeapi.co/api/v2/pokemon?limit=${limit}`,
            method: 'GET',
            dataType: 'json',
            headers: {
                'Accept-Encoding': 'application/json',
            }
        });

        let pokemons = [];
        if (results && results.data.results) {
            pokemons = results.data.results;
        }

        const pokemon_data = await Promise.all(pokemons.map(pokemon =>
            fetch_pokemon_info(pokemon.name)));

        res.render('pages/search', {
            results: pokemon_data,
        });
    } catch (error) {
        console.log(error);
        res.render('pages/search', {
        });
    }

});


module.exports = app;
app.listen(3000);
console.log('Server is listening on port 3000');
