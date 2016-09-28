let ef_User = function(coord, drawer, id, name)
{
	this.id = id;
	this.coord = coord;
	this.drawer = drawer;
	this.name = name;
	this.textArea = new BkTextArea(
		new BkCoord(0.05, 0.05, 0.9, 0.9, 0, 7),
		name,
		'Edwardian Script ITC',
		0.5);
}

ef_User.prototype.draw = function()
{
	this.drawer.draw(this);
}

ef_User.prototype.resize = function()
{
	this.drawer.resize(this);
}

let ef_UserDrawer = function(bkSystem)
{
	this._ctx = bkSystem.ctx;
	this._transform = bkSystem.transform;
	this._system = bkSystem;
}

ef_UserDrawer.prototype.resize = function(o)
{
	let coord = o.coord.toScreen(this._transform);
	o.textArea.resize(this._ctx, coord.w, coord.h);
}

ef_UserDrawer.prototype.draw = function(o)
{
	if (o.textArea.coord == null)
	{
		this.resize(o);
	}
	
	let coord = o.coord.toScreen(this._transform);
	let ctx = this._ctx;
	
	let isSelected = this._system.isSelected(o);
	bkDrawGlassButton(ctx, coord, isSelected ? 0xd0000080 : 0x60000080);

	ctx.fillStyle = '#fff';
	o.textArea.draw(ctx, coord);
}



let ef_Place = function(coord, drawer, id, name, description, phone, direction, imgSrc)
{
	this.id = id;
	this.coord = coord;
	this.drawer = drawer;
	this.name = name;
	this.description = description;
	this.direction = direction;
	this.phone = phone;
	this.img = null;//imgSrc;
	this.textArea = new BkTextArea(
		new BkCoord(0.05, 0.05, 0.9, 0.3, 0, 7),
		name, 'Edwardian Script ITC', 1);
	this.descriptionTextArea = new BkTextArea(
		new BkCoord(0.05, 0.4, 0.9, 0.35, 0, 7),
		description, 'Edwardian Script ITC', 0.4, 3.5);
	this.directionTextArea = new BkTextArea(
		new BkCoord(0.05, 0.8, 0.7, 0.075, 0, 7),
		'Address: ' + direction, 'Edwardian Script ITC', 1, 3);
	this.phoneTextArea = new BkTextArea(
		new BkCoord(0.05, 0.875, 0.7, 0.075, 0, 7),
		'Phone: ' + phone, 'Edwardian Script ITC', 1, 3);
	
}

ef_Place.prototype.draw = function()
{
	this.drawer.draw(this);
}

ef_Place.prototype.resize = function()
{
	this.drawer.resize(this);
}

let ef_PlaceDrawer = function(bkSystem)
{
	this._ctx = bkSystem.ctx;
	this._transform = bkSystem.transform;
	this._system = bkSystem;
}

ef_PlaceDrawer.prototype.resize = function(o)
{
	let coord = o.coord.toScreen(this._transform);
	o.textArea.resize(this._ctx, coord.w, coord.h);
	o.descriptionTextArea.resize(this._ctx, coord.w, coord.h);
	o.directionTextArea.resize(this._ctx, coord.w, coord.h);
	o.phoneTextArea.resize(this._ctx, coord.w, coord.h);
}

ef_PlaceDrawer.prototype.draw = function(o)
{
	if (o.textArea.coord == null)
	{
		this.resize(o);
	}
	
	let coord = o.coord.toScreen(this._transform);
	let ctx = this._ctx;
	
	let isSelected = this._system.isSelected(o);
	
	bkDrawGlassBoard(ctx, coord, isSelected ? 0xd0004020 : 0x60004020, isSelected);
	
	//ctx.globalCompositeOperation = 'lighter';
	
	if (o.img)
	{
		let coordInner = coord.anisotropicGrow(0.96);
		ctx.globalAlpha = 0.15;
		o.img.drawFill(ctx, coordInner);
		ctx.globalAlpha = 1;
	}

	ctx.fillStyle = '#8f8';
	o.textArea.draw(ctx, coord);
	ctx.fillStyle = '#fff';
	o.descriptionTextArea.draw(ctx, coord);
	o.directionTextArea.draw(ctx, coord);
	o.phoneTextArea.draw(ctx, coord);
}

let ef_places = [];
let ef_chosenPlaces = [];
let ef_users = [];

let ef_placeDrawer = null;
let ef_userDrawer = null;


//coord, drawer, name, description, direction, phone, img

