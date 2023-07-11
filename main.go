package main

import (
	"fmt"
	"html/template"
	"log"
	"net/http"
)

// server for running the game
func main() {
	fileServer := http.FileServer(http.Dir("./static/"))
	http.Handle("/static/", http.StripPrefix("/static", fileServer))

	http.HandleFunc("/", mainHandler)
	fmt.Printf("Started server at http://localhost:8080")
	// runs server
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}
}

// handle the main page
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
