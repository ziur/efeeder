var USER_COLOR = 0x303030;

var ef_User = function(coord, drawer, id, name, placeId)
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
		new BkCoord(0.05, 0.1, 0.9, 0.8, 0, 7),
		name,
		'Tahoma',
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

var ef_UserDrawer = function(bkSystem)
{
	this._ctx = bkSystem.ctx;
	this._transform = bkSystem.transform;
	this._system = bkSystem;
}

ef_UserDrawer.prototype.draw = function(o)
{
	var coord = o.coord.toScreen(this._transform);
	var ctx = this._ctx;
	
	var isSelected = ef_myUser === o;
	bkDrawGlassButton(ctx, coord, (isSelected ? 0x90FFC080 : 0x90000000) | USER_COLOR, true, 0.5);

	ctx.fillStyle = isSelected ? '#653' : '#eee';
	o.textArea.draw(ctx, coord);
}

var ef_Place = function(coord, drawer, id, name, description, phone, direction, votes, imgSrc, isSelected)
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
	
	var fontName = 'serif';
		
	var smallFontName = 'Tahoma';
	
	this.textArea = new BkTextArea(
		new BkCoord(0.05, 0.05, 0.9, 0.3, 0, 7),
		name, fontName, 1, 4);
	this.descriptionTextArea = new BkTextArea(
		new BkCoord(0.05, 0.4, 0.9, 0.35, 0, 7),
		description, fontName, 0.4, 3.5);
	this.locationTextArea = new BkTextArea(
		new BkCoord(0.05, -0.05, 0.7, 0.15, 0, 6),
		'Address: ' + direction + '\n' + 'Phone: ' + phone, smallFontName, 0.5, 6);
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
	this.locationTextArea.resize();
	this.votesTextArea.resize();
}

var ef_PlaceDrawer = function(bkSystem)
{
	this._ctx = bkSystem.ctx;
	this._transform = bkSystem.transform;
	this._system = bkSystem;
}

ef_PlaceDrawer.prototype.draw = function(o)
{
	var coord = o.coord.toScreen(this._transform);
	var ctx = this._ctx;
	
	var isSelectedInUi = (o === g_selectedPlace) || o.isSelected;
	
	bkDrawGlassBoard(ctx, coord, o.isSelected ? 0xff808080 : 0x60808080, o.isSelected,
		o.img != null);
	
	var coordInner = coord.anisotropicGrow(0.96);
	if (o.img)
	{
		if (!isSelectedInUi) ctx.globalAlpha = 0.5;
		o.img.drawFill(ctx, coordInner);
		if (!isSelectedInUi) ctx.globalAlpha = 1;
	}
	
	
	ctx.fillStyle = '#ff8';
	var border = 'rgba(80,70,30,1)';
	o.textArea.draw(ctx, coord, border);
	ctx.fillStyle = '#fff';
	border = 'rgba(0,0,0,1)';
	o.descriptionTextArea.draw(ctx, coord, border);
	o.locationTextArea.draw(ctx, coord, border);

	bCoord = new BkCoord(-0.02, -0.02, 0.2, 0.2, 0, 6).
		toScreenCoord(coord);
	
	bkDrawGlassButton(ctx, bCoord, isSelectedInUi ? 0xD0fff080 : 0xff050400, true);
	ctx.fillStyle = '#fff';
	o.votesTextArea.draw(ctx, coord, isSelectedInUi ? '#000' : null);
}

var ef_places = [];
function ef_getPlaceByObject(o)
{
	return ef_places.indexOf(o) === -1 ? null : o;
}

var ef_users = [];
function ef_getUserById(userId)
{
	var count = ef_users.length;
	for (var i = 0; i < count; ++i)
	{
		if (ef_users[i].id === userId)
		{
			return ef_users[i];
		}
	}
	return null;
}

var ef_placeDrawer = null;
var ef_userDrawer = null;
var ef_myUser = null;

