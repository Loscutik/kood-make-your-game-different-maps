package main

import (
	"html/template"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{}

func sendScores(conn *websocket.Conn) {
	scores, err := getAllScores()
	if err != nil {
		log.Printf("Failed to get all scores: %v", err)
		return
	}

	//Send scores to front-end
	if err := conn.WriteMessage(websocket.TextMessage, scores); err != nil {
		log.Printf("Failed to send scores %v", err)
	}
}

func socketHandler(w http.ResponseWriter, r *http.Request) {
	//Upgrade raw HTTP connection to a websocket based one
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("Error during connection upgradation:", err)
		return
	}
	defer conn.Close()

	//After establishing connection get and send all scores
	sendScores(conn)

	//The event loop
	for {
		_, newScore, err := conn.ReadMessage()
		if err != nil {
			log.Println("Error during message reading:", err)
			break
		}
		log.Printf("Received score: %s", newScore)
		err = addScore(newScore)
		if err != nil {
			log.Println("Error when adding score to database:", err)
		}
		//Send update scoreboard
		sendScores(conn)
	}
}

//Handle the main page
func mainHandler(w http.ResponseWriter, r *http.Request) {
	temp, err := template.ParseFiles("index.html")
	if err != nil {
		http.Redirect(w, r, "/", http.StatusInternalServerError)
		return
	}
	if e := temp.Execute(w, ""); e != nil {
		http.Redirect(w, r, "/", http.StatusInternalServerError)
	}
}
