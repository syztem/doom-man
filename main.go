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

	http.HandleFunc("/", handleGuess)
	fmt.Println("Server is running on http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}

func handleGuess(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		tmpl.Execute(w, nil)
		return
	}

	guess, _ := strconv.Atoi(r.FormValue("guess"))
	var message string

	if guess < targetNumber {
		message = "Too low! Try again."
	} else if guess > targetNumber {
		message = "Too high! Try again."
	} else {
		message = "Congratulations! You guessed it!"
		targetNumber = rand.Intn(100) + 1
	}

	tmpl.Execute(w, struct {
		Message string
	}{Message: message})
}
