const express = require('express');

const app = express();

app.get('/', (req, res) => res.send('API locked and loaded!'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Sever running on port: ${PORT}, Captain o/`));
