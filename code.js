
// Create canvases
//{{{
var width = 600;
var sampwindowheight=600;
var freqwindowheight=100;
document.getElementById("DIV").innerHTML = 
"<button onclick=\"lineToggle()\">Toggle Lines</button> Current Status: <span id=\"togglediv\">x</span></br>"+
"</br>"+
"<button onclick=\"increaseSamples()\">Increase Samplecount</button>"+
"<button onclick=\"decreaseSamples()\">Decrease Samplecount</button></br>"+
"<button onclick=\"zeroFrequencies()\">Zero all frequencies</button></br>"+
"<canvas id=\"freqCanvas\" width=\""+width+"\" height=\""+freqwindowheight+"\" style=\"border:1px solid #c3c3c3;\"></canvas></br>"+
"<canvas id=\"sampCanvas\" width=\""+width+"\" height=\""+sampwindowheight+"\" style=\"border:1px solid #c3c3c3;\">Your browser does not support the canvas element.</canvas>";
var sampCanvas = document.getElementById("sampCanvas");
var freqCanvas = document.getElementById("freqCanvas");

//}}}

// Global variables
//{{{
var freqbrad = 5; // frequency button radius
var sampbrad = 5; // sample button radius

var ox = width/2; // origin coords
var oy = sampwindowheight/2;

var left = width*0.05; // TODO better names!
var right = width*0.95;
var bot = freqwindowheight*0.75;
var fbrad = 12;// confusing with freqbrad, better naame!
var shrink = 2;

var linesOn = false;

var samppow = 3;
var samples = 1<<samppow;
var freq = new Array(samples);
var i = 0
for(i=0;i<samples;i++)
{
	freq[i] = new Object;
	freq[i].x = 0;
	freq[i].y = 0;
	freq[i].vis = false;
}

freq[0].x = -20;
freq[0].y = 30;
freq[0].vis = true;
freq[1].x = 70;
freq[1].y = 0;
freq[1].vis = true;
//}}}


// UI stuff
//{{{

var fheld = -1; // >=0 is index, -1 means not held
var newx;
var newy;

  // Sample Canvas Functions & event listeners
//{{{

sampCanvas.addEventListener('mousemove',mouseMove,false);
sampCanvas.addEventListener('mousedown',mouseDown,false);
sampCanvas.addEventListener('mouseup',mouseUp,false);
sampCanvas.addEventListener('mouseout',mouseUp,false);

// mouseMove
//{{{
function mouseMove(e)
{
	if(fheld>=0)
	{
		var r = sampCanvas.getBoundingClientRect();
		newx = e.clientX - r.left - ox;
		newy = -e.clientY + r.top + oy;
		drawMain(sampCanvas);
	}
}
//}}}

function mouseDown(e)
{
	var r = sampCanvas.getBoundingClientRect();
	var f;
	var fbsq = freqbrad*freqbrad;
	mx = e.clientX - r.left - ox;
	my = -e.clientY + r.top + oy;
	fheld = -1;
	for(f=0;f<samples;f++) // TODO iterate order most minor/major first? or no?
	{
		if(freq[f].vis)
		{
			dx = freq[f].x - mx;
			dy = freq[f].y - my;
			if(dx*dx+dy*dy<fbsq)
			{
				fheld = f;
				f = samples;
			}
		}
	}
}

function mouseUp(e)
{
	if(fheld>=0)
	{
		freq[fheld].x = newx;
		freq[fheld].y = newy;
		drawMain(sampCanvas);
		drawFreqs(freqCanvas);
	}
	fheld = -1;
}

function lineToggle()
{
	if(linesOn)
	{
		document.getElementById("togglediv").innerHTML = "OFF";
		document.getElementById("togglediv").style.color = "#ff0000";
		linesOn = false;
	}
	else
	{
		document.getElementById("togglediv").innerHTML = "ON";
		document.getElementById("togglediv").style.color = "#00ff00";
		linesOn = true;
	}
	drawMain(sampCanvas);
}

//}}}

  // Freq Canvas Functions & even listeners
//{{{

freqCanvas.addEventListener('click',fmouseClick,false);

function fmouseClick(e)
{
	var r = freqCanvas.getBoundingClientRect();
	mx = e.clientX - r.left;
	my = e.clientY - r.top;

	var b = -1;
	var low = 9999999;

	var f;
	for(f=0;f<samples;f++)
	{
		var offset = shrink*(samppow - firstOne(f,samppow));
		offset = (offset>(fbrad-2))? fbrad-2 : offset;
		var x = left+(right-left)*(((f-1+samples/2)%samples)+1)/samples;
		var y = bot+offset;
		var dx = mx - x;
		var dy = my - y;
		var clickrad = fbrad - offset + 4;
		var dt = dx*dx+dy*dy;
		if(dt<=clickrad*clickrad)
		{
			if(dt<low)
			{
				b = f;
				low = dt;
			}
		}
	}
	if(b>=0)
	{
		freq[b].vis = !freq[b].vis;
		drawMain(sampCanvas);
		drawFreqs(freqCanvas);
	}

}

