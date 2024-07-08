document.addEventListener("DOMContentLoaded", () => {
    const search_button = document.getElementById("search_button");
    const search_input_field = document.getElementById("search_input_field");
    const random_pokemon_btn = document.getElementById("random-pokemon-btn");
    const type_buttons = document.querySelectorAll(".type-btn");
    const pokemon_container = document.getElementById("pokemon-container");
    const item_container = document.getElementById("item-container");
    const default_cards_div = document.getElementById('default-cards');

    random_pokemon_btn?.addEventListener("click", async () => {
        default_cards_div?.remove();
        const query = Math.floor(Math.random() * 1025) + 1;
        const [pokemon_card, pokemon_name] = await make_pokemon_card(query).catch(err => {
            console.error(err);
            pokemon_container.textContent = "Failed to fetch Pokemon. Please try again.";
            return [null, null];
        });
        if (pokemon_card) {
            pokemon_container.textContent = ''; // Clear previous contents more efficiently
            while (pokemon_container.firstChild) {
                pokemon_container.removeChild(pokemon_container.firstChild);
            }
            pokemon_container.appendChild(pokemon_card);
        }
    });

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
        const search_type = document.querySelector('input[name="search_type"]:checked').value;

        if (!search_input_field.value.trim()) {
            alert("Please enter a ${search_type} name.");
            return;
        }
        default_cards_div?.remove();
        const query = search_input_field.value.toLowerCase();
        let pokemon_card, pokemon_name, item_card, item_name;

        pokemon_container.textContent = '';
        item_container.textContent = '';

        if (search_type === "pokemon") {
            [pokemon_card, pokemon_name] = await make_pokemon_card(query).catch(err => {
                console.error(err);
                pokemon_container.textContent = "Failed to fetch Pokémon data. Please try again.";
                return [null, null];
            });
        } else if (search_type === "item") {
            [item_card, item_name] = await make_item_card(query).catch(err => {
                console.error(err);
                item_container.textContent = "Failed to fetch item data. Please try again.";
                return [null, null];
            });
        }

        if (search_type === "pokemon") {
            if (!pokemon_card) {
                pokemon_container.textContent = `${capitalize(search_type)} not found.`;
                return;
            }
            pokemon_container.textContent = ''; // Clear previous contents more efficiently
            while (pokemon_container.firstChild) {
                pokemon_container.removeChild(pokemon_container.firstChild);
            }
            pokemon_container.appendChild(pokemon_card);
        } else if (search_type === "item") {
            if (!item_card) {
                item_container.textContent = `${capitalize(search_type)} not found.`;
                return;
            }
            item_container.textContent = ''; // Clear previous contents more efficiently
            while (item_container.firstChild) {
                item_container.removeChild(item_container.firstChild);
            }
            item_container.appendChild(item_card);
        }
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

async function make_item_card(name) {
    const response = await fetch(`https://pokeapi.co/api/v2/item/${name}`);
    if (!response.ok) {
        return [null, null];  // Return null values if fetch fails
    }
    const data = await response.json();
    const is_countable = data.attributes?.[0]?.name || 'N/A';
    const is_consumable = data.attributes?.[1]?.name || 'N/A';
    const usable_in_battle = data.attributes?.[2]?.name || 'N/A';
    const is_holdable = data.attributes?.[3]?.name || 'N/A';

    const baby_trigger_for = data.baby_trigger_for || 'N/A';
    const item_category = data.category?.name;
    const cost = data.cost || 'N/A';
    const effect_entries = data.effect_entries?.[0]?.effect || 'N/A';
    const secondary_effect = data.effect_entries?.[0]?.short_effect || 'No secondary effect information available';
    const fling_effect = data.fling_effect || 'No fling effect information available';
    const fling_power = data.fling_power || 'No fling power information available';
    // const held_by_pokemon = data.held_by_pokemon.pokemon[0].name;
    const item_id = data.id || 'N/A';
    const item_name = data.name || 'N/A';
    const sprite = data.sprites.default || 'N/A';
    const item_description = data.flavor_text_entries?.[2]?.text || data.flavor_text_entries?.[1]?.text || data.flavor_text_entries?.[0]?.text || 'No description available';

    const itemCard = elt('div', {}, "",
    elt('table', {}, "",
        elt('tbody', {}, "",
            elt('tr', {}, "",
                elt('td', { colspan: 2 }, "",
                    elt('img', { src: sprite }))),
            elt('tr', {}, "",
                elt('td', {}, capitalize(item_name))),
            elt('tr', {}, "",
                elt('td', {}, `Item ID:`),
                elt('td', {}, `${item_id}`)),
            elt('tr', {}, "",
                elt('td', {}, `Item Description:`),
                elt('td', {}, `${item_description}`)),
            elt('tr', {}, "",
                elt('td', {}, `Item Category:`),
                elt('td', {}, `${item_category}`)),
            elt('tr', {}, "",
                elt('td', {}, `Cost:`),
                elt('td', {}, `${cost}`)),
            elt('tr', {}, "",
                elt('td', {}, `Effect Entries:`),
                elt('td', {}, `${effect_entries}`)))));
    return [itemCard, name];  // Return as array
}