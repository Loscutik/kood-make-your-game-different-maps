package main

import (
	"encoding/json"
	"fmt"
	"math"
	"os"
	"sort"
)

type Score struct {
	Rank  int    `json:"rank,omitempty"`
	Name  string `json:"name"`
	Score int    `json:"score"`
	Time  string `json:"time"`
}

func readJSONFile() ([]Score, error) {
	//Open json file
	file, err := os.Open("./scores.json")
	if err != nil {
		return nil, err
	}
	defer file.Close()

	//Read file contents to array
	var scores []Score
	decoder := json.NewDecoder(file)
	err = decoder.Decode(&scores)
	if err != nil {
		return nil, err
	}

	return scores, nil
}

func getAllScores() (scores []Score, err error) {
	//Get scores as an array
	scores, err = readJSONFile()
	if err != nil {
		return nil, err
	}

	//Sort array by scores descending
	sort.Slice(scores, func(i, j int) bool {
		return scores[i].Score > scores[j].Score
	})

	//Add ranks to scores
	currentRank := 1
	skipRank := 0
	for i := range scores {
		//For first score entry just add rank and continue
		if i == 0 {
			scores[i].Rank = currentRank
			continue
		}

		//If entry is same as previous, don't increase rank, but save the difference
		if scores[i].Score == scores[i-1].Score {
			skipRank += 1
		} else if scores[i].Score < scores[i-1].Score { //If entry is different, increase rank including skipped ranks
			currentRank += 1 + skipRank
			skipRank = 0
		}

		//Add rank to entry
		scores[i].Rank = currentRank
	}

	return scores, nil
}

func addScore(newScore Score) error {
	//Get scores as an array
	scores, err := readJSONFile()
	if err != nil {
		return err
	}

	// Append the new score
	scores = append(scores, newScore)

	// Write the scores back to the file
	file, err := os.OpenFile("./scores.json", os.O_RDWR, 0644)
	if err != nil {
		return err
	}
	defer file.Close()

	file.Seek(0, 0)
	file.Truncate(0)
	encoder := json.NewEncoder(file)
	return encoder.Encode(scores)
}

func getRankAndPercentile(newScore float64) (int, string, error) {
	//Get all current scores
	scores, err := getAllScores()
	if err != nil {
		return 0, "", err
	}

	//Get rank
	var rank int
	var percentile string
	greatestRank := scores[len(scores)-1].Rank
	for _, score := range scores {
		if score.Score <= int(newScore) {
			rank = score.Rank
			break
		}
	}

	if rank == 0 { //Edge case, if player is last in scoreboard
		rank = greatestRank + 1
		percentile = "100"
	} else {
		//Get percentile
		percentileValue := float64(rank) / float64(greatestRank) * 100.0
		percentileValue = math.Round(percentileValue*10) / 10 //Round to 1 decimal point
		if percentileValue == float64(int(percentileValue)) { //If decimal point is zero, don't show it
			percentile = fmt.Sprintf("%.0f", percentileValue)
		} else {
			percentile = fmt.Sprintf("%.1f", percentileValue)
		}
	}

	return rank, percentile, nil
}
