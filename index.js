
const express = require('express');
const { Client } = require("pg");
const dotenv = require("dotenv");
const cheerio = require('cheerio');
const { curly } = require('node-libcurl');
const util = require('util');
const lib = require("../lib");
const lib_db = require("../lib_db");
const session = require('express-session')
dotenv.config()
const app = express();

const port = 3002;

var path = require('path');
const fs = require('fs');

app.use(
  session({
    secret: "some secret",
    cookie: { maxAge: 300000 },
    saveUninitialized: false,
  })
);

app.use(express.static('public'))

//express global variables
filePath = path.join(__dirname + '/HTML-Moschino1.0.0/shop.html')
html_text  = fs.readFileSync(filePath, {encoding: 'utf-8'});
app.locals.landinghtml = html_text;
filePath = path.join(__dirname + '/HTML-Moschino1.0.0/shop-single.html')
html_product  = fs.readFileSync(filePath, {encoding: 'utf-8'});
app.locals.producthtml = html_product;

//app.locals.cart = new Map();

let CLP = new Intl.NumberFormat('es', {
    style: 'currency',
    currency: 'CLP',
});

//UPDATE CART
app.post('/add/product/:id', async function(req, res) {
	lib.log('[req.session.id:'+req.session.id+'] /add/product/:id');
	lib.log('[req.session.id:'+req.session.id+'] we receive param: '+req.params.id);


	//CHECK IF CART EXITS IN SESSION
	if(req.session.cart === undefined){
		let cart = [];
		lib.log('No existen productos en el cart');	
		cart.push({ cantidad : 1, id:req.params.id});
		req.session.cart = cart;
	}
	else{
		let cart = req.session.cart;
		console.log('typeof cart: '+typeof req.session.cart);
		console.log(' cart: '+ JSON.stringify(req.session.cart));

		const searchObject = cart.find((prod) => prod.id==req.params.id)
		
		if(searchObject !== undefined){
			lib.log('found product:'+searchObject.id);	
			lib.log('[req.session.id:'+req.session.id+'] ya existe en cart');
			let objCart = searchObject;
			let cantidad = objCart.cantidad;
			cantidad = cantidad + 1;
			//objCart.cantidad = cantidad;
			
			let objIndex = cart.findIndex((obj => obj.id == req.params.id));
			lib.log('[req.session.id:'+req.session.id+'] objIndex '+ objIndex);
			cart[objIndex].cantidad = cantidad;

		}else{
			cart.push({id:req.params.id, cantidad:1});
		}
	}
	
	
	console.log(' cart: '+ JSON.stringify(req.session.cart));

	res.send(true);



});


app.get('/product/:id', async function(req, res) {
	lib.log('[req.session.id:'+req.session.id+']');
	//lib.log('app.locals.landing-html '+req.app.locals.landinghtml);


	lib.log('we receive param:'+req.params.id)
	//lib.log('array of products in session:'+req.session.products)

	//Check if Producs are loaded in memory
	if(req.session.products === undefined){
		lib.log('No existen productos en session');	
		let resp = await lib_db.connectPSQLDb("WEB_PRODUCT_OFFERING");
		//let arr = [];
		req.session.products = resp.rows;	
		
	}

	let prodId = req.params.id;
	const searchObject= req.session.products.find((prod) => prod.ID==prodId);
	//lib.log('found product:'+searchObject);
	lib.log('found product:'+searchObject.NOMBRE_CORTO);


	var fs = require('fs');
	//let filePath = path.join(__dirname + '/HTML-Moschino1.0.0/shop-single.html')
	//let html_text  = fs.readFileSync(filePath, {encoding: 'utf-8'});
	let html_text = app.locals.producthtml

	html_text = html_text.replace('${product_name}',searchObject.NOMBRE_CORTO);
	html_text = html_text.replace('${product_image}','/img/'+searchObject.ISBN+'.jpg');
	html_text = html_text.replace('${product_price}','$'+CLP.format(searchObject.PRECIO_VENTA));
	res.send(html_text)	

	//res.sendFile(path.join(__dirname + '/HTML-Moschino1.0.0/shop-single.html'))	

})


