/*
The MIT License (MIT)

Copyright (c) 2014 Chris Wilson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/


var audioContext = null;
var meter = null;
var canvasContext = null;
var WIDTH=500;
var HEIGHT=50;
var rafID = null;

window.onload = function() {

    // grab our canvas
	canvasContext = document.getElementById("meter").getContext("2d");
	
    // monkeypatch Web Audio
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
	
    // grab an audio context
    audioContext = new AudioContext();

    // Attempt to get audio input
    try {
        // monkeypatch getUserMedia
        navigator.getUserMedia = 
        	navigator.getUserMedia ||
        	navigator.webkitGetUserMedia ||
        	navigator.mozGetUserMedia;

        // ask for an audio input
        navigator.getUserMedia({audio:true}, gotStream, didntGetStream);
    } catch (e) {
        alert('getUserMedia threw exception :' + e);
    }

}


function didntGetStream() {
    alert('Stream generation failed.');
}

function gotStream(stream) {
    // Create an AudioNode from the stream.
    var mediaStreamSource = audioContext.createMediaStreamSource(stream);

    // Create a new volume meter and connect it.
	meter = createAudioMeter(audioContext);
	mediaStreamSource.connect(meter);

    // kick off the visual updating
    drawLoop();
}

function drawLoop( time ) {
    // clear the background
    canvasContext.clearRect(0,0,WIDTH,HEIGHT);

    // check if we're currently clipping
    if (meter.checkClipping()) {
        canvasContext.fillStyle = "red";
        if (in_play) {
        	play_state["jump"]();
        } else {
        	menu_state["start"]();
        }
    }
    else
        canvasContext.fillStyle = "green";

    // draw a bar based on the current volume
    canvasContext.fillRect(0, 0, meter.volume*WIDTH*1.4, HEIGHT);

    // set up the next visual callback
    rafID = window.requestAnimationFrame( drawLoop );
}


	var play_state = {

	    add_one_pipe: function(x, y) {
	    	var pipe = this.pipes.getFirstDead();
	    	pipe.reset(x, y);
	    	pipe.body.velocity.x = -200
	    	pipe.outOfBoundsKill = true;
	    },

	    add_row_of_pipes: function() {
	    	var hole = Math.floor(Math.random()*5) + 1;

	    	for (var i = 0; i < 8; i++) {
	    		if (i != hole && i != hole + 1) {
	    			this.add_one_pipe(400, i * 60 + 10);
	    		}
	    	}

	    	score += 1;
	    	this.label_score.content = score;
	    },

	    create: function() { 
	    	this.bird = this.game.add.sprite(100, 245, 'bird');
	    	this.bird.body.gravity.y = 1700;
	    	
	    	this.bird.anchor.setTo(-0.2, 0.5);
	    	//var space_key = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	    	//space_key.onDown.add(this.jump, this);
	    	
	    	this.jump_sound = this.game.add.audio('jump');

	    	this.can_jump = true;

	    	this.timer = this.game.time.events.loop(1500, this.add_row_of_pipes, this);

	    	score = -1;
	    	var style = { font: "30px Arial", fill: "#ffffff" };
	    	this.label_score = this.game.add.text(20, 20, "0", style);

	    	this.pipes = game.add.group();
	    	this.pipes.createMultiple(20, 'pipe');
	    },
	    
	    update: function() {
	    	if (this.bird.inWorld == false) {
	    		this.restart_game();
	    	}

	    	if (this.bird.angle < 20) {
	    		this.bird.angle += 1;
	    	}

	    	this.game.physics.overlap(this.bird, this.pipes, this.hit_pipe, null, this);
	    },

	    jump: function() {
	    	if (this.bird.alive == false || this.can_jump == false) {
	    		return;
	    	}

	    	this.can_jump = false;

			this.jump_sound.play();
	    	this.bird.body.velocity.y = -340;

	    	var animation = this.game.add.tween(this.bird);
	    	animation.to({angle: -20}, 100);
	    	animation.start(); 	

	    	this.game.time.events.add(85, function() {
	    		this.can_jump = true;
	    		console.log("jump enabled");
	    	}, this);
	    },

	    hit_pipe: function() {
	    	if (this.bird.alive == false) {
	    		return;
	    	}

	    	this.bird.alive = false;

	    	this.game.time.events.remove(this.timer);

	    	this.pipes.forEachAlive(function(p) {
	    		p.body.velocity.x = 0;
	    	}, this);
	    },

	    restart_game: function() {
	    	this.game.time.events.remove(this.timer);
	    	this.game.state.start('menu');
	    	in_play = false;
	    },
	};