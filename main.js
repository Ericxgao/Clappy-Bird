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
	canvasContext = document.getElementById("meter" ).getContext("2d");
	
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
        main_state["jump"]();
    }
    else
        canvasContext.fillStyle = "green";

    // draw a bar based on the current volume
    canvasContext.fillRect(0, 0, meter.volume*WIDTH*1.4, HEIGHT);

    // set up the next visual callback
    rafID = window.requestAnimationFrame( drawLoop );
}




	var game = new Phaser.Game(400, 490, Phaser.AUTO, 'game_div');


	var main_state = {

	    preload: function() { 
	    	this.game.stage.backgroundColor = '#66CCFF';
	    	this.game.load.image('pipe', 'assets/pipe.png');
	    	this.game.load.image('bird', 'assets/bird.png');
	    	console.log("test");
	    },

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

	    	this.score += 1;
	    	this.label_score.content = this.score;
	    },

	    create: function() { 
	    	this.bird = this.game.add.sprite(100, 245, 'bird');
	    	this.bird.body.gravity.y = 1700;
	    	
	    	//var space_key = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	    	//space_key.onDown.add(this.jump, this);
	    	
	    	this.timer = this.game.time.events.loop(1500, this.add_row_of_pipes, this);

	    	this.score = -1;
	    	var style = { font: "30px Arial", fill: "#ffffff" };
	    	this.label_score = this.game.add.text(20, 20, "0", style);

	    	this.pipes = game.add.group();
	    	this.pipes.createMultiple(20, 'pipe');
	    },
	    
	    update: function() {
	    	if (this.bird.inWorld == false) {
	    		this.restart_game();
	    	}

	    	this.game.physics.overlap(this.bird, this.pipes, this.restart_game, null, this);
	    },

	    jump: function() {
	    	this.bird.body.velocity.y = -340;
	    },

	    restart_game: function() {
	    	this.game.time.events.remove(this.timer);
	    	this.game.state.start('main');
	    },
	};

	// Add and start the 'main' state to start the game
	game.state.add('main', main_state);  
	game.state.start('main'); 