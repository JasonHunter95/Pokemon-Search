
document.addEventListener("DOMContentLoaded", () => {
    const search_button = document.getElementById("search_button");
    const search_input_field = document.getElementById("search_input_field");
    const pokemon_container = document.getElementById("pokemon-container");
    const default_cards_div = document.getElementById('default-cards');

    search_input_field.addEventListener("keypress", (event) => {
        // If the user presses the "Enter" key on the keyboard
        if (event.key === "Enter") {
            // Cancel the default action, if needed
            event.preventDefault();
            default_cards_div?.remove();
            // Trigger the button element with a click
            search_button.click();
        }
    });

    search_button.addEventListener("click", async () => {
        if (!search_input_field.value.trim()) {
            alert("Please enter a Pokemon name or ID to search for.");
            return;
        }
        default_cards_div?.remove();
        const query = search_input_field.value.toLowerCase();
        const [pokemon_card, name] = await make_pokemon_card(query).catch(err => {
            console.error(err);
            pokemon_container.textContent = "Failed to fetch Pokémon data. Please try again.";
            return [null, null];
        });

        if (!pokemon_card) {
            pokemon_container.textContent = "Pokemon not found.";
            return;
        }
        pokemon_container.textContent = ''; // Clear previous contents more efficiently
        while (pokemon_container.firstChild) {
            pokemon_container.removeChild(pokemon_container.firstChild);
        }
        pokemon_container.appendChild(pokemon_card);
    });
});

function elt(name, attrs, text, ...children) {
    let dom = document.createElement(name);
    for (let attr of Object.keys(attrs)) {
        dom.setAttribute(attr, attrs[attr]);
    }
    for (let child of children) {
        dom.appendChild(child);
    }
    if (text) {
        dom.innerText = text;
    }
    return dom;
}

async function make_pokemon_card(name) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    if (!response.ok) {
        return [null, null];  // Return null values if fetch fails
    }
    const data = await response.json();
    const img_url = data.sprites.other['official-artwork'].front_default;
    const stats = data.stats;
    name = data.name;  // Adjusted to the correct scope if needed elsewhere
    const hp = stats[0].base_stat;
    const attack = stats[1].base_stat;
    const defense = stats[2].base_stat;
    const special_attack = stats[3].base_stat;
    const special_defense = stats[4].base_stat;
    const speed = stats[5].base_stat;
    const types_string = data.types.map(obj => obj.type.name).join(', ');

    const pokemonCard = elt('div', {}, "",
    elt('a', { href: `/pokemon/${name}`, class: 'card-link' }, "",  // Link that points to the detailed view
        elt('table', {}, "",
            elt('tbody', {}, "",
                elt('tr', {}, "",
                    elt('td', { colspan: 2 }, "",
                        elt('img', { src: img_url }))),
                elt('tr', {}, "",
                    elt('td', {}, capitalize(name))),
                elt('tr', {}, "",
                    elt('td', {}, `Attack:`),
                    elt('td', {}, `${attack}`)),
                elt('tr', {}, "",
                    elt('td', {}, `Defense:`),
                    elt('td', {}, `${defense}`)),
                elt('tr', {}, "",
                    elt('td', {}, `Hitpoints:`),
                    elt('td', {}, `${hp}`)),
                elt('tr', {}, "",
                    elt('td', {}, `Special Attack:`),
                    elt('td', {}, `${special_attack}`)),
                elt('tr', {}, "",
                    elt('td', {}, `Special Defense:`),
                    elt('td', {}, `${special_defense}`)),
                elt('tr', {}, "",
                    elt('td', {}, `Speed:`),
                    elt('td', {}, `${speed}`)),
                elt('tr', {}, "",
                    elt('tr', {}, "",
                        elt('td', {}, `Type(s):`),
                        elt('td', {}, `${types_string}`)))))));
    return [pokemonCard, name];  // Return as array
}

function capitalize(string) {
    return string.slice(0, 1).toUpperCase() + string.slice(1);
}


