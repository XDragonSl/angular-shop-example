const express = require('express');
const app = express();

app.use(express.static(`${process.cwd()}/dist/angular-shop-example`));

app.get('/*', (req, res) => {
	res.sendFile(`${process.cwd()}/dist/angular-shop-example/index.html`);
});

app.listen(process.env.PORT || 4200);
