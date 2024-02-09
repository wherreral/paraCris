
const express = require('express');
const { Client } = require("pg");
const dotenv = require("dotenv");
const cheerio = require('cheerio');
const { curly } = require('node-libcurl');
const util = require('util');
const lib = require("./lib.js");
const lib_db = require("./lib_db.js");
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
	//let resp = await lib_db.connectPSQLDb("WEB_PRODUCT_OFFERING","fqcomics_store");

	//validate resp
	//console.log('resp:'+JSON.stringify(resp.rows));
	//if(resp === undefined){
		//console.log('responder en mantencion');
	//}

	//process data
	let arr = [{"ID":2,"AUTOR":"Alan Moore, Dave Gibbons","BODEGA":null,"CANTIDAD":null,"EDITORIAL":"ECC","ISBN":"9788417509774","NOMBRE":"Watchmen (Edición Deluxe) (Tercera edición)","NOMBRE_CORTO":"Watchmen Deluxe","PRECIO_COSTO":null,"PRECIO_PISO":null,"PRECIO_VENTA":60990},{"ID":3,"AUTOR":"Alan Moore, David Lloyd","BODEGA":null,"CANTIDAD":null,"EDITORIAL":"ECC","ISBN":"9788416796809","NOMBRE":"V de Vendetta (Edición Deluxe) 2ª edición","NOMBRE_CORTO":"V de Vendetta Deluxe","PRECIO_COSTO":null,"PRECIO_PISO":null,"PRECIO_VENTA":55990},{"ID":4,"AUTOR":"Moore, Alan","BODEGA":null,"CANTIDAD":null,"EDITORIAL":"ECC","ISBN":"9788418326936","NOMBRE":"V de Vendetta (Edición cartoné) (Cuarta edición)","NOMBRE_CORTO":"V de Vendetta","PRECIO_COSTO":null,"PRECIO_PISO":null,"PRECIO_VENTA":40990},{"ID":5,"AUTOR":"James Tynion IV, Scott Snyde, Greg Capullo, Jason Fabok, Rafael Albuquerque","BODEGA":null,"CANTIDAD":null,"EDITORIAL":"ECC","ISBN":"9788418475849","NOMBRE":"Batman Vol. 1: El Tribunal de los Búhos (Batman Saga Nuevo Universo Parte 1)","NOMBRE_CORTO":"Batman vol 1. Tribunal de los Búhos","PRECIO_COSTO":null,"PRECIO_PISO":null,"PRECIO_VENTA":43990},{"ID":6,"AUTOR":"Alan Moore, Brian Bolland","BODEGA":null,"CANTIDAD":null,"EDITORIAL":"ECC","ISBN":"9788417665142","NOMBRE":"La Broma asesina Versión extendida (Edición Deluxe) (2a edición)","NOMBRE_CORTO":"La Broma Asesina Deluxe","PRECIO_COSTO":null,"PRECIO_PISO":null,"PRECIO_VENTA":43990},{"ID":7,"AUTOR":"Garth Ennis, Steve Dillon","BODEGA":null,"CANTIDAD":null,"EDITORIAL":"ECC","ISBN":"9788418043192","NOMBRE":"Predicador vol. 1 (Edición Deluxe) (Segunda edición)","NOMBRE_CORTO":"Predicador vol 1","PRECIO_COSTO":null,"PRECIO_PISO":null,"PRECIO_VENTA":53990},{"ID":8,"AUTOR":"Alan Moore, Jacen Burrows","BODEGA":null,"CANTIDAD":null,"EDITORIAL":"PANINI","ISBN":"9788411015158","NOMBRE":"Providence 1. El miedo que acecha","NOMBRE_CORTO":"Providence 1. El miedo que acecha","PRECIO_COSTO":null,"PRECIO_PISO":null,"PRECIO_VENTA":26990},{"ID":9,"AUTOR":"Alan Moore, Jacen Burrows","BODEGA":null,"CANTIDAD":null,"EDITORIAL":"PANINI","ISBN":"9788490947470","NOMBRE":"Providence 2. El abismo del tiempo","NOMBRE_CORTO":"Providence 2. El abismo del tiempo","PRECIO_COSTO":null,"PRECIO_PISO":null,"PRECIO_VENTA":23990},{"ID":10,"AUTOR":"Alan Moore, Jacen Burrows","BODEGA":null,"CANTIDAD":null,"EDITORIAL":"PANINI","ISBN":"9788491671510","NOMBRE":"Providence 3. Lo innombrable","NOMBRE_CORTO":"Providence 3. Lo innombrable","PRECIO_COSTO":null,"PRECIO_PISO":null,"PRECIO_VENTA":23990},{"ID":11,"AUTOR":"Alan Moore","BODEGA":null,"CANTIDAD":null,"EDITORIAL":"PANINI","ISBN":"9788498857238","NOMBRE":"Neonomicon","NOMBRE_CORTO":"Neonomicon","PRECIO_COSTO":null,"PRECIO_PISO":null,"PRECIO_VENTA":22990},{"ID":12,"AUTOR":"Mark Millar","BODEGA":null,"CANTIDAD":null,"EDITORIAL":"PANINI","ISBN":"9788498855142","NOMBRE":"CIVIL WAR Marvel Deluxe Tapa Dura","NOMBRE_CORTO":"Civil War Deluxe","PRECIO_COSTO":null,"PRECIO_PISO":null,"PRECIO_VENTA":29990},{"ID":13,"AUTOR":"Kentaro Miura","BODEGA":null,"CANTIDAD":null,"EDITORIAL":"PANINI","ISBN":"9788411015035","NOMBRE":"Berserk Maximum 1","NOMBRE_CORTO":"Berserk Maximum 1","PRECIO_COSTO":null,"PRECIO_PISO":null,"PRECIO_VENTA":22990},{"ID":14,"AUTOR":"Tsutomu Nihei","BODEGA":null,"CANTIDAD":null,"EDITORIAL":"PANINI","ISBN":"9788490948620","NOMBRE":"Blame! Master Edition 1","NOMBRE_CORTO":"Blame! Master Edition 1","PRECIO_COSTO":null,"PRECIO_PISO":null,"PRECIO_VENTA":29990},{"ID":15,"AUTOR":"Hajime Isayama","BODEGA":null,"CANTIDAD":null,"EDITORIAL":"NORMA","ISBN":"9788467909708","NOMBRE":"ATAQUE A LOS TITANES 1 ","NOMBRE_CORTO":"Ataque a los Titanes 1 ","PRECIO_COSTO":null,"PRECIO_PISO":null,"PRECIO_VENTA":12990},{"ID":16,"AUTOR":"Hajime Isayama","BODEGA":null,"CANTIDAD":null,"EDITORIAL":"NORMA","ISBN":"9788467909715","NOMBRE":"ATAQUE A LOS TITANES 2","NOMBRE_CORTO":"Ataque a los Titanes 2","PRECIO_COSTO":null,"PRECIO_PISO":null,"PRECIO_VENTA":12690},{"ID":17,"AUTOR":"Hajime Isayama","BODEGA":null,"CANTIDAD":null,"EDITORIAL":"NORMA","ISBN":"9788467910995","NOMBRE":"ATAQUE A LOS TITANES 3","NOMBRE_CORTO":"Ataque a los Titanes 3","PRECIO_COSTO":null,"PRECIO_PISO":null,"PRECIO_VENTA":12690},{"ID":18,"AUTOR":"Hajime Isayama","BODEGA":null,"CANTIDAD":null,"EDITORIAL":"NORMA","ISBN":"9788467911503","NOMBRE":"ATAQUE A LOS TITANES 4","NOMBRE_CORTO":"Ataque a los Titanes 4","PRECIO_COSTO":null,"PRECIO_PISO":null,"PRECIO_VENTA":12690},{"ID":19,"AUTOR":"Hajime Isayama","BODEGA":null,"CANTIDAD":null,"EDITORIAL":"NORMA","ISBN":"9788467912616","NOMBRE":"ATAQUE A LOS TITANES 5","NOMBRE_CORTO":"Ataque a los Titanes 5","PRECIO_COSTO":null,"PRECIO_PISO":null,"PRECIO_VENTA":12690},{"ID":20,"AUTOR":"Gege Akutami","BODEGA":null,"CANTIDAD":null,"EDITORIAL":"NORMA","ISBN":"9788467941920","NOMBRE":"JUJUTSU KAISEN (GUERRA DE HECHICEROS) 0. Escuela técnica de hechicería del área metropolitana de Tokio","NOMBRE_CORTO":"Jujutsu Kaisen 0","PRECIO_COSTO":null,"PRECIO_PISO":null,"PRECIO_VENTA":13990},{"ID":21,"AUTOR":"Gege Akutami","BODEGA":null,"CANTIDAD":null,"EDITORIAL":"NORMA","ISBN":"9788467940657","NOMBRE":"JUJUTSU KAISEN (GUERRA DE HECHICEROS) 1. Ryômen-Sukuna","NOMBRE_CORTO":"Jujutsu Kaisen 1","PRECIO_COSTO":null,"PRECIO_PISO":null,"PRECIO_VENTA":13990},{"ID":22,"AUTOR":"Gege Akutami","BODEGA":null,"CANTIDAD":null,"EDITORIAL":"NORMA","ISBN":"9788467941562","NOMBRE":"JUJUTSU KAISEN (GUERRA DE HECHICEROS) 2. El feto maldito bajo el cielo","NOMBRE_CORTO":"Jujutsu Kaisen 2","PRECIO_COSTO":null,"PRECIO_PISO":null,"PRECIO_VENTA":13990},{"ID":23,"AUTOR":"Gege Akutami","BODEGA":null,"CANTIDAD":null,"EDITORIAL":"NORMA","ISBN":"9788467941913","NOMBRE":"JUJUTSU KAISEN (GUERRA DE HECHICEROS) 3. El pececillo y el castigo proporcionalmente inverso","NOMBRE_CORTO":"Jujutsu Kaisen 3","PRECIO_COSTO":null,"PRECIO_PISO":null,"PRECIO_VENTA":13990},{"ID":24,"AUTOR":"Gege Akutami","BODEGA":null,"CANTIDAD":null,"EDITORIAL":"NORMA","ISBN":"9788467942699","NOMBRE":"JUJUTSU KAISEN (GUERRA DE HECHICEROS) 4. Te mataré","NOMBRE_CORTO":"Jujutsu Kaisen 4","PRECIO_COSTO":null,"PRECIO_PISO":null,"PRECIO_VENTA":13990},{"ID":25,"AUTOR":"Gege Akutami","BODEGA":null,"CANTIDAD":null,"EDITORIAL":"NORMA","ISBN":"9788467943542","NOMBRE":"JUJUTSU KAISEN (GUERRA DE HECHICEROS) 5. Reunión de intercambio con el instituto hermano de Kioto","NOMBRE_CORTO":"Jujutsu Kaisen 5","PRECIO_COSTO":null,"PRECIO_PISO":null,"PRECIO_VENTA":13990},{"ID":26,"AUTOR":"Tatsuki Fujimoto","BODEGA":null,"CANTIDAD":null,"EDITORIAL":"NORMA","ISBN":"9788467941159","NOMBRE":"CHAINSAW MAN 1 ","NOMBRE_CORTO":"Chainsaw Man 1","PRECIO_COSTO":null,"PRECIO_PISO":null,"PRECIO_VENTA":13990},{"ID":27,"AUTOR":"Tatsuki Fujimoto","BODEGA":null,"CANTIDAD":null,"EDITORIAL":"NORMA","ISBN":"9788467942620","NOMBRE":"CHAINSAW MAN 2 ","NOMBRE_CORTO":"Chainsaw Man 2","PRECIO_COSTO":null,"PRECIO_PISO":null,"PRECIO_VENTA":13990},{"ID":28,"AUTOR":"Tatsuki Fujimoto","BODEGA":null,"CANTIDAD":null,"EDITORIAL":"NORMA","ISBN":"9788467943511","NOMBRE":"CHAINSAW MAN 3","NOMBRE_CORTO":"Chainsaw Man 3","PRECIO_COSTO":null,"PRECIO_PISO":null,"PRECIO_VENTA":13990},{"ID":29,"AUTOR":"Tatsuki Fujimoto","BODEGA":null,"CANTIDAD":null,"EDITORIAL":"NORMA","ISBN":"9788467944174","NOMBRE":"CHAINSAW MAN 4","NOMBRE_CORTO":"Chainsaw Man 4","PRECIO_COSTO":null,"PRECIO_PISO":null,"PRECIO_VENTA":13990},{"ID":30,"AUTOR":"Tatsuki Fujimoto","BODEGA":null,"CANTIDAD":null,"EDITORIAL":"NORMA","ISBN":"9788467945096","NOMBRE":"CHAINSAW MAN 5","NOMBRE_CORTO":"Chainsaw Man 5","PRECIO_COSTO":null,"PRECIO_PISO":null,"PRECIO_VENTA":13990},{"ID":31,"AUTOR":"Koyoharu Gotouge","BODEGA":null,"CANTIDAD":null,"EDITORIAL":"NORMA","ISBN":"9788467935127","NOMBRE":"GUARDIANES DE LA NOCHE 2","NOMBRE_CORTO":"Guardianes de la Noche 2","PRECIO_COSTO":null,"PRECIO_PISO":null,"PRECIO_VENTA":13990},{"ID":32,"AUTOR":"Koyoharu Gotouge","BODEGA":null,"CANTIDAD":null,"EDITORIAL":"NORMA","ISBN":"9788467935134","NOMBRE":"GUARDIANES DE LA NOCHE 3","NOMBRE_CORTO":"Guardianes de la Noche 3","PRECIO_COSTO":null,"PRECIO_PISO":null,"PRECIO_VENTA":13990},{"ID":33,"AUTOR":"Koyoharu Gotouge","BODEGA":null,"CANTIDAD":null,"EDITORIAL":"NORMA","ISBN":"9788467936681","NOMBRE":"GUARDIANES DE LA NOCHE 4","NOMBRE_CORTO":"Guardianes de la Noche 4","PRECIO_COSTO":null,"PRECIO_PISO":null,"PRECIO_VENTA":13990},{"ID":34,"AUTOR":"Koyoharu Gotouge","BODEGA":null,"CANTIDAD":null,"EDITORIAL":"NORMA","ISBN":"9788467936698","NOMBRE":"GUARDIANES DE LA NOCHE 5","NOMBRE_CORTO":"Guardianes de la Noche 5","PRECIO_COSTO":null,"PRECIO_PISO":null,"PRECIO_VENTA":13990},{"ID":35,"AUTOR":"Ken Wakui","BODEGA":null,"CANTIDAD":null,"EDITORIAL":"NORMA","ISBN":"9788467947083","NOMBRE":"TOKYO REVENGERS 2","NOMBRE_CORTO":"Tokyo Revengers 2","PRECIO_COSTO":null,"PRECIO_PISO":null,"PRECIO_VENTA":19990},{"ID":36,"AUTOR":"Ken Wakui","BODEGA":null,"CANTIDAD":null,"EDITORIAL":"NORMA","ISBN":"9788467947106","NOMBRE":"TOKYO REVENGERS 4","NOMBRE_CORTO":"Tokyo Revengers 4","PRECIO_COSTO":null,"PRECIO_PISO":null,"PRECIO_VENTA":19990},{"ID":37,"AUTOR":"JODOROWSKY, ALEJANDRO/MOEBIUS","BODEGA":null,"CANTIDAD":null,"EDITORIAL":"RANDOM HOUSE","ISBN":"9788416709298","NOMBRE":"INCAL, EL (INTEGRAL)","NOMBRE_CORTO":"El Incal Integral","PRECIO_COSTO":null,"PRECIO_PISO":null,"PRECIO_VENTA":49990},{"ID":38,"AUTOR":"JODOROWSKY, ALEJANDRO/MOEBIUS","BODEGA":null,"CANTIDAD":null,"EDITORIAL":"RANDOM HOUSE","ISBN":"9788467906769","NOMBRE":"EL INCAL","NOMBRE_CORTO":"El Incal","PRECIO_COSTO":null,"PRECIO_PISO":null,"PRECIO_VENTA":19990}];
	
	//arr = resp.rows;

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

		//html_product = '<li class="first product" id="2"><a href="/product/2" id="2"><img src="./img/9788417509774.jpg" alt=""><h3>Watchmen Deluxe</h3><span class="price"><span class="amount">$60990</span></span></a><a href="#" class="button" id="myHref">agregar</a></li><li class="product" id="3"><a href="/product/3" id="3"><img src="./img/9788416796809.jpg" alt=""><h3>V de Vendetta Deluxe</h3><span class="price"><span class="amount">$55990</span></span></a><a href="#" class="button" id="myHref">agregar</a></li><li class="product" id="4"><a href="/product/4" id="4"><img src="./img/9788418326936.jpg" alt=""><h3>V de Vendetta</h3><span class="price"><span class="amount">$40990</span></span></a><a href="#" class="button" id="myHref">agregar</a></li><li class="last product" id="5"><a href="/product/5" id="5"><img src="./img/9788418475849.jpg" alt=""><h3>Batman vol 1. Tribunal de los Búhos</h3><span class="price"><span class="amount">$43990</span></span></a><a href="#" class="button" id="myHref">agregar</a></li><li class="first product" id="6"><a href="/product/6" id="6"><img src="./img/9788417665142.jpg" alt=""><h3>La Broma Asesina Deluxe</h3><span class="price"><span class="amount">$43990</span></span></a><a href="#" class="button" id="myHref">agregar</a></li><li class="product" id="7"><a href="/product/7" id="7"><img src="./img/9788418043192.jpg" alt=""><h3>Predicador vol 1</h3><span class="price"><span class="amount">$53990</span></span></a><a href="#" class="button" id="myHref">agregar</a></li><li class="product" id="8"><a href="/product/8" id="8"><img src="./img/9788411015158.jpg" alt=""><h3>Providence 1. El miedo que acecha</h3><span class="price"><span class="amount">$26990</span></span></a><a href="#" class="button" id="myHref">agregar</a></li><li class="last product" id="9"><a href="/product/9" id="9"><img src="./img/9788490947470.jpg" alt=""><h3>Providence 2. El abismo del tiempo</h3><span class="price"><span class="amount">$23990</span></span></a><a href="#" class="button" id="myHref">agregar</a></li><li class="first product" id="10"><a href="/product/10" id="10"><img src="./img/9788491671510.jpg" alt=""><h3>Providence 3. Lo innombrable</h3><span class="price"><span class="amount">$23990</span></span></a><a href="#" class="button" id="myHref">agregar</a></li><li class="product" id="11"><a href="/product/11" id="11"><img src="./img/9788498857238.jpg" alt=""><h3>Neonomicon</h3><span class="price"><span class="amount">$22990</span></span></a><a href="#" class="button" id="myHref">agregar</a></li><li class="product" id="12"><a href="/product/12" id="12"><img src="./img/9788498855142.jpg" alt=""><h3>Civil War Deluxe</h3><span class="price"><span class="amount">$29990</span></span></a><a href="#" class="button" id="myHref">agregar</a></li><li class="last product" id="13"><a href="/product/13" id="13"><img src="./img/9788411015035.jpg" alt=""><h3>Berserk Maximum 1</h3><span class="price"><span class="amount">$22990</span></span></a><a href="#" class="button" id="myHref">agregar</a></li><li class="first product" id="14"><a href="/product/14" id="14"><img src="./img/9788490948620.jpg" alt=""><h3>Blame! Master Edition 1</h3><span class="price"><span class="amount">$29990</span></span></a><a href="#" class="button" id="myHref">agregar</a></li><li class="product" id="15"><a href="/product/15" id="15"><img src="./img/9788467909708.jpg" alt=""><h3>Ataque a los Titanes 1 </h3><span class="price"><span class="amount">$12990</span></span></a><a href="#" class="button" id="myHref">agregar</a></li><li class="product" id="16"><a href="/product/16" id="16"><img src="./img/9788467909715.jpg" alt=""><h3>Ataque a los Titanes 2</h3><span class="price"><span class="amount">$12690</span></span></a><a href="#" class="button" id="myHref">agregar</a></li><li class="last product" id="17"><a href="/product/17" id="17"><img src="./img/9788467910995.jpg" alt=""><h3>Ataque a los Titanes 3</h3><span class="price"><span class="amount">$12690</span></span></a><a href="#" class="button" id="myHref">agregar</a></li><li class="first product" id="18"><a href="/product/18" id="18"><img src="./img/9788467911503.jpg" alt=""><h3>Ataque a los Titanes 4</h3><span class="price"><span class="amount">$12690</span></span></a><a href="#" class="button" id="myHref">agregar</a></li><li class="product" id="19"><a href="/product/19" id="19"><img src="./img/9788467912616.jpg" alt=""><h3>Ataque a los Titanes 5</h3><span class="price"><span class="amount">$12690</span></span></a><a href="#" class="button" id="myHref">agregar</a></li><li class="product" id="20"><a href="/product/20" id="20"><img src="./img/9788467941920.jpg" alt=""><h3>Jujutsu Kaisen 0</h3><span class="price"><span class="amount">$13990</span></span></a><a href="#" class="button" id="myHref">agregar</a></li><li class="last product" id="21"><a href="/product/21" id="21"><img src="./img/9788467940657.jpg" alt=""><h3>Jujutsu Kaisen 1</h3><span class="price"><span class="amount">$13990</span></span></a><a href="#" class="button" id="myHref">agregar</a></li><li class="first product" id="22"><a href="/product/22" id="22"><img src="./img/9788467941562.jpg" alt=""><h3>Jujutsu Kaisen 2</h3><span class="price"><span class="amount">$13990</span></span></a><a href="#" class="button" id="myHref">agregar</a></li><li class="product" id="23"><a href="/product/23" id="23"><img src="./img/9788467941913.jpg" alt=""><h3>Jujutsu Kaisen 3</h3><span class="price"><span class="amount">$13990</span></span></a><a href="#" class="button" id="myHref">agregar</a></li><li class="product" id="24"><a href="/product/24" id="24"><img src="./img/9788467942699.jpg" alt=""><h3>Jujutsu Kaisen 4</h3><span class="price"><span class="amount">$13990</span></span></a><a href="#" class="button" id="myHref">agregar</a></li><li class="last product" id="25"><a href="/product/25" id="25"><img src="./img/9788467943542.jpg" alt=""><h3>Jujutsu Kaisen 5</h3><span class="price"><span class="amount">$13990</span></span></a><a href="#" class="button" id="myHref">agregar</a></li><li class="first product" id="26"><a href="/product/26" id="26"><img src="./img/9788467941159.jpg" alt=""><h3>Chainsaw Man 1</h3><span class="price"><span class="amount">$13990</span></span></a><a href="#" class="button" id="myHref">agregar</a></li><li class="product" id="27"><a href="/product/27" id="27"><img src="./img/9788467942620.jpg" alt=""><h3>Chainsaw Man 2</h3><span class="price"><span class="amount">$13990</span></span></a><a href="#" class="button" id="myHref">agregar</a></li><li class="product" id="28"><a href="/product/28" id="28"><img src="./img/9788467943511.jpg" alt=""><h3>Chainsaw Man 3</h3><span class="price"><span class="amount">$13990</span></span></a><a href="#" class="button" id="myHref">agregar</a></li><li class="last product" id="29"><a href="/product/29" id="29"><img src="./img/9788467944174.jpg" alt=""><h3>Chainsaw Man 4</h3><span class="price"><span class="amount">$13990</span></span></a><a href="#" class="button" id="myHref">agregar</a></li><li class="first product" id="30"><a href="/product/30" id="30"><img src="./img/9788467945096.jpg" alt=""><h3>Chainsaw Man 5</h3><span class="price"><span class="amount">$13990</span></span></a><a href="#" class="button" id="myHref">agregar</a></li><li class="product" id="31"><a href="/product/31" id="31"><img src="./img/9788467935127.jpg" alt=""><h3>Guardianes de la Noche 2</h3><span class="price"><span class="amount">$13990</span></span></a><a href="#" class="button" id="myHref">agregar</a></li><li class="product" id="32"><a href="/product/32" id="32"><img src="./img/9788467935134.jpg" alt=""><h3>Guardianes de la Noche 3</h3><span class="price"><span class="amount">$13990</span></span></a><a href="#" class="button" id="myHref">agregar</a></li><li class="last product" id="33"><a href="/product/33" id="33"><img src="./img/9788467936681.jpg" alt=""><h3>Guardianes de la Noche 4</h3><span class="price"><span class="amount">$13990</span></span></a><a href="#" class="button" id="myHref">agregar</a></li><li class="first product" id="34"><a href="/product/34" id="34"><img src="./img/9788467936698.jpg" alt=""><h3>Guardianes de la Noche 5</h3><span class="price"><span class="amount">$13990</span></span></a><a href="#" class="button" id="myHref">agregar</a></li><li class="product" id="35"><a href="/product/35" id="35"><img src="./img/9788467947083.jpg" alt=""><h3>Tokyo Revengers 2</h3><span class="price"><span class="amount">$19990</span></span></a><a href="#" class="button" id="myHref">agregar</a></li><li class="product" id="36"><a href="/product/36" id="36"><img src="./img/9788467947106.jpg" alt=""><h3>Tokyo Revengers 4</h3><span class="price"><span class="amount">$19990</span></span></a><a href="#" class="button" id="myHref">agregar</a></li><li class="last product" id="37"><a href="/product/37" id="37"><img src="./img/9788416709298.jpg" alt=""><h3>El Incal Integral</h3><span class="price"><span class="amount">$49990</span></span></a><a href="#" class="button" id="myHref">agregar</a></li><li class="first product" id="38"><a href="/product/38" id="38"><img src="./img/9788467906769.jpg" alt=""><h3>El Incal</h3><span class="price"><span class="amount">$19990</span></span></a><a href="#" class="button" id="myHref">agregar</a></li>'
		
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