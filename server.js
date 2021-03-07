const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.resolve('public')));
app.use(cookieParser());

require('./src/config/database');

app.use(require('./src/routes/index'));

const port = process.env.PORT || 3000;
app.listen(port, console.log(`server listening on port ${port}`));