app.get('/', async function(req, res) {

	lib.log('[req.session.id:'+req.session.id+']');
	//lib.log('app.locals.landing-html '+req.app.locals.landinghtml);

	//query products for landing page
	let resp = await lib_db.connectPSQLDb("WEB_PRODUCT_OFFERING","fqcomics_store");

	//validate resp
	console.log('resp:'+resp);
	if(resp === undefined){
		console.log('responder en mantencion');
	}

	//process data
	let arr = [];
	arr = resp.rows;

	//store in session
	req.session.products = arr;

	let html_map = await arr.map( function(currentValue,index, array){
		let html_product;
		//console.log('array :'+array.length);
		if(index === 0 || index % 4 === 0){
			html_product = '<li class="first product" id="'+currentValue.ID+'"><a href="/product/'+currentValue.ID+'" id="'+currentValue.ID+'"><img src="./img/'+currentValue.ISBN+'.jpg" alt=""><h3>'+currentValue.NOMBRE_CORTO+'</h3><span class="price"><span class="amount">$'+currentValue.PRECIO_VENTA+'</span></span></a><a href="#" class="button" id="myHref">agregar</a></li>';
		}else if(index === array.length - 1 || index % 4 === 3 ){
			html_product = '<li class="last product" id="'+currentValue.ID+'"><a href="/product/'+currentValue.ID+'" id="'+currentValue.ID+'"><img src="./img/'+currentValue.ISBN+'.jpg" alt=""><h3>'+currentValue.NOMBRE_CORTO+'</h3><span class="price"><span class="amount">$'+currentValue.PRECIO_VENTA+'</span></span></a><a href="#" class="button" id="myHref">agregar</a></li>';
		}else{
			html_product = '<li class="product" id="'+currentValue.ID+'"><a href="/product/'+currentValue.ID+'" id="'+currentValue.ID+'"><img src="./img/'+currentValue.ISBN+'.jpg" alt=""><h3>'+currentValue.NOMBRE_CORTO+'</h3><span class="price"><span class="amount">$'+currentValue.PRECIO_VENTA+'</span></span></a><a href="#" class="button" id="myHref">agregar</a></li>';
		}

		
		//lib.log('aqui '+html_product);		
		return html_product;
	}).join("");
	
	//lib.log('html_map '+html_map);

	//get html as text 
	let html_text;
	var fs = require('fs');
	html_text = app.locals.landinghtml;
	//filePath = path.join(__dirname + '/HTML-Moschino1.0.0/shop.html')
	//html_text  = fs.readFileSync(filePath, {encoding: 'utf-8'});

	//lib.log('html_text '+html_text);
	html_text = html_text.replace('${products}',html_map);
	
	//**********************************
	// UPDATE CART BADGE
	// description: update badge of cart in the header
	//**********************************
	let cart = req.session.cart;
	if(cart !== undefined){
			var badgeValue = cart.reduce((accumulator, currentValue) => accumulator + parseInt(currentValue.cantidad),0);
			console.log('badgeValue:'+badgeValue);
			html_text = html_text.replace('${cart_badge}','<span id="cart_menu_num" class="badge rounded-circle">'+badgeValue+'</span>');	
	}else{
		html_text = html_text.replace('${cart_badge}','<span id="cart_menu_num" style="display:none;" class="badge rounded-circle">'+badgeValue+'</span>');			
	}
	
	

	req.session.authenticated = true;
    req.session.user = { username:'wherrera' };
    //res.json(req.session);
	
	//response html
	res.send(html_text)	
	//res.sendFile(path.join(__dirname + '/HTML-Moschino1.0.0/shop.html'))	

});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));