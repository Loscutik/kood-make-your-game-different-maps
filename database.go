package main

import (
	"database/sql"
	"encoding/json"
	"fmt"

	_ "github.com/mattn/go-sqlite3"
)

var db *sql.DB

type Score struct {
	Rank  int    `json:"rank"`
	Name  string `json:"name"`
	Score int    `json:"score"`
	Time  string `json:"time"`
}

func initDB(filepath string) error {
	var err error
	db, err = sql.Open("sqlite3", "./scoreboard.db")
	if err != nil {
		return err
	}

	//Ping the database to verify connection
	err = db.Ping()
	if err != nil {
		return err
	}
	fmt.Println("Connected to database")
	return nil
}

func closeDB() {
	db.Close()
}

func getAllScores() (jsonScores []byte, err error) {
	rows, _ := db.Query(`SELECT * FROM scores ORDER BY score DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var scores []Score
	for rows.Next() {
		var s Score
		_ = rows.Scan(&s.Name, &s.Score, &s.Time)
		if err != nil {
			return nil, err
		}
		s.Rank = len(scores) + 1
		scores = append(scores, s)
	}

	jsonScores, err = json.Marshal(scores)
	if err != nil {
		return nil, err
	}

	return jsonScores, nil
}

func addScore(jsonNewScore []byte) (err error) {

	var newScore Score

	err = json.Unmarshal(jsonNewScore, &newScore)
	if err != nil {
		return err
	}

	insertToDB, err := db.Prepare("INSERT INTO scores(name, score, time) VALUES(?, ?, ?)")
	if err != nil {
		return err
	}
	defer insertToDB.Close()

	_, err = insertToDB.Exec(newScore.Name, newScore.Score, newScore.Time)
	if err != nil {
		return err
	}

	fmt.Println("Successfully added the new record to the database")
	return nil
}