//}}}

  // Button functions
//{{{

function increaseSamples()
{
	samppow++;
	samples = 1<<samppow;
	var newfreq = new Array(samples);
	var i = 0
	for(i=0;i<samples;i++)
	{
		newfreq[i] = new Object;
		if(i&1)
		{
			newfreq[i].x = 0;
			newfreq[i].y = 0;
			newfreq[i].vis = false;
		}
		else
		{
			newfreq[i].x = freq[i/2].x;
			newfreq[i].y = freq[i/2].y;
			newfreq[i].vis = freq[i/2].vis;
		}
	}
	freq = newfreq;
	drawMain(sampCanvas);
	drawFreqs(freqCanvas);

}

function decreaseSamples()
{
	if(samppow<=0)
	{
		return;
	}

	samppow--;
	samples = 1<<samppow;
	var newfreq = new Array(samples);
	var i = 0
	for(i=0;i<samples;i++)
	{
		newfreq[i] = new Object;
		newfreq[i].x = freq[i*2].x
		newfreq[i].y = freq[i*2].y
		newfreq[i].vis = freq[i*2].vis;
	}
	freq = newfreq;
	drawMain(sampCanvas);
	drawFreqs(freqCanvas);
}

function zeroFrequencies()
{
	var f;
	for(f=0;f<samples;f++)
	{
		freq[f].x = 0;
		freq[f].y = 0;
	}
	drawMain(sampCanvas);
	drawFreqs(freqCanvas);
}

//}}}

//}}}


// Draw
//{{{
function drawMain(canvas)
{
	var ctx = canvas.getContext("2d");

	// Clear canvas
	ctx.clearRect(0,0,canvas.width,canvas.height);

	// Draw mouse arrow if necessary
	if(fheld>=0)
	{
		ctx.beginPath();
		drawArrow(freq[fheld].x+ox,-freq[fheld].y+oy,newx+ox,-newy+oy,ctx);
		ctx.closePath();
		ctx.lineWidth = 2;
		ctx.strokeStyle = "#800080";
		ctx.stroke();
	}

	// Draw freq hands
	//{{{
	var f;
	for(f=0;f<samples;f++)
	{
		if(freq[f].vis)
		{
			var col = 255;
			var i;
			var size = firstOne(f,samppow)/(samppow+1)
			col = Math.floor(size*255);

			if(0)
			{
				if((f>>i)&1)
				{
					col = Math.floor(i/samppow*255);
					i = samppow;
				}
			}

			ctx.beginPath();
			ctx.moveTo(ox,oy);
			ctx.lineTo(freq[f].x+ox,-freq[f].y+oy);
			ctx.lineWidth = 7*size+2;
			ctx.strokeStyle = "rgb("+col+",0,0)";
			ctx.stroke();
			ctx.closePath();
			ctx.beginPath();
			ctx.arc(freq[f].x+ox,-freq[f].y+oy,freqbrad,0,2*Math.PI);
			ctx.closePath();
			ctx.lineWidth = 2;
			ctx.strokeStyle = "rgb(0,0,0)";
			ctx.stroke();
			ctx.fillStyle = "rgb(255,0,0)";
			ctx.fill();
		}
	}
	//}}}

	// Lines between samples
	//{{{
	if(linesOn)
	{
		var sx;
		var sy;
		ctx.beginPath();
		for(t=0;t<samples;t++)
		{
			var ex = 0;
			var ey = 0;
			for(f=0;f<samples;f++)
			{
				ex+= freq[f].x*Math.cos(1.0*f*t/samples*2*Math.PI);
				ey+= freq[f].x*Math.sin(1.0*f*t/samples*2*Math.PI);
				ey+= freq[f].y*Math.cos(1.0*f*t/samples*2*Math.PI);
				ex-= freq[f].y*Math.sin(1.0*f*t/samples*2*Math.PI);
			}

			if(t==0)
			{
				sx = ex;
				sy = ey;
				ctx.moveTo(sx+ox,-sy+oy);
			}
			else
			{
				ctx.lineTo(ex+ox,-ey+oy);
			}
		}
		ctx.lineTo(sx+ox,-sy+oy);
		ctx.closePath();
		ctx.lineWidth = 3;
		ctx.strokeStyle = "#a0c0a0";
		ctx.stroke();
	}
	//}}}

	// Draw samples
	//{{{
	var t;
	for(t=0;t<samples;t++)
	{
		var sx = 0; // coords of sample
		var sy = 0;
		var ax = 0; // coords for endpoints for arrow
		var ay = 0;
		for(f=0;f<samples;f++)
		{
			if(fheld>=0)
			{
				if(fheld==f)
				{
					ax-= freq[f].x*Math.cos(1.0*f*t/samples*2*Math.PI);
					ay-= freq[f].x*Math.sin(1.0*f*t/samples*2*Math.PI);
					ay-= freq[f].y*Math.cos(1.0*f*t/samples*2*Math.PI);
					ax+= freq[f].y*Math.sin(1.0*f*t/samples*2*Math.PI);
					ax+= newx*Math.cos(1.0*f*t/samples*2*Math.PI);
					ay+= newx*Math.sin(1.0*f*t/samples*2*Math.PI);
					ay+= newy*Math.cos(1.0*f*t/samples*2*Math.PI);
					ax-= newy*Math.sin(1.0*f*t/samples*2*Math.PI);
				}
			}
			sx+= freq[f].x*Math.cos(1.0*f*t/samples*2*Math.PI);
			sy+= freq[f].x*Math.sin(1.0*f*t/samples*2*Math.PI);
			sy+= freq[f].y*Math.cos(1.0*f*t/samples*2*Math.PI);
			sx-= freq[f].y*Math.sin(1.0*f*t/samples*2*Math.PI);
		}

		// Gradient from green to red
		var col = Math.floor(t/samples*255);
		ctx.fillStyle = "rgb(0,"+(255-col)+","+col+")";

		// Draw sample
		ctx.beginPath();
		ctx.arc(sx+ox,-sy+oy,sampbrad,0,2*Math.PI);
		ctx.closePath();
		ctx.lineWidth = 2;
		ctx.strokeStyle = "#000000";
		ctx.stroke();
		ctx.fill();

		// Draw arrow if necessary
		if(fheld>=0)
		{
			ax+= sx;
			ay+= sy;
			ctx.beginPath();
			drawArrow(sx+ox,-sy+oy,ax+ox,-ay+oy,ctx);
			ctx.closePath();
			ctx.lineWidth = 2;
			ctx.strokeStyle = "#0000b0";
			ctx.stroke();
		}
	}
	//}}}

}
//}}}

