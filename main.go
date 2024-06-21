package main

import (
	"fmt"
	"html/template"
	"math/rand"
	"net/http"
	"strconv"
)

var targetNumber int
var tmpl *template.Template

func main() {
	targetNumber = rand.Intn(100) + 1
	tmpl = template.Must(template.ParseFiles("game.html"))

	http.HandleFunc("/", handleGame)
	fmt.Println("Server is running on http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}

func handleGame(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		tmpl.Execute(w, nil)
	case http.MethodPost:
		guess, _ := strconv.Atoi(r.FormValue("guess"))
		message := checkGuess(guess)
		tmpl.Execute(w, struct {
			Message string
		}{Message: message})
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func checkGuess(guess int) string {
	if guess < targetNumber {
		return "Too low! Try again."
	} else if guess > targetNumber {
		return "Too high! Try again."
	} else {
		oldTarget := targetNumber
		targetNumber = rand.Intn(100) + 1
		return fmt.Sprintf("Congratulations! You guessed %d correctly! A new number has been chosen.", oldTarget)
	}
}