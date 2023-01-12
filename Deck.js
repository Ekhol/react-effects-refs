import React, { useEffect, useState, useRef } from 'react';
import Card from './Card';
import axios from 'axios';

const API_URL = 'http://deckofcardsapi.com/api/deck';

function Deck() {
    const [deck, setDeck] = useState(null);
    const [drawnCard, setDrawnCard] = useState([]);
    const [autoDraw, setAutoDraw] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        async function getData() {
            let newDeck = await axios.get(`${API_URL}/new/shuffle/`);
            setDeck(newDeck.data);
        }
        getData();
    }, [setDeck]);

    useEffect(() => {
        async function drawCard() {
            let { deck_id } = deck;

            try {
                let res = await axios.get(`${API_URL}/${deck_id}/draw/`);

                if (res.data.remaining === 0) {
                    throw new Error('the deck is spent!');
                }

                const card = res.data.cards[0];

                setDrawnCard(c => [
                    ...c,
                    {
                        id: card.code,
                        name: card.value + " of " + card.suit,
                        image: card.image
                    }
                ]);
            } catch (err) {
                alert(err);
            }
        }

        if (autoDraw && !timerRef.current) {
            timerRef.current = setInterval(async () => {
                await drawCard();
            }, 1000);
        }

        return () => {
            clearInterval(timerRef.current);
            timerRef.current = null;
        };
    }, [autoDraw, setAutoDraw, deck]);

    const toggleAutoDraw = () => {
        setAutoDraw(auto => !auto);
    };

    const cards = drawnCard.map(c => (
        <Card key={c.id} name={c.name} image={c.image} />
    ));

    return (
        <div classname='Deck'>
            {deck ? (
                <button className='Deck-draw' onClick={toggleAutoDraw}>
                    {autoDraw ? 'Stop Drawing' : 'Continue Drawing'}
                </button>
            ) : null}
            <div className='Deck-cards'>{cards}</div>
        </div>
    );
}

export default Deck;