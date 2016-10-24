'use strict';

const BUTTON_COLOR = 0xE0308080;
const BUTTON_HOVER_COLOR = 0xE040A0A0;
const USER_COLOR = 0xF0F0F1F1;
const SELECTED_USER_COLOR = 0xF8FDFEFE;
const PLACE_COLOR = 0xD0000101;
const SELECTED_PLACE_COLOR = 0xD000A0A0;
const GLASS_COLOR = 0x60181C20;
const SELECTED_GLASS_COLOR = 0xD0181C20;
const LARGE_FONT_NAME = 'Roboto';
const FONT_NAME = '"Times new roman"';

let bkSystem;
let g_selectedObject = null;
let g_sideBarHidden = false;
let g_hoverObject = null;
let g_hoverUserPlaceId = null;
let g_comService = null;
let g_roomId = null;
let g_userId = null;

let ef_placeDrawer = null;
let ef_userDrawer = null;
let ef_myUser = null;
let ef_addAllPlacesButton = null;
let ef_restoreSideBarButton = null;
let ef_showInfoButton = null;
let ef_usersArea = null;
let ef_placesArea = null;


function ef_buttonOnClick()
{
	this.isChecked = !this.isChecked;
	this.drawer._system.redraw = true;
}

let ef_Button = function(coord, drawer, text, onclick = null, img = null)
{
	this.coord = coord;
	this.drawer = drawer;
	this.isChecked = false;
	this.onclick = onclick === null ? ef_buttonOnClick.bind(this) : onclick;
	this.isCircle = coord.w === coord.h;
	this.textArea = new BkText(
		new BkCoord(0.05, 0.1, 0.9, 0.9, 0, 7),
		text, FONT_NAME);
	if (img !== null)
	{
		drawer._system.setImage(this, img);
	}
}

ef_Button.prototype.draw = function()
{
	this.drawer.draw(this);
}

ef_Button.prototype.resize = function()
{
	this.textArea.resize();
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
	let isHovered = o === g_hoverObject;
	let color = isHovered ? BUTTON_HOVER_COLOR : BUTTON_COLOR;
	let shadowColor;
	
	let coordShadow = coord.anisotropicGrow((isHovered || o.isChecked) ? 1.2 : 1.1);
	if (o.isChecked)
	{
		coord.y += coord.h * 0.05;
		coordShadow.y += coord.h * 0.05;
		shadowColor = 0xFF000000;
	}
	else
	{
		coordShadow.y += coordShadow.h * 0.1;
		shadowColor = bkShadowColor(color);
	}
	
	if (o.isCircle)
	{
		bkDrawShadowCircle(ctx, coordShadow, 0.5, shadowColor);
	}
	else
	{
		coord.x = Math.floor(coord.x);
		bkDrawShadowRect(ctx, coordShadow, 0.2, shadowColor);
	}
	
	bkDrawGlassButton(ctx, coord, color, true, o.isCircle ? 0.5 : 0.05);
	
	if (o.img == null || !o.img.isReady)
	{
		ctx.fillStyle = '#fff';
		o.textArea.draw(ctx, coord);
	}
	else
	{
		o.img.drawFit(ctx, coord);
	}
}

let ef_User = function(coord, drawer, id, name, placeId)
{
	this.id = id;
	this.coord = coord;
	this.drawer = drawer;
	this.placeId = placeId;
	this.isChecked = false;
	this.setName(name);
}

ef_User.prototype.setName = function(name)
{
	this.textArea = new BkTextArea(
		new BkCoord(0.1, 0.1, 0.8, 0.8, 0, 7),
		name,
		FONT_NAME,
		1);
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
	let isHovered = o === g_hoverObject;
	let isSelected = ef_myUser === o;
	
	if (isHovered || isSelected || o.isChecked)
	{
		let coordShadow = coord.anisotropicGrow((isHovered || o.isChecked) ? 1.25 : 1.1);
		bkDrawShadowRect(ctx, coordShadow, 0.1, 0x80000000);
	}
	
	bkDrawGlassBoard(ctx, coord, (isSelected ? SELECTED_USER_COLOR : USER_COLOR), false, true);

	ctx.fillStyle = '#000';
	o.textArea.draw(ctx, coord);
}

