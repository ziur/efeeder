/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var 
	G_SCREEN_COVERAGE = 0.7,
	G_ITERATIONS_PER_TICK = 1,
	G_DEFAULT_CHARGE = 1.0,
	G_FORCE_STRENGTH = 0.0006 / G_ITERATIONS_PER_TICK,
	G_INITIAL_SPIN_FACTOR = Math.pow(0.98, 1 / G_ITERATIONS_PER_TICK),
        G_SLOWING_FACTOR = Math.pow(0.9, 1 / G_ITERATIONS_PER_TICK),
	PI_2 = Math.PI * 2.0;
	
var	g_mouse = {
		button: 0,
		action: 0,
		x0: 0,
		y0: 0,
		x: 0,
		y: 0
	};
	
var	CANVAS,	CTX, particleSystem;

var Particle = function ()
{
	this.x = 0.0;
	this.y = 0.0;
	this.z = 0.0;
	this.dx = 0.0;
	this.dy = 0.0;
	this.dz = 0.0;
	this.color = "rgba(0,0,0,";
	this.charge = G_DEFAULT_CHARGE;
	this.name = "";
};

function _randomizeChannel(channel)
{
	var delta = Math.floor(Math.random() * 85);
	return channel ? (255 - delta) : delta;
}

var g_getRandomColor = 0;
Particle.prototype.randomizeColor = function()
{
	var r = _randomizeChannel(g_getRandomColor & 1);
	var g = _randomizeChannel(g_getRandomColor & 2);
	var b = _randomizeChannel(g_getRandomColor & 4);
	++g_getRandomColor;
	this.color = "rgba(" + r + "," + g + "," + b + ",";
}

Particle.prototype.randomizePosition = function()
{
	var angle = Math.random() * PI_2;
	var angle2 = angle * G_INITIAL_SPIN_FACTOR;
	var distance = Math.random() * 2.0 - 1.0;
	var distance2 = distance * G_INITIAL_SPIN_FACTOR;
	this.z = distance;
	distance = Math.sqrt(1 - distance * distance);
	this.x = Math.cos(angle) * distance;
	this.y = Math.sin(angle) * distance;

	this.dz = this.z - distance2;
	distance2 = Math.sqrt(1 - distance2 * distance2);
	this.dx = this.x - Math.cos(angle2) * distance2;
	this.dy = this.y - Math.sin(angle2) * distance2;
}

Particle.prototype.expell = function(speed)
{
	speed /= G_ITERATIONS_PER_TICK;
	var angle = Math.atan2(this.y, this.x);
	this.dx = Math.cos(angle) * speed;
	this.dy = Math.sin(angle) * speed;
	this.dz = 0;
	this.charge = 0;
}

var DisplayParticle = function (particle)
{
	this.x = particle.x;
	this.y = particle.y;
	this.z = particle.z;
	this.color = particle.color;
	this.name = particle.name;
};

var ParticleSystem = function (jsonData)
{
	this.jsonString = jsonData;
	this.json = JSON.parse(jsonData);
	this.maxParticles = this.json.items.length;
	this.selected = this.maxParticles;
	this.remaining = this.maxParticles;
	this.particles = [];
	this.resize();
	
	var PARTICLE_DIAMETER_2 = this.ParticleRadius * this.ParticleRadius * 4;
	
	for (var i = 0; i < this.maxParticles; ++i)
	{
		var p = new Particle();
		p.randomizePosition();
		p.randomizeColor();
		p.name = this.json.items[i];
		if (this.json.chosen === i)
		{
			p.charge *= 0.9;
		}
		this.particles.push(p);
		
		var count = 0;
		while (this.minDistance2(i) < PARTICLE_DIAMETER_2)
		{
			if (++count > 100) break;
			p.randomizePosition();
		}
	}
};

ParticleSystem.prototype.resize = function(particle)
{
	this.X0 = CANVAS.width * 0.5;
	this.Y0 = CANVAS.height * 0.5;
	this.scale = ((this.X0 > this.Y0) ? this.Y0 : this.X0) * G_SCREEN_COVERAGE;
	this.ParticleRadius = 1 / Math.sqrt(this.remaining);
	this.ParticleTargetRadius = this.ParticleRadius;
}

ParticleSystem.prototype.isDrawable = function(particle)
{
	return (particle.x * particle.x + particle.y * particle.y) < 8.0;
}

