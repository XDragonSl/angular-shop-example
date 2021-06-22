const express = require('express');
const app = express();

app.use(express.static(process.cwd() + '/dist/AngularShopExample'));

app.get('/*', (req, res) => {
	res.sendFile(process.cwd() + '/dist/AngularShopExample/index.html');
});

app.listen(process.env.PORT || 4200);