let ef_Place = function(coord, drawer, id, name, description, phone, direction, votes, imgSrc, isSelected)
{
	this.id = id;
	this.coord = coord;
	this.drawer = drawer;
	this.votes = votes;
	this.isSelected = isSelected;
	this.__name = null;
	this.__description = null;
	this.__location = null;
	drawer._system.setImage(this, imgSrc);
	
	this.votesText = new BkText(
		new BkCoord(-0.015, -0.015, 0.2, 0.2, 0, 6), null, LARGE_FONT_NAME);
	
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
			description, FONT_NAME, 0.45, 3.5);
	}
	
	let location = 'Phone: ' + phone + '\nAddress: ' + direction;
	if (this.__location !== location)
	{
		this.__location = location;
		this.locationTextArea = new BkTextArea(
			new BkCoord(0, -1E-9, 0.78, 0.15, 0, 7),
			location, FONT_NAME, 0.45, 6);
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
	this.votesText.resize();
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
	
	let isHovered = (o === g_hoverObject);
	let showDetails = ef_showInfoButton.isChecked || o.id === g_hoverUserPlaceId;
	let boardColor = (o.id === g_hoverUserPlaceId || isHovered) ? SELECTED_GLASS_COLOR: GLASS_COLOR;
	
	bkDrawGlassBoard(ctx, coord, boardColor, o.isSelected);

	let coordInner = coord.anisotropicGrow(0.96);
	if (showDetails || o.img === null || !o.img.isReady)
	{
		o.textArea.coord.y = showDetails ? 0.05 : 0.35;
		ctx.fillStyle = '#ff8';
		o.textArea.draw(ctx, coord, '#442');
	}
	else
	{
		if (!o.isSelected && !isHovered) ctx.globalAlpha = 0.6;
		o.img.drawFill(ctx, coordInner);
		if (!o.isSelected && !isHovered) ctx.globalAlpha = 1;
	}
	
	if (showDetails)
	{
		ctx.fillStyle = '#fff';
		o.descriptionTextArea.draw(ctx, coord);
		let lCoord = coord.anisotropicGrow(0.93);
		o.locationTextArea.draw(ctx, lCoord);
	}
	

	let bCoord = o.votesText.coord.toScreenCoord(coord);
	bkDrawGlassButton(ctx, bCoord, o.isSelected ? SELECTED_PLACE_COLOR : PLACE_COLOR, true);
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

function _processUserPlaceJson(json)
{
	console.log(JSON.stringify(json));
	
	if (!json.userList || !json.placeList)
	{
		return;
	}
	
	let count = ef_users.length;
	for (let i = 0; i < count; ++i)
	{
		ef_users[i].drawer = null;
	}
	
	let selectedPlaceId = null;
	ef_myUser = null;
	let list = json.userList;
	count = list.length;
	for (let i = 0; i < count; ++i)
	{
		let userId = list[i].id_User;
		let item = ef_getUserById(userId);
		
		if (item === null)
		{
			item = new ef_User(new BkCoord(), ef_userDrawer, userId,
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

		if (g_userId === userId)
		{
			ef_myUser = item;
			selectedPlaceId = item.placeId;
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
		let isSelected = selectedPlaceId === placeId;
		
		if (item === null)
		{
			item = new ef_Place(new BkCoord(),
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
			ef_placeDrawer._system.setImage(item, list[i].image_link);
		}
		
		item.comparable = (indexes[i] / count) - list[i].votes;
		item.area = ef_placesArea;
		bkObjectSetSelected(item, isSelected);
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
	
	bkSystem.redistribute();
}

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

	let nav = $('#mainSideNav').get(0);
	let w = nav.offsetWidth;
	nav.style.visibility = 'visible';
	nav.style.left = '0px';

	let mainCanvas = $('#mainCanvas').get(0);
	mainCanvas.style = "width:82.5vw;height:80vh";
	
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

	let nav = $('#mainSideNav').get(0);
	let w = nav.offsetWidth;
	nav.style.visibility = 'hidden';
	nav.style.left = '-' + w + 'px';

	let mainCanvas = $('#mainCanvas').get(0);
	mainCanvas.style = "position:fixed;padding:0;margin:0;top:0;left:0;width:100%;height:100%";
	
	g_sideBarHidden = true;
	bkSystem.resize();
}

function _addSuggestion(addAllPlaces = false)
{
	let idPlace = addAllPlaces ? "all" : 
		(this.isSelected ? "-1" : this.id.toString());

	/*
	$.ajax({
		url: '/action/createSuggestion?id_food_meeting=' +
			g_foodMeetingId.toString() + '&id_place=' + idPlace.toString(),
		success: function(result){
			_processUserPlaceJson(result);
		}
	});
	*/
	
	let roomId = "vote_" + g_foodMeetingId.toString();
	g_comService.sendMessage({
			user:g_userId,
			room:roomId,
			command:"CreateSuggestion",
			events:[{
				event:{ 
					CreateSuggestionEvent:{
						id_food_meeting: parseInt(g_idFoodMeeting),
						id_place: idPlace,
						userList:"",
						placeList:""
						}
					}
				}]
		});

}

/*
function _addAllPlaces()
{
	$.ajax({
		url: '/action/createSuggestion?id_food_meeting=' +
			g_foodMeetingId.toString() + '&id_place=all',
		success: function(result){
			_processUserPlaceJson(result);
		}
	});
}*/

function _addAllPlaces()
{
	_addSuggestion(true);
}

function _onMouseDown()
{
	let button = this.mouse.button;
	if (1 === button)
	{
		let newSelection = this.select(this.mouse.x, this.mouse.y);
		if (g_selectedObject !== newSelection)
		{
			g_selectedObject = newSelection;
			this.redraw = true;
			//this.redistribute();
		}
		
		if (g_selectedObject === null)
		{
			if (this.item.length === 0)
			{
				_restoreSideBar();
			}
			else
			{
				_hideSideBar();
			}
		}
		if (g_selectedObject.onclick) g_selectedObject.onclick();
		
	}
	
	return;
}

function _onMouseMove()
{
	let newHover = this.select(this.mouse.x, this.mouse.y);
	if (g_hoverObject !== newHover)
	{
		g_hoverUserPlaceId = (newHover === null) ? null : newHover.placeId;
		g_hoverObject = newHover;
		let isPlace = (g_hoverObject !== null) && ef_isPlace(g_hoverObject);
		
		for (let i = 0, count = ef_users.length; i < count; ++i) 
		{
			ef_users[i].isChecked = isPlace && (g_hoverObject.id === ef_users[i].placeId);
		}
		
		this.redraw = true;
	}
}

function _onMouseOut()
{
	if (g_hoverObject !== null)
	{
		g_hoverUserPlaceId = null;
		g_hoverObject = null;
		this.redraw = true;
	}
}

function _handleOnMessage(event)
{
	console.log("Message received");
	$.each(event.events, function(index, item) {
		let eventType = Object.getOwnPropertyNames(item.event)[0];
		switch (eventType) {
			case "org.jala.efeeder.servlets.websocket.avro.WelcomeEvent":
				console.log('+ WebSockets connected');
				break;
			case "org.jala.efeeder.servlets.websocket.avro.CreateSuggestionEvent":
				let eventMessage = item.event[eventType];
				console.log('+ Received suggestion event');
				eventMessage.userList = JSON.parse(eventMessage.userList);
				eventMessage.placeList = JSON.parse(eventMessage.placeList);
				_processUserPlaceJson(eventMessage);
				break;
		}
	});
}

function _start()
{
	$(".button-collapse").sideNav();
	let nav = $('#mainSideNav').get(0);
	nav.style.zIndex="0";
	nav.style.transition = 'visibility 1s, left 1s';
	
	bkSystem = new BkSystem('mainCanvas');
	ef_usersArea = new BkArea(new BkCoord(0,0.1,0.2,0.9,0,7), 4, 2);
	bkSystem.addArea(ef_usersArea);
	ef_placesArea = new BkArea(new BkCoord(0.2,0,0.8,1,0,7), 1, 0, 0.05);
	bkSystem.addArea(ef_placesArea);
	let buttonsArea = new BkArea(new BkCoord(0,0,0.2,0.1,0,7), 1, 2, 0.08);
	bkSystem.addArea(buttonsArea);
	
	bkSystem.setBackgroundImage('/assets/img/place.svg', 0.2);
	ef_placeDrawer = new ef_PlaceDrawer(bkSystem);
	ef_userDrawer = new ef_UserDrawer(bkSystem);

	let buttonDrawer = new ef_ButtonDrawer(bkSystem);
	ef_addAllPlacesButton = new ef_Button(
		new BkCoord(-0.01,-0.01,0.28,0.08,0,6),
		buttonDrawer, "Add Places", _addAllPlaces);
	ef_restoreSideBarButton = new ef_Button(
		new BkCoord(0.02,0.02,0.07,0.07,0,6),
		buttonDrawer, "\u2261", _restoreSideBar, '/assets/img/menu.svg');
	ef_restoreSideBarButton.area = buttonsArea;
	ef_restoreSideBarButton.comparable = 0;
	ef_showInfoButton = new ef_Button(
		new BkCoord(0.1,0.02,0.07,0.07,0,6),
		buttonDrawer, "i", null, '/assets/img/info.svg');
	ef_showInfoButton.area = buttonsArea;
	ef_showInfoButton.comparable = 1;
	
	bkSystem.add(ef_restoreSideBarButton);
	bkSystem.add(ef_showInfoButton);

	bkSystem.onmousedown = _onMouseDown;
	bkSystem.onmousemove = _onMouseMove;
	bkSystem.onmouseout = _onMouseOut;

	// Communication
	g_roomId = "vote_" + g_foodMeetingId.toString();
	g_userId = parseInt(Cookies.get("userId"));
	
	g_comService = new CommunicationService();
	g_comService.onMessage(_handleOnMessage);
	g_comService.connect('ws://' + location.host + '/ws', g_roomId);
	
	$.ajax({
		url: '/action/getSuggestions?id_food_meeting=' + g_idFoodMeeting.toString(),
		success: function(result){
			_processUserPlaceJson(result);
		}
	});	
	
	bkSystem.run();
}

// Requires g_foodMeetingId to be defined and valid
$(window).on("load", function() {
	_start();
});