ParticleSystem.prototype.minDistance2 = function(index)
{
	var minimum = Number.MAX_VALUE;
	var i = this.particles.length;
	while (i--)
	{
		if (index == i) continue;
		var x2 = this.particles[i].x - this.particles[index].x;
		x2 *= x2;
		var y2 = this.particles[i].y - this.particles[index].y;
		y2 *= y2;
		var z2 = this.particles[i].z - this.particles[index].z;
		z2 *= z2;		
		var distance2 = x2 + y2 + z2;
		if (distance2 < minimum) minimum = distance2;
	}
	return minimum;
}

ParticleSystem.prototype.updateSystemTick = function()
{
	var PARTICLE_DIAMETER_2 = this.ParticleRadius * this.ParticleRadius * 4;
	var total = this.particles.length;
        var SLOWING_FACTOR = Math.pow(G_SLOWING_FACTOR, 1 / (this.remaining * this.remaining));
	for (var j = 0; j < total; ++j)
	{
		var pj = this.particles[j];
		if (pj.charge == 0) continue;
		
		var dx, dy, dz, distance2, q, force_factor, charge;
		for (var i = j + 1; i < total; ++i)
		{
			var pi = this.particles[i];
			if (pi.charge == 0) continue;
			
			dx = (pi.x - pj.x);
			dy = (pi.y - pj.y);
			dz = (pi.z - pj.z);
			charge = pi.charge;
			distance2 = dx * dx + dy * dy + dz * dz;
			
			if (distance2 < PARTICLE_DIAMETER_2)
			{
                            distance2 = PARTICLE_DIAMETER_2;
			}
			
			force_factor = charge * G_FORCE_STRENGTH / distance2;
			q = dx * force_factor;			
			pi.dx -= q;
			pj.dx += q;
			q = dy * force_factor;
			pi.dy -= q;
			pj.dy += q;
			q = dz * force_factor;
			pi.dz -= q;
			pj.dz += q;			
		}
	}

        // Central anchor at 0,0,0
        for (var i = 0; i < total; ++i)
        {
            var pi = this.particles[i];
            if (pi.charge == 0) continue;
            
            
	    dx = pi.x;
	    dy = pi.y;
	    dz = pi.z;       
            distance2 = dx * dx + dy * dy + dz * dz;
            
            if (distance2 < this.ParticleRadius)
            {
                distance2 = this.ParticleRadius;
            }
            
            force_factor = total * G_FORCE_STRENGTH / distance2;
            q = dx * force_factor;			
            pi.dx -= q;
            q = dy * force_factor;
            pi.dy -= q;
            q = dz * force_factor;
            pi.dz -= q;
            
            
            pi.dx *= SLOWING_FACTOR;
            pi.dy *= SLOWING_FACTOR;
            pi.dz *= SLOWING_FACTOR;
        }

	// Update new position of all particles
	for (var i = 0; i < total; ++i)
	{
		var p = this.particles[i];
		p.x += p.dx;
		p.y += p.dy;
		p.z += p.dz;
	}
};

ParticleSystem.prototype.updateSystem = function()
{
	for (var i = 0; i < G_ITERATIONS_PER_TICK; ++i)
	{
		this.updateSystemTick();
	}
	
	this.ParticleRadius = this.ParticleRadius * 0.9 + this.ParticleTargetRadius * 0.1;
	
};

ParticleSystem.prototype.expellOne = function()
{
	var total = this.particles.length;
	var remaining = 0;
	var electable = [];
	for (var i = 0; i < total; ++i)
	{
		var p = this.particles[i];
		if (p.charge != 0)
		{
			if (p.charge == G_DEFAULT_CHARGE)
			{
				electable.push(i);
			}
			++remaining;
		}
	}		
	
	if (remaining > 0)
	{
		if (electable.length > 0)
		{
			this.particles[electable[Math.floor(Math.random() * electable.length)]].expell(0.1);
		}
	
		this.remaining = remaining;
		this.ParticleTargetRadius = 1 / Math.sqrt(this.remaining);
	}
	
}

function _drawDisk(x, y, r, color)
{
	CTX.beginPath();
	CTX.moveTo(x, y);
	CTX.fillStyle = color;
	CTX.arc(x, y, r, 0, PI_2);
	CTX.fill();
}

function _drawBubble(x, y, r, colorTip)
{
	_drawDisk(x - r * 0.05, y - r * 0.05, r * 0.93, "rgba(0, 0, 0, 0.5)");
	_drawDisk(x, y, r, colorTip + "0.5)");
	_drawDisk(x - r * 0.52, y - r * 0.52, r * 0.2, "rgba(255, 255, 255, 0.3)");
	_drawDisk(x - r * 0.52, y - r * 0.52, r * 0.2, colorTip + "0.4)");
	_drawDisk(x - r * 0.56, y - r * 0.56, r * 0.1, "#fff");
}

