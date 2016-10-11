'use strict';

const USER_COLOR = 0x303030;
const SELECTED_COLOR = 0xD0C0A040;
const UNSELECTED_COLOR = 0xff050400;
const SELECTED_GLASS_COLOR = 0xC0181C20;
const UNSELECTED_GLASS_COLOR = 0x60181C20;
const LARGE_FONT_NAME = 'serif';
const FONT_NAME = 'Tahoma';

let ef_Button = function(coord, drawer, text, onclick)
{
	this.coord = coord;
	this.drawer = drawer;
	this.onclick = onclick;
	this.textArea = new BkText(
		new BkCoord(0.05, 0.05, 0.9, 0.9, 0, 7),
		text, FONT_NAME);
}

ef_Button.prototype.draw = function()
{
	this.drawer.draw(this);
}

ef_Button.prototype.resize = function()
{
}

let ef_ButtonDrawer = function(bkSystem)
{
	this._ctx = bkSystem.ctx;
	this._transform = bkSystem.transform;
	this._system = bkSystem;
}

ef_ButtonDrawer.prototype.draw = function(o)
{
	let coord = o.coord.toScreen(this._transform);
	let ctx = this._ctx;
	
	bkDrawGlassButton(ctx, coord, (o === g_hoverObject) ? SELECTED_COLOR : UNSELECTED_COLOR);
	ctx.fillStyle = '#fff';
	o.textArea.draw(ctx, coord);
}

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
	this.textArea = new BkTextArea(
		new BkCoord(0.1, 0.1, 0.8, 0.8, 0, 7),
		name,
		FONT_NAME,
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
	bkDrawGlassButton(ctx, coord, (isSelected ? SELECTED_COLOR : UNSELECTED_COLOR), true, 0.5);

	ctx.fillStyle = '#fff';
	o.textArea.draw(ctx, coord);
}

let ef_Place = function(coord, drawer, id, name, description, phone, direction, votes, imgSrc, isSelected)
{
	this.id = id;
	this.coord = coord;
	this.drawer = drawer;
	this.votes = votes;
	this.isSelected = isSelected;
	this.__imgSrc = null;
	this.__img = null;
	this.__name = null;
	this.__description = null;
	this.__location = null;
	
	this.setImg(imgSrc);
	
	this.votesText = new BkText(
		new BkCoord(-0.02, -0.02, 0.2, 0.18, 0, 6), null, FONT_NAME);
	
	this.setTextFields(name, description, phone, direction);
}

ef_Place.prototype.setTextFields = function(name, description, phone, direction)
{
	if (this.__name !== name)
	{
		this.__name = name;
		this.textArea = new BkTextArea(
			new BkCoord(0.05, 0.05, 0.9, 0.3, 0, 7),
			name, LARGE_FONT_NAME, 1, 4);
	}
	
	if (this.__description !== description)
	{
		this.__description = description;
		this.descriptionTextArea = new BkTextArea(
			new BkCoord(0.05, 0.4, 0.9, 0.35, 0, 7),
			description, FONT_NAME, 0.4, 3.5);
	}
	
	let location = 'Phone: ' + phone + '\nAddress: ' + direction;
	if (this.__location !== location)
	{
		this.__location = location;
		this.locationTextArea = new BkTextArea(
			new BkCoord(0.05, -0.05, 0.7, 0.15, 0, 6),
			location, FONT_NAME, 0.5, 6);
	}
}

ef_Place.prototype.setImg = function(imgSrc)
{
	if (this.__imgSrc !== imgSrc)
	{
		this.__imgSrc = imgSrc;
		this.__img = this.drawer._system.createImage(imgSrc);
	}
}

ef_Place.prototype.draw = function()
{
	this.drawer.draw(this);
}

ef_Place.prototype.resize = function()
{
	this.textArea.resize();
	this.descriptionTextArea.resize();
	this.locationTextArea.resize();
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
	
	let isSelectedInUi = (o === g_selectedObject) || o.isSelected;
	let isHovered = (o === g_hoverObject);
	
	bkDrawGlassBoard(ctx, coord, 
		(o.isSelected || isHovered) ? SELECTED_GLASS_COLOR: UNSELECTED_GLASS_COLOR,
		o.isSelected);
	
	let coordInner = coord.anisotropicGrow(0.96);
	if (o.__img && !isHovered)
	{
		if (!isSelectedInUi && !isHovered) ctx.globalAlpha = 0.6;
		o.__img.drawFill(ctx, coordInner);
		if (!isSelectedInUi && !isHovered) ctx.globalAlpha = 1;
	}
	
	
	if (isHovered || o.__img === null)
	{
		o.textArea.coord.y = isHovered ? 0.05 : 0.35;
		ctx.fillStyle = '#ff8';
		o.textArea.draw(ctx, coord, '#442');
	}
	
	if (isHovered)
	{
		ctx.fillStyle = '#fff';
		o.descriptionTextArea.draw(ctx, coord);
		o.locationTextArea.draw(ctx, coord);
	}
	

	let bCoord = new BkCoord(-0.02, -0.02, 0.2, 0.2, 0, 6).toScreenCoord(coord);
	
	bkDrawGlassButton(ctx, bCoord, isSelectedInUi ? SELECTED_COLOR : UNSELECTED_COLOR, true);
	ctx.fillStyle = '#fff';
	o.votesText.text = o.votes.toString();
	o.votesText.draw(ctx, coord);
}

