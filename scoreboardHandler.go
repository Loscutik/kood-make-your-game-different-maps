package main

import (
	"encoding/json"
	"fmt"
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
	//Get score entries as an array
	scoreEntries, err := readJSONFile()
	if err != nil {
		return 0, "", err
	}
	//Get only the scores itself
	onlyScores := make([]int, len(scoreEntries))
	for i, entry := range scoreEntries {
		onlyScores[i] = entry.Score
	}
	//Sort the scores to descending order
	sort.Slice(onlyScores, func(i, j int) bool {
		return onlyScores[i] > onlyScores[j]
	})

	//Get rank
	rank := 1 + sort.Search(len(onlyScores), func(i int) bool {
		return onlyScores[i] <= int(newScore)
	})

	//Get percentile
	percentile := fmt.Sprintf("%.1f", (float64(rank)/float64(len(onlyScores)+1))*100.0)

	return rank, percentile, nil
}