var g_frameCount = 0;
ParticleSystem.prototype.draw = function()
{
	var total = this.particles.length;
	var tempArray = [];
	
	var count = 0;
	for (var i = 0; i < total; ++i)
	{
		var p = this.particles[i];
		if (this.isDrawable(p))
		{
			tempArray.push(new DisplayParticle(p));
			if (p.charge)
			{
				++count;
			}
		}
	}
	
	// Order by z-index
	tempArray.sort(function(a, b) {
		return a.z - b.z;
	});

	CTX.textAlign = "center";
	CTX.textBaseline = "middle";
	var radius = this.ParticleRadius * this.scale;
	CTX.font = (radius * 0.3).toString() + "px Forte";
	
	CTX.fillStyle = '#f0f0e8';
	CTX.fillRect(0, 0, CANVAS.width, CANVAS.height);
	
	total = tempArray.length;
	for (var i = 0; i < total; ++i)
	{
		var p = tempArray[i];
		var x = p.x * this.scale + this.X0;
		var y = p.y * this.scale + this.Y0;
		
		_drawBubble(x, y, radius, p.color);

		if (count <= 9)
		{
			var thickness = (count <= 3) ? 2 : 1;
			CTX.fillStyle = '#000';
			CTX.fillText(p.name, x + thickness, y + thickness);
			if (count <= 6)
			{
				CTX.fillText(p.name, x - thickness, y - thickness);
				if (count <= 3)
				{
					CTX.fillText(p.name, x, y + thickness);			
				}
			}
		}
		CTX.fillStyle = '#fff';
		CTX.fillText(p.name, x, y);		
	}

	++g_frameCount;
};

function _writeToScreenXY(text, x, y)
{
	CTX.textAlign = "left"; 
	CTX.textBaseline = "top";
	CTX.font = "12px Arial";
	CTX.fillStyle = "#000";
	CTX.fillText(text, x, y);
}

function _writeToScreen(text)
{
	_writeToScreenXY(text, 2, 10);
}

var g_oldTick = performance.now();
var g_lastExpell = g_oldTick + 1800;
function _updateFrame()
{
	var currentTick = performance.now();

	if (particleSystem)
	{
	
		if ((currentTick - g_lastExpell) > (500 / particleSystem.maxParticles))
		{
			particleSystem.expellOne();
			g_lastExpell = currentTick;
		}
	
		particleSystem.updateSystem();
		particleSystem.draw();
		//_writeToScreenXY(particleSystem.jsonString, 2, 30);
	}
	
        G_ITERATIONS_PER_TICK = Math.round(60 * (currentTick - g_oldTick) * 0.001);
        if (G_ITERATIONS_PER_TICK <= 0) G_ITERATIONS_PER_TICK = 1;
        
	G_FORCE_STRENGTH = 0.0006 / G_ITERATIONS_PER_TICK;
	G_INITIAL_SPIN_FACTOR = Math.pow(0.98, 1 / G_ITERATIONS_PER_TICK);
	G_SLOWING_FACTOR = Math.pow(0.9, 1 / G_ITERATIONS_PER_TICK);  
        
	g_oldTick = currentTick;
	
	window.requestAnimationFrame(_updateFrame);
};

function _resizeCanvas()
{
    CANVAS.width = CANVAS.clientWidth;
    CANVAS.height = CANVAS.clientHeight;
    particleSystem.resize();
}

function _startBubble()
{
	CANVAS = document.getElementById('mainCanvas');
	CTX = CANVAS.getContext('2d');
	
       
	window.addEventListener("resize",
		function() {
			_resizeCanvas();
		},
		false);        
	
	if (typeof JsonConfigurationText === 'undefined')
	{
		request = new XMLHttpRequest();
		request.onreadystatechange = function () {
			var DONE = this.DONE || 4;
			if (this.readyState === DONE)
			{
				//_writeToScreen(request.responseText);
				particleSystem = new ParticleSystem(request.responseText);
			}
		};	
		request.open('GET', 'wheel');
		request.send("");
	}
	else
	{
		particleSystem = new ParticleSystem(JsonConfigurationText);
        }
        
	_resizeCanvas();        

	_updateFrame();
};
