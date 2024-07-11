# Pokemon-Search
Web Application used to source various information about Pokémon

if you wish to run this locally:
1. download the latest versions of docker and vscode.
2. clone this repository and open it in vscode.
3. navigate to the ProjectSourceCode folder and add a .env file containing the following:

    POSTGRES_USER="postgres" //
    POSTGRES_PASSWORD="pwd" //
    POSTGRES_DB="pokedex_db" //
    
    SESSION_SECRET="super duper secret!"

4. now you can start the application by running "docker-compose up -d" in the terminal.
5. this should begin the program locally, now navigate to http://localhost:3000/ to try it out!
