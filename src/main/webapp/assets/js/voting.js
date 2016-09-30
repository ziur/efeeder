const USER_COLOR = 0x303030;

let ef_User = function(coord, drawer, id, name, placeId)
{
	this.id = id;
	this.coord = coord;
	this.drawer = drawer;
	this.placeId = placeId;
	this.setName(name);
}

ef_User.prototype.setName = function(name)
{
	this.name = name;
	this.textArea = new BkTextArea(
		new BkCoord(0.05, 0.05, 0.9, 0.9, 0, 7),
		name,
		'Tahoma',
		//'Edwardian Script ITC',
		0.8);
}

ef_User.prototype.draw = function()
{
	this.drawer.draw(this);
}

ef_User.prototype.resize = function()
{
	this.textArea.resize();
}

let ef_UserDrawer = function(bkSystem)
{
	this._ctx = bkSystem.ctx;
	this._transform = bkSystem.transform;
	this._system = bkSystem;
}

ef_UserDrawer.prototype.draw = function(o)
{
	let coord = o.coord.toScreen(this._transform);
	let ctx = this._ctx;
	
	let isSelected = ef_myUser === o;
	bkDrawGlassButton(ctx, coord, (isSelected ? 0xA0FFC080 : 0xA0000000) | USER_COLOR, true);

	ctx.fillStyle = isSelected ? '#653' : '#eee';
	o.textArea.draw(ctx, coord);
}

let ef_Place = function(coord, drawer, id, name, description, phone, direction, votes, imgSrc, isSelected)
{
	this.id = id;
	this.coord = coord;
	this.drawer = drawer;
	this.name = name;
	this.description = description;
	this.direction = direction;
	this.phone = phone;
	this.votes = votes;
	this.isSelected = isSelected;
	
	this.img = drawer._system.createImage(imgSrc);
	
	let fontName = 'serif';//'Edwardian Script ITC';
		
	let smallFontName = 'Tahoma';
	
	this.textArea = new BkTextArea(
		new BkCoord(0.05, 0.05, 0.9, 0.3, 0, 7),
		name, fontName, 1, 4);
	this.descriptionTextArea = new BkTextArea(
		new BkCoord(0.05, 0.4, 0.9, 0.35, 0, 7),
		description, fontName, 0.4, 3.5);
	this.directionTextArea = new BkTextArea(
		new BkCoord(0.05, 0.8, 0.7, 0.075, 0, 7),
		'Address: ' + direction, smallFontName, 0.8, 3);
	this.phoneTextArea = new BkTextArea(
		new BkCoord(0.05, 0.875, 0.7, 0.075, 0, 7),
		'Phone: ' + phone, smallFontName, 0.8, 3);
	this.votesTextArea = new BkTextArea(
		new BkCoord(-0.02, -0.02, 0.2, 0.18, 0, 6),
		votes.toString(), smallFontName, 0.8, 4);
}

ef_Place.prototype.draw = function()
{
	this.drawer.draw(this);
}

ef_Place.prototype.resize = function()
{
	this.textArea.resize();
	this.descriptionTextArea.resize();
	this.directionTextArea.resize();
	this.phoneTextArea.resize();
	this.votesTextArea.resize();
}

let ef_PlaceDrawer = function(bkSystem)
{
	this._ctx = bkSystem.ctx;
	this._transform = bkSystem.transform;
	this._system = bkSystem;
}

ef_PlaceDrawer.prototype.draw = function(o)
{
	let coord = o.coord.toScreen(this._transform);
	let ctx = this._ctx;
	
	let isSelectedInUi = this._system.isSelected(o) || o.isSelected;
	
	bkDrawGlassBoard(ctx, coord, o.isSelected ? 0xff010100 : 0x60010100, o.isSelected,
		true);
	
	let coordInner = coord.anisotropicGrow(0.96);
	ctx.globalAlpha = isSelectedInUi ? 1 : 0.5;
	o.img.drawFill(ctx, coordInner);
	ctx.globalAlpha = 1;
	
	
	ctx.fillStyle = '#ff8';
	let border = o.isSelected ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)';
	o.textArea.draw(ctx, coord, border);
	ctx.fillStyle = '#fff';
	o.descriptionTextArea.draw(ctx, coord, border);
	o.directionTextArea.draw(ctx, coord, border);
	o.phoneTextArea.draw(ctx, coord, border);

	bCoord = new BkCoord(-0.02, -0.02, 0.2, 0.2, 0, 6).
		toScreenCoord(coord);
	
	bkDrawGlassButton(ctx, bCoord, isSelectedInUi ? 0xD0fff080 : 0xff050400, true);
	ctx.fillStyle = isSelectedInUi ? '#653' : '#fff';
	o.votesTextArea.draw(ctx, coord);
}

let ef_places = [];
function ef_getPlaceByObject(o)
{
	return ef_places.indexOf(o) === -1 ? null : o;
}

let ef_users = [];
function ef_getUserById(userId)
{
	let count = ef_users.length;
	for (let i = 0; i < count; ++i)
	{
		if (ef_users[i].id === userId)
		{
			return ef_users[i];
		}
	}
	return null;
}

