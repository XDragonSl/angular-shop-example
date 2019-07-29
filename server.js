const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(process.cwd() + '/dist/Task'));

app.get('/*', (req, res) => {
	res.sendFile(process.cwd() + '/dist/Task/index.html');
});

app.listen(process.env.PORT || 4200);
