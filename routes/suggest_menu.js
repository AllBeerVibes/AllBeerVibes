require('dotenv').config();
const express = require('express');

const router = express.Router();
router.use(express.static('public'));

//untappd
const apiMethods = require('../public/js/script');
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

router.get('/', (req,res) => {
    res.render('suggestion');
});

module.exports = router;