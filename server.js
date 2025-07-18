// Backend Express avec scraping de stock et gestion commandes

const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('frontend'));

let orders = [];

const NEBULA_URL = "https://nebula-market.es";

// Scrape les produits en temps réel
app.get('/api/products', async (req, res) => {
    try {
        const { data } = await axios.get(NEBULA_URL);
        const $ = cheerio.load(data);
        let products = [];

        $('.product-card').each((i, el) => {
            const name = $(el).find('.product-title').text().trim();
            const price = $(el).find('.product-price').text().trim();
            const image = $(el).find('img').attr('src');
            const link = $(el).find('a').attr('href');

            products.push({ name, price, image, link });
        });

        res.json(products);
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors du scraping' });
    }
});

// Enregistrement commandes + preuve de paiement
app.post('/api/confirm', (req, res) => {
    const { product, method, proof, email } = req.body;
    const entry = { id: Date.now(), product, method, proof, email, date: new Date() };
    orders.push(entry);
    fs.writeFileSync('backend/orders.json', JSON.stringify(orders, null, 2));
    res.json({ success: true, message: "Commande enregistrée." });
});

// Récupération des logs commandes
app.get('/api/orders', (req, res) => {
    res.json(orders);
});

app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