let ef_placeDrawer = null;
let ef_userDrawer = null;

let ef_myUser = null;


//coord, drawer, name, description, direction, phone, img

function _processUserPlaceJson(jsonString)
{
	if (!jsonString || jsonString.length == 0) return;
	let json;
	
	try
	{
		json = JSON.parse(jsonString);
	}
	catch (e)
	{
		//console.log("Received: " + jsonString);
		request.open('GET', '/action/getUserAndPLaceByFoodMeeting?id_food_meeting=' + g_idFoodMeeting.toString());
		request.send('');
		return;
	}
	
	//console.log("Received JSON: " + jsonString);
	
	ef_myUserId = json.userId;
		
	//console.log("userlist: " + json.userList.length);
	//console.log("placelist: " + json.placeList.length);
	
	let count = ef_users.length;
	for (let i = 0; i < count; ++i)
	{
		ef_users[i].drawer = null;
	}
	
	
	count = ef_places.length;
	for (let i = 0; i < count; ++i)
	{
		bkSystem.remove(ef_places[i]);
	}
	
	ef_myUser = null;
	let list = json.userList;
	count = list.length;
	
	bkSystem.unselect();
	
	let pad = 0.02;
	let cellW = 0.25 - pad * 2;
	let cellH = ((1 - pad) / count) - pad;
	
	for (let i = 0; i < count; ++i)
	{
		//console.log("user: " + list[i].name + " [" + list[i].id_User + "] place:" + list[i].id_Place);
		let userId = list[i].id_User;
		let item = ef_getUserById(userId);
		let coord = new BkCoord(pad, pad + (cellH + pad) * i, cellW, cellH, 0, 7);
		
		if (item === null)
		{
			item = new ef_User(coord, ef_userDrawer, userId,
				list[i].name, list[i].id_Place);
			ef_users.push(item);
			bkSystem.add(item);
		}
		else
		{
			item.setName(list[i].name);
			item.placeId = list[i].id_Place;
			item.drawer = ef_userDrawer;
			item.coord = coord;
		}
		
		if (ef_myUserId === userId)
		{
			ef_myUser = item;
		}
	}
	
	
	list = [];
	count = ef_users.length;
	for (let i = 0; i < count; ++i)
	{
		if (ef_users[i].drawer === null)
		{
			bkSystem.remove(ef_users[i]);
		}
		else
		{
			list.push(ef_users[i]);
		}
	}
	ef_users = list;
	
	ef_places = [];
	list = json.placeList;
	count = list.length;
	for (let i = 0; i < count; ++i)
	{
		//console.log("name: " + list[i].name + " [" + list[i].id + "] phone:" + list[i].phone + " votes: " + list[i].votes);
		
		let isSelected = ef_myUser && (ef_myUser.placeId === list[i].id);
		
		let item = new ef_Place(
			new BkCoord(list[i].id, 0, BkCoordDimToNum(0.3, 0.2), 0, 0, 8),
			ef_placeDrawer,
			list[i].id, list[i].name, list[i].description,
			list[i].phone, list[i].direction,
			list[i].votes, list[i].image_link,
			isSelected
			);
		
		if (isSelected)
		{
			BkObjectSetSelected(item);
		}
		
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

var g_sideBarHidden = false;
function _restoreSideBar()
{
	if (!g_sideBarHidden) return;
	
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
	g_sideBarHidden = false;
	bkSystem.resize();
}

function _hideSideBar()
{
	if (g_sideBarHidden) return;
	
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
	mainSideNav.style.left = '-' + w + 'px';

	mainCanvas.style = "position:fixed;padding:0;margin:0;top:0;left:0;width:100%;height:100%;";
	
	g_sideBarHidden = true;
	bkSystem.resize();
}

function _start()
{
	bkSystem = new BkSystem('mainCanvas');
	bkSystem.setDistributionArea(new BkCoord(0.25,0,0.75,1,0,7));
	bkSystem.setBackgroundImage('/assets/img/b0.svg');
	ef_placeDrawer = new ef_PlaceDrawer(bkSystem);
	ef_userDrawer = new ef_UserDrawer(bkSystem);
	
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
			_hideSideBar();
		},
		false);        

	/*
	bkSystem.canvas.onclick = function (e)
	{
		e.preventDefault();
		e.stopPropagation();
		return false;
	}*/

	/*
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
	}*/

	/*
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
	}*/

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

		if (1 == button)
		{
			bkSystem.select(x, y);
			bkSystem.redistribute(true);
			
			if (bkSystem.selectedIndex >= 0)
			{
				let place = ef_getPlaceByObject(bkSystem.item[bkSystem.selectedIndex]);
				if (place)
				{
					let idPlace = place.isSelected ? -1 : place.id;
					
					if (idPlace === -1) _restoreSideBar();
					
					request.open('GET', '/action/createSuggestion?id_food_meeting=' +
						g_idFoodMeeting.toString() + '&id_place=' + idPlace.toString());
					request.send('');
				}
			}
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
