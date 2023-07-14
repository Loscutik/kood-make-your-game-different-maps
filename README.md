# Make your game

The goal for this task was to create a game using only plain JavaScript and HTML. 
Usage of frameworks and canvas was not allowed.

# Authors

Olena Budarahina (obudarah)  
Erik Hans Sepp (ehspp)

# Usage

Run the Go httpServer using `go run . `

# Rules

The goal of the game is to clear lines using falling 
tetrominoes as in standard Tetris rules.
Every 10 lines cleared levels up the game, making tetrominoes fall 
faster.  
As the task included also to implement lives system, the game starts with 3 lives.
If no line is completed in 25 seconds, players loses
one heart. Losing all hearts ends the game.

# Scoring 

Player gets points by the amount of lines cleared at once and the current level:

|Completed lines|Points|
|:---:|:---:|
|1|100 x Level|
|2|300 x Level|
|3|500 x Level|
|4|800 x Level|