function _processUserPlaceJson(jsonString)
{
	console.log("Success: " + jsonString);
	if (!jsonString || jsonString.length == 0) return;
	let json = JSON.parse(jsonString);
	
	
	console.log("userlist: " + json.userList.length);
	console.log("placelist: " + json.placeList.length);
	
	let count = ef_users.length;
	for (let i = 0; i < count; ++i)
	{
		bkSystem.remove(ef_users[i]);
	}
	
	count = ef_places.length;
	for (let i = 0; i < count; ++i)
	{
		bkSystem.remove(ef_places[i]);
	}	
	
	chosenPlaceIds = [];
	ef_users = [];
	let list = json.userList;
	count = list.length;
	for (let i = 0; i < count; ++i)
	{
		console.log("user: " + list[i].name + " [" + list[i].id_User + "] place:" + list[i].id_Place);
		
		chosenPlaceIds.push(list[i].id_Place);
		
		let item = new ef_User(
			new BkCoord(i, 0, BkCoordDimToNum(0.3, 0.2), 0, 0, 8),
			ef_userDrawer, list[i].id_User, list[i].name);
		
		
		ef_users.push(item);
		bkSystem.add(item);
	}
	
	let userCount = count;
	ef_places = [];
	list = json.placeList;
	count = list.length;
	for (let i = 0; i < count; ++i)
	{
		console.log("name: " + list[i].name + " [" + list[i].id + "] phone:" + list[i].phone);
		
		let item = new ef_Place(
			new BkCoord(i + userCount, 0, BkCoordDimToNum(0.3, 0.2), 0, 0, 8),
			ef_placeDrawer,
			list[i].id, list[i].name, list[i].description, list[i].phone, list[i].direction, list[i].image_link);
		
		
		ef_places.push(item);
		bkSystem.add(item);
	}
	

	bkSystem.redistribute(true);
}

let request = null;

let bkSystem;

var mainSideNav = document.getElementById('mainSideNav');
mainSideNav.style.transition = 'visibility 1s, left 1s'
var mainCanvas = document.getElementById('mainCanvas');
var fullscreen = false;

function _start()
{
	bkSystem = new BkSystem('mainCanvas');
	
	ef_placeDrawer = new ef_PlaceDrawer(bkSystem);
	ef_userDrawer = new ef_UserDrawer(bkSystem);

	bkSystem.setBackgroundImage('/assets/img/b0.svg');
	
	//console.log("id: " + g_idFoodMeeting);
	

	request = new XMLHttpRequest();
	request.onreadystatechange = function () {
		let DONE = this.DONE || 4;
		if (this.readyState === DONE)
		{
			_processUserPlaceJson(request.responseText);
		}
	};
	request.open('GET', '/action/getUserAndPLaceByFoodMeeting?id_food_meeting=' + g_idFoodMeeting.toString());
	request.send('');



	mainSideNav.addEventListener("mousedown",
		function() {
			if (fullscreen) return;
			var list = document.getElementsByTagName("footer");
			for (var i = 0; i < list.length; ++i)
			{
				list[i].style.visibility = 'hidden';
			}
			var list = document.getElementsByTagName("nav");
			for (var i = 0; i < list.length; ++i)
			{
				list[i].style.visibility = 'hidden';
			}                        

			var w = mainSideNav.offsetWidth;
			mainSideNav.style.visibility = 'hidden';
			//mainSideNav.style.visibility = 'visible';
			mainSideNav.style.left = '-' + w + 'px';

			mainCanvas.style = "position:fixed;padding:0;margin:0;top:0;left:0;width:100%;height:100%;";
			
			bkSystem.resize();
			
			fullscreen = true;
		},
		false);        

	
	bkSystem.canvas.onclick = function (e)
	{
		e.preventDefault();
		e.stopPropagation();
		return false;
	}

	bkSystem.canvas.onmouseout = function (e)
	{
		bkSystem.mouse.button = 0;
		//bkSystem.unselect();
		
		e.preventDefault();
		e.stopPropagation();
		return false;
	}

	bkSystem.canvas.onmouseup = function (e)
	{
		bkSystem.mouse.button = 0;
		//bkSystem.unselect();
		
		e.preventDefault();
		e.stopPropagation();
		return false;
	}

	bkSystem.canvas.onmousemove = function (e)
	{
		let rect = bkSystem.canvas.getBoundingClientRect();
		let x = e.clientX - rect.left;
		let y = e.clientY - rect.top;
		if (1 == bkSystem.mouse.button)
		{
			//bkSystem.moveSelected(x, y);
		}

		bkSystem.mouse.x = x;
		bkSystem.mouse.y = y;
		
		e.preventDefault();
		e.stopPropagation();
		return false;
	}

	bkSystem.canvas.onmousedown = function (e)
	{
		let rect = bkSystem.canvas.getBoundingClientRect();
		let x = e.clientX - rect.left;
		let y = e.clientY - rect.top;
		let button = e.which;
		bkSystem.mouse.x0 = x
		bkSystem.mouse.y0 = y
		bkSystem.mouse.x = x;
		bkSystem.mouse.y = y;
		bkSystem.mouse.button = button;
		bkSystem.mouse.action = 0;
		console.log("x: " + x + ", y: " + y);

		if (2 == button)
		{

		}
		else if (1 == button)
		{
			bkSystem.select(x, y);
			bkSystem.redistribute(true);
		}
		
		if (fullscreen)
		{
			/*
			var list = document.getElementsByTagName("footer");
			for (var i = 0; i < list.length; ++i)
			{
				list[i].style.visibility = 'visible';
			}
			var list = document.getElementsByTagName("nav");
			for (var i = 0; i < list.length; ++i)
			{
				list[i].style.visibility = 'visible';
			}                        

			var w = mainSideNav.offsetWidth;
			mainSideNav.style.visibility = 'visible';
			mainSideNav.style.left = '0px';

			mainCanvas.style = "width:82.5vw;height:80vh;";
			fullscreen = false;*/
		}
		
		e.preventDefault();
		e.stopPropagation();
		return false;
	};
	
	bkSystem.run();
}

window.addEventListener("load",
	function() {
		_start();
	},
	false);
