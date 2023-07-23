package main

import (
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

type Message struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

type RankAndPercentile struct {
	Rank       int
	Percentile string
}

var upgrader = websocket.Upgrader{}

func sendScoresToClient(conn *websocket.Conn) {
	//Get scores
	scores, err := getAllScores()
	if err != nil {
		log.Printf("failed to get all scores: %v", err)
		return
	}

	//Create message
	message := Message{
		Type:    "scoreboard",
		Payload: scores,
	}

	//Marshal the message
	messageJson, err := json.Marshal(message)
	if err != nil {
		log.Printf("failed to marshal message: %v", err)
		return
	}

	//Send scores to front-end
	if err := conn.WriteMessage(websocket.TextMessage, messageJson); err != nil {
		log.Printf("failed to send scores %v", err)
	}
}

//If new entry received, get the payload, add to database and send upadated scores to client
func handleAddEntry(message Message, conn *websocket.Conn) error {
	//Unmarshal the payload into a Score
	payloadBytes, err := json.Marshal(message.Payload)
	if err != nil {
		return fmt.Errorf("error when marshaling payload: %w", err)
	}
	var score Score
	err = json.Unmarshal(payloadBytes, &score)
	if err != nil {
		return fmt.Errorf("error when unmarshaling payload into score %w", err)
	}

	//Add score to json database
	log.Println("Received score:", score)
	err = addScore(score)
	if err != nil {
		return fmt.Errorf("error when adding score to database: %w", err)
	}

	//Send updated scoreboard
	sendScoresToClient(conn)

	return nil
}

//If rank and percentile was requested, calculate them and send back
func handleGetRankAndPercentile(message Message, conn *websocket.Conn) error {
	//Get score from payload
	score, ok := message.Payload.(float64)
	if !ok {
		return fmt.Errorf("invalid payload for getRankAndPercentile")
	}
	//Get rand and percentile
	rank, percentile, err := getRankAndPercentile(score)
	if err != nil {
		return fmt.Errorf("couldn't get rank and percentile %w", err)
	}

	//Create payload
	payload := RankAndPercentile{
		Rank:       rank,
		Percentile: percentile,
	}

	//Create message
	newMessage := Message{
		Type:    "rankAndPercentile",
		Payload: payload,
	}

	//Marshal the message
	newMessageJson, err := json.Marshal(newMessage)
	if err != nil {
		return fmt.Errorf("failed to marshal message: %w", err)
	}

	//Send scores to front-end
	if err := conn.WriteMessage(websocket.TextMessage, newMessageJson); err != nil {
		return fmt.Errorf("failed to send scores %w", err)
	}

	return nil
}

func socketHandler(w http.ResponseWriter, r *http.Request) {
	//Upgrade raw HTTP connection to a websocket based one
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("error during connection upgradation:", err)
		return
	}
	defer conn.Close()

	//After establishing connection get and send all scores
	sendScoresToClient(conn)

	//The event loop
	for {
		//Wait for new message
		_, messageJson, err := conn.ReadMessage()
		if err != nil {
			log.Println("error during message reading:", err)
			break
		}

		//Unmarshal message
		var message Message
		err = json.Unmarshal(messageJson, &message)
		if err != nil {
			log.Println("error unmarshaling message:", err)
		}

		//Check message type
		switch message.Type {
		case "addEntry":
			if err := handleAddEntry(message, conn); err != nil {
				log.Println(err)
			}
		case "getRankAndPercentile":
			if err := handleGetRankAndPercentile(message, conn); err != nil {
				log.Println(err)
			}
		default:
			log.Println("unknown type message received:", message.Type)
		}
	}
}

//Handle the main page
func mainHandler(w http.ResponseWriter, r *http.Request) {
	tmpl, err := template.ParseFiles("index.html")
	if err != nil {
		http.Redirect(w, r, "/", http.StatusInternalServerError)
		return
	}
	if e := tmpl.Execute(w, ""); e != nil {
		http.Redirect(w, r, "/", http.StatusInternalServerError)
	}
}