// drawArrow
//{{{
function drawArrow(startx,starty,endx,endy,ctx)
{

	// Determine unit vector from start to end
	var ux;
	var uy;
	{
		var dx = endx-startx;
		var dy = endy-starty;
		var dt = Math.sqrt(dx*dx+dy*dy)+0.001;
		ux = dx/dt;
		uy = dy/dt;
	}

	var forklen = 15
	var cos = -0.866;
	var sin = 0.5;
	var fork1x = endx+cos*ux*forklen+sin*uy*forklen
	var fork1y = endy-sin*ux*forklen+cos*uy*forklen
	var cos = -0.866;
	var sin = -0.5;
	var fork2x = endx+cos*ux*forklen+sin*uy*forklen
	var fork2y = endy-sin*ux*forklen+cos*uy*forklen

	var startspace = 10;
	ctx.moveTo(startx+ux*startspace, starty+uy*startspace);
	ctx.lineTo(endx, endy);
	ctx.lineTo(fork1x, fork1y);
	ctx.moveTo(endx, endy);
	ctx.lineTo(fork2x, fork2y);
}
//}}}

// Draw freq diagram
//{{{
function drawFreqs(canvas)
{
	var ctx = canvas.getContext("2d");

	// Clear canvas
	ctx.clearRect(0,0,canvas.width,canvas.height);

	// Draw "ghost" node to the left
	if(samppow>0)
	{
		ctx.beginPath();
		ctx.arc(left,bot+shrink,fbrad-shrink,0,2*Math.PI);
		ctx.lineWidth = 1;
		if(freq[samples/2].vis)
			ctx.strokeStyle = "#a04000";
		else
			ctx.strokeStyle = "#a0a040";
		ctx.stroke();
	}

	var f;
	for(f=0;f<samples;f++)
	{
		var offset = shrink*(samppow - firstOne(f,samppow));
		offset = (offset>(fbrad-2))? fbrad-2 : offset;
		var x = left+(right-left)*(((f-1+samples/2)%samples)+1)/samples;
		var y = bot+offset;
		ctx.beginPath();
		ctx.arc(x,y,fbrad-offset,0,2*Math.PI);
		ctx.closePath();
		if(freq[f].vis)
			ctx.fillStyle = "#ff6000";
		else
			ctx.fillStyle = "#e0e090";
		ctx.fill();

		var dx = freq[f].x;
		var dy = freq[f].y;
		var h = Math.sqrt(dx*dx+dy*dy) * freqwindowheight/(width/2)
		ctx.beginPath();
		ctx.moveTo(x,y);
		ctx.lineTo(x,y-h);
		ctx.closePath();
		ctx.lineWidth = 2;
		ctx.strokeStyle = "#000000";
		ctx.stroke();

		ctx.fillStyle = "#000000";
		ctx.font = fbrad+"px Arial";
		var lab = (f>samples/2)?(f-samples):(f);
		ctx.fillText("W "+lab,x-fbrad,bot+2*fbrad);
	}

}
//}}}

// firstOne
//{{{
function firstOne(num,pow)
{
	var r = pow;
	// Returns place of first 1 bit in binary of 'num'
	for(i=0;i<pow;i++)
	{
		if((num>>i)&1)
		{
			r = i;
			i = samppow;
		}
	}
	return r;
}
//}}}


lineToggle();
drawMain(sampCanvas);
drawFreqs(freqCanvas);