function _processUserPlaceJson(json)
{
	console.log("DATA:\n" + JSON.stringify(json));
	
	if (!json.userId)
	{
		$.ajax({
			url: '/action/getSuggestions?id_food_meeting=' + g_idFoodMeeting.toString(),
			success: function(result){
				_processUserPlaceJson(result);
			}
		});
		return;
	}
	
	ef_myUserId = json.userId;
	var count = ef_users.length;
	for (var i = 0; i < count; ++i)
	{
		ef_users[i].drawer = null;
	}
	
	
	count = ef_places.length;
	for (var i = 0; i < count; ++i)
	{
		bkSystem.remove(ef_places[i]);
	}
	
	ef_myUser = null;
	var list = json.userList;
	count = list.length;
	
	var pad = 0.02;
	var cellW = 0.25 - pad * 2;
	var cellH = ((1 - pad) / count) - pad;
	
	for (var i = 0; i < count; ++i)
	{
		var userId = list[i].id_User;
		var item = ef_getUserById(userId);
		var coord = new BkCoord(list[i].name, 0, BkCoordDimToNum(0.1, 0.1), 0, 1, 8);
		
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
	for (var i = 0; i < count; ++i)
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
	for (var i = 0; i < count; ++i)
	{
		var isSelected = ef_myUser && (ef_myUser.placeId === list[i].id);
		
		var item = new ef_Place(
			new BkCoord(list[i].name, 0, BkCoordDimToNum(0.3, 0.2), 0, 0, 8),
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

var bkSystem;
var g_selectedPlace = null;
var g_sideBarHidden = false;

function _restoreSideBar()
{
	if (!g_sideBarHidden) return;
	
	var list = $('footer');
	for (var i = 0; i < list.length; ++i)
	{
		list[i].style.visibility = 'visible';
	}
	
	var list = $('nav');
	for (var i = 0; i < list.length; ++i)
	{
		list[i].style.visibility = 'visible';
	}                        

	var mainSideNav = $('#mainSideNav').get(0);
	var w = mainSideNav.offsetWidth;
	mainSideNav.style.visibility = 'visible';
	mainSideNav.style.left = '0px';

	var mainCanvas = $('#mainCanvas').get(0);
	mainCanvas.style = "width:82.5vw;height:80vh;";
	g_sideBarHidden = false;
	bkSystem.resize();
}

function _hideSideBar()
{
	if (g_sideBarHidden) return;
	
	var list = $('footer');
	for (var i = 0; i < list.length; ++i)
	{
		list[i].style.visibility = 'hidden';
	}
	
	var list = $('nav');
	for (var i = 0; i < list.length; ++i)
	{
		list[i].style.visibility = 'hidden';
	}                        

	var mainSideNav = $('#mainSideNav').get(0);
	var w = mainSideNav.offsetWidth;
	mainSideNav.style.visibility = 'hidden';
	mainSideNav.style.left = '-' + w + 'px';

	var mainCanvas = $('#mainCanvas').get(0);
	mainCanvas.style = "position:fixed;padding:0;margin:0;top:0;left:0;width:100%;height:100%;";
	
	g_sideBarHidden = true;
	bkSystem.resize();
}

function _onMouseDown()
{
	var button = this.mouse.button;
	if (1 === button)
	{
		if (this.item.length === 0)
		{
			_restoreSideBar();
			return;
		}
		
		g_selectedPlace = this.select(this.mouse.x, this.mouse.y);
		this.redistribute(true);
		if (g_selectedPlace === null) return;
		
		var place = ef_getPlaceByObject(g_selectedPlace);
		if (place === null) return;
		
		var idPlace = place.isSelected ? -1 : place.id;
		if (idPlace === -1) _restoreSideBar();
		
		$.ajax({
			url: '/action/createSuggestion?id_food_meeting=' +
				g_idFoodMeeting.toString() + '&id_place=' + idPlace.toString(),
			success: function(result){
				_processUserPlaceJson(result);
			}
		});
	}
}

function _start()
{
	$('#mainSideNav').get(0).style.transition = 'visibility 1s, left 1s';

	bkSystem = new BkSystem('mainCanvas');
	bkSystem.addArea(new BkArea(new BkCoord(0.2,0,0.8,1,0,7), 1.3));
	bkSystem.addArea(new BkArea(new BkCoord(0,0,0.2,1,0,7), 3));
	bkSystem.setBackgroundImage('/assets/img/b0.svg');
	ef_placeDrawer = new ef_PlaceDrawer(bkSystem);
	ef_userDrawer = new ef_UserDrawer(bkSystem);
	
	$.ajax({
		url: '/action/getSuggestions?id_food_meeting=' + g_idFoodMeeting.toString(),
		success: function(result){
			_processUserPlaceJson(result);
		}
	});

	$("#mainSideNav").on("mousedown", function() {
		_hideSideBar();
	});

	bkSystem.onmousedown = _onMouseDown;
	
	bkSystem.run();
}

// Requires g_idFoodMeeting to be defined and valid
$(window).on("load", function() {
	_start();
});