let ef_places = [];
function ef_isPlace(o)
{
	return ef_places.indexOf(o) !== -1;
}

function ef_getPlaceById(placeId)
{
	let count = ef_places.length;
	for (let i = 0; i < count; ++i)
	{
		if (ef_places[i].id === placeId) return ef_places[i];
	}
	return null;
}

let ef_users = [];
function ef_getUserById(userId)
{
	let count = ef_users.length;
	for (let i = 0; i < count; ++i)
	{
		if (ef_users[i].id === userId) return ef_users[i];
	}
	return null;
}

function getOrderList(list, getComparable)
{
	const count = list.length;
	let indexesBuffer = new ArrayBuffer(count * 4);
	let indexes = new Int32Array(indexesBuffer);

	let tempList = [];
	for (let i = 0; i < count; ++i)
	{
		tempList.push({key:getComparable(list[i]), value:i});
	}

	tempList.sort(function(a, b) {
			return +(a.key > b.key) || +(a.key === b.key) - 1;
		});

	for (let i = 0; i < count; ++i)
	{
		indexes[tempList[i].value] = i;
	}
	
	return indexes;
}
	
	
let ef_placeDrawer = null;
let ef_userDrawer = null;
let ef_myUser = null;
let ef_addAllPlacesButton = null;
let ef_restoreSideBarButton = null;
let ef_usersArea = null;
let ef_placesArea = null;

function _processUserPlaceJson(json)
{
	console.log(JSON.stringify(json));
	
	if (!json.userId)
	{
		return;
	}
	
	let currentUserId = json.userId;
	let count = ef_users.length;
	for (let i = 0; i < count; ++i)
	{
		ef_users[i].drawer = null;
	}
	
	ef_myUser = null;
	let list = json.userList;
	count = list.length;
	for (let i = 0; i < count; ++i)
	{
		let userId = list[i].id_User;
		let item = ef_getUserById(userId);
		
		if (item === null)
		{
			item = new ef_User(new BkCoord(0, 0, 0, 0), ef_userDrawer, userId,
				list[i].name, list[i].id_Place);
			ef_users.push(item);
			item.area = ef_usersArea;
			bkSystem.add(item);
		}
		else
		{
			item.drawer = ef_userDrawer;
			item.setName(list[i].name);
			item.placeId = list[i].id_Place;
		}
		
		item.comparable = list[i].name.toLowerCase();

		if (currentUserId === userId)
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
	
	count = ef_places.length;
	for (let i = 0; i < count; ++i)
	{
		ef_places[i].drawer = null;
	}
	
	list = json.placeList;
	let indexes = getOrderList(list, function(o){return o.name.toLowerCase();});
	count = list.length;
	for (let i = 0; i < count; ++i)
	{
		let placeId = list[i].id;
		let item = ef_getPlaceById(placeId);
		let isSelected = ef_myUser && (ef_myUser.placeId === placeId);
		
		if (item === null)
		{
			item = new ef_Place(new BkCoord(0, 0, 0, 0),
				ef_placeDrawer,
				list[i].id, list[i].name, list[i].description,
				list[i].phone, list[i].direction,
				list[i].votes, list[i].image_link,
				isSelected);
				
			item.onclick = _addSuggestion.bind(item);
			
			ef_places.push(item);
			item.area = ef_placesArea;
			bkSystem.add(item);
		}
		else
		{
			item.drawer = ef_placeDrawer;
			item.isSelected = isSelected;
			item.votes = list[i].votes;
			item.setTextFields(
				list[i].name, list[i].description,
				list[i].phone, list[i].direction);
			item.setImg(list[i].image_link);
		}
		
		item.comparable = (indexes[i] / count) - list[i].votes;
		item.area = ef_placesArea;
		BkObjectSetSelected(item, isSelected);
	}
	
	list = [];
	count = ef_places.length;
	for (let i = 0; i < count; ++i)
	{
		if (ef_places[i].drawer === null)
		{
			bkSystem.remove(ef_places[i]);
		}
		else
		{
			list.push(ef_places[i]);
		}
	}
	ef_places = list;
	
	if (ef_places.length > 0)
	{
		bkSystem.remove(ef_addAllPlacesButton);
	}
	else
	{
		bkSystem.add(ef_addAllPlacesButton);
	}
	
	bkSystem.redistribute(true);
}

let bkSystem;
let g_selectedObject = null;
let g_sideBarHidden = false;
let g_hoverObject = false;

function _restoreSideBar()
{
	if (!g_sideBarHidden) return;
	
	let list = $('footer');
	for (let i = 0; i < list.length; ++i)
	{
		list[i].style.visibility = 'visible';
	}
	
	list = $('nav');
	for (let i = 0; i < list.length; ++i)
	{
		list[i].style.visibility = 'visible';
	}                        

	let mainSideNav = $('#mainSideNav').get(0);
	let w = mainSideNav.offsetWidth;
	mainSideNav.style.visibility = 'visible';
	mainSideNav.style.left = '0px';

	let mainCanvas = $('#mainCanvas').get(0);
	mainCanvas.style = "width:82.5vw;height:80vh;";
	
	ef_usersArea.coord.y = 0; 
	ef_usersArea.coord.h = 1;
	bkSystem.remove(ef_restoreSideBarButton);
	
	g_sideBarHidden = false;
	bkSystem.resize();
}

function _hideSideBar()
{
	if (g_sideBarHidden) return;
	
	let list = $('footer');
	for (let i = 0; i < list.length; ++i)
	{
		list[i].style.visibility = 'hidden';
	}
	
	list = $('nav');
	for (let i = 0; i < list.length; ++i)
	{
		list[i].style.visibility = 'hidden';
	}                        

	let mainSideNav = $('#mainSideNav').get(0);
	let w = mainSideNav.offsetWidth;
	mainSideNav.style.visibility = 'hidden';
	mainSideNav.style.left = '-' + w + 'px';

	let mainCanvas = $('#mainCanvas').get(0);
	mainCanvas.style = "position:fixed;padding:0;margin:0;top:0;left:0;width:100%;height:100%;";
	
	ef_usersArea.coord.y = 0.1; 
	ef_usersArea.coord.h = 0.9;
	bkSystem.add(ef_restoreSideBarButton);
	
	g_sideBarHidden = true;
	bkSystem.resize();
}

function _addAllPlaces()
{
	$.ajax({
		url: '/action/createSuggestion?id_food_meeting=' +
			g_idFoodMeeting.toString() + '&id_place=all',
		success: function(result){
			_processUserPlaceJson(result);
		}
	});
}

function _addSuggestion()
{
	let idPlace = this.isSelected ? -1 : this.id;
	if (idPlace === -1) _restoreSideBar();
	
	$.ajax({
		url: '/action/createSuggestion?id_food_meeting=' +
			g_idFoodMeeting.toString() + '&id_place=' + idPlace.toString(),
		success: function(result){
			_processUserPlaceJson(result);
		}
	});
}

function _onMouseDown()
{
	let button = this.mouse.button;
	if (1 === button)
	{
		if (this.item.length === 0)
		{
			_restoreSideBar();
			return;
		}
		
		let newSelection = this.select(this.mouse.x, this.mouse.y);
		if (g_selectedObject !== newSelection)
		{
			g_selectedObject = newSelection;
			this.redistribute(true);
		}
		
		if (g_selectedObject === null) return;
		
		if (g_selectedObject.onclick) g_selectedObject.onclick();
		return;
	}
}

function _onMouseMove()
{
	let newHover = this.select(this.mouse.x, this.mouse.y);
	if (g_hoverObject != newHover)
	{
		g_hoverObject = newHover;
		this.redraw = true;
	}
}

function _onMouseOut()
{
	if (g_hoverObject != null)
	{
		g_hoverObject = null;
		this.redraw = true;
	}
}

function _start()
{
	$('#mainSideNav').get(0).style.transition = 'visibility 1s, left 1s';

	bkSystem = new BkSystem('mainCanvas');
	ef_usersArea = new BkArea(new BkCoord(0,0,0.2,1,0,7), 3, 1);
	bkSystem.addArea(ef_usersArea);
	ef_placesArea = new BkArea(new BkCoord(0.2,0,0.8,1,0,7), 1.3);
	bkSystem.addArea(ef_placesArea);
	bkSystem.setBackgroundImage('/assets/img/b0.svg');
	ef_placeDrawer = new ef_PlaceDrawer(bkSystem);
	ef_userDrawer = new ef_UserDrawer(bkSystem);

	let buttonDrawer = new ef_ButtonDrawer(bkSystem);
	ef_addAllPlacesButton = new ef_Button(
		new BkCoord(-0.01,-0.01,0.28,0.08,0,6),
		buttonDrawer, "Add Places", _addAllPlaces);
	ef_restoreSideBarButton = new ef_Button(
		new BkCoord(0.01,0.01,0.08,0.08,0,6),
		buttonDrawer, "\u2261", _restoreSideBar);
	
	$.ajax({
		url: '/action/getSuggestions?id_food_meeting=' + g_idFoodMeeting.toString(),
		success: function(result){
			_processUserPlaceJson(result);
		}
	});

	bkSystem.onmousedown = _onMouseDown;
	bkSystem.onmousemove = _onMouseMove;
	bkSystem.onmouseout = _onMouseOut;
	
	bkSystem.run();
}

// Requires g_idFoodMeeting to be defined and valid
$(window).on("load", function() {
	_start();
});