// You only need to touch comments with the todo of this file to complete the assignment!

/*
=== How to build on top of the starter code? ===

Problems have multiple solutions.
We have created a structure to help you on solving this problem.
On top of the structure, we created a flow shaped via the below functions.
We left descriptions, hints, and to-do sections in between.
If you want to use this code, fill in the to-do sections.
However, if you're going to solve this problem yourself in different ways, you can ignore this starter code.
 */

/*
=== Terminology for the API ===

Clue: The name given to the structure that contains the question and the answer together.
Category: The name given to the structure containing clues on the same topic.
 */

/*
=== Data Structure of Request the API Endpoints ===

/categories:
[
  {
    "id": <category ID>,
    "title": <category name>,
    "clues_count": <number of clues in the category where each clue has a question, an answer, and a value>
  },
  ... more categories
]

/category:
{
  "id": <category ID>,
  "title": <category name>,
  "clues_count": <number of clues in the category>,
  "clues": [
    {
      "id": <clue ID>,
      "answer": <answer to the question>,
      "question": <question>,
      "value": <value of the question (be careful not all questions have values) (Hint: you can assign your own value such as 200 or skip)>,
      ... more properties
    },
    ... more clues
  ]
}
 */

const API_URL = "https://rithm-jeopardy.herokuapp.com/api/"; // The URL of the API.
const NUMBER_OF_CATEGORIES = 6; // The number of categories you will be fetching. You can change this number.
const NUMBER_OF_CLUES_PER_CATEGORY = 5; // The number of clues you will be displaying per category. You can change this number.

let categories = []; // The categories with clues fetched from the API.
/*
[
  {
    "id": <category ID>,
    "title": <category name>,
    "clues": [
      {
        "id": <clue ID>,
        "value": <value (e.g. $200)>,
        "question": <question>,
        "answer": <answer>
      },
      ... more categories
    ]
  },
  ... more categories
]
 */

let activeClue = null; // Currently selected clue data.
let activeClueMode = 0; // Controls the flow of #active-clue element while selecting a clue, displaying the question of selected clue, and displaying the answer to the question.
/*
0: Empty. Waiting to be filled. If a clue is clicked, it shows the question (transits to 1).
1: Showing a question. If the question is clicked, it shows the answer (transits to 2).
2: Showing an answer. If the answer is clicked, it empties (transits back to 0).
 */

let isPlayButtonClickable = true; // Only clickable when the game haven't started yet or ended. Prevents the button to be clicked during the game.

$("#play").on("click", handleClickOfPlay);

// const playButton = document.querySelector("#play");
// playButton.addEventListener("click", handleClickOfPlay);

/**
 * Manages the behavior of the play button (start or restart) when clicked.
 * Sets up the game.
 *
 * Hints:
 * - Sets up the game when the play button is clickable.
 */
function handleClickOfPlay() {
  // todo set the game up if the play button is clickable
  const buttonClicked = document.getElementById("play");

  // If button is clickable, disable it and update text
  if (isPlayButtonClickable === true) {
    isPlayButtonClickable = false;
    // Change the text content of the play button to indicate the game is being set up
    buttonClicked.textContent = "Setting up the Game ...";
    // Call the function to set up the game
    setupTheGame();
  }
}

/**
 * Sets up the game.
 *
 * 1. Cleans the game since the user can be restarting the game.
 * 2. Get category IDs
 * 3. For each category ID, get the category with clues.
 * 4. Fill the HTML table with the game data.
 *
 * Hints:
 * - The game play is managed via events.
 */

async function setupTheGame() {
  // todo show the spinner while setting up the game
  const spinnerElement = document.getElementById("spinner");
  spinnerElement.style.display = "block";

  // todo reset the DOM (table, button text, the end text)
  const categoriesElement = document.getElementById("categories");
  const cluesElement = document.getElementById("clues");
  const playButton = document.getElementById("play");
  const activeClueElement = document.getElementById("active-clue");

  // Clear  category headers
  categoriesElement.innerHTML = "";
  // Clear clues
  cluesElement.innerHTML = "";
  playButton.textContent = "Restart the Game";
  // Clear active clue
  activeClueElement.textContent = "";
  // Reset categories
  categories = [];

  // todo fetch the game data (categories with clues)

  const categoryIds = await getCategoryIds();

  for (let id of categoryIds) {
    const categoryData = await getCategoryData(id);
    categories.push(categoryData);
  }

  // todo fill the table
  fillTable(categories);

  //  Hide spinner
  const hideSpiner = document.getElementById("spinner");
  hideSpiner.style.display = "none";

  // Enable the play button
  isPlayButtonClickable = true;
}

/**
 * Gets as many category IDs as in the `NUMBER_OF_CATEGORIES` constant.
 * Returns an array of numbers where each number is a category ID.
 *
 * Hints:
 * - Use /categories endpoint of the API.
 * - Request as many categories as possible, such as 100. Randomly pick as many categories as given in the `NUMBER_OF_CATEGORIES` constant, if the number of clues in the category is enough (<= `NUMBER_OF_CLUES` constant).
 */
async function getCategoryIds() {
  // Initialize an empty array to store category IDs.
  const ids = [];
  // Fetch the list of all categories from the API.
  const response = await axios.get(`${API_URL}categories`);
  // Store the list of categories from the API response.
  const categoryList = response.data;
  const filteredCategories = categoryList.filter(function (category) {
    return category.clues_count >= NUMBER_OF_CLUES_PER_CATEGORY;
  });
  // Randomly select NUMBER_OF_CATEGORIES
  const selectedCategories = [];

  for (
    let i = 0;
    i < NUMBER_OF_CATEGORIES && filteredCategories.length > 0;
    i++
  ) {
    // Select a random index from the filtered categories.
    const randomIndex = Math.floor(Math.random() * filteredCategories.length);
    // Add the randomly selected category ID to the array.
    selectedCategories.push(filteredCategories[randomIndex].id);
    // Remove the selected category from the list to avoid duplicates.
    filteredCategories.splice(randomIndex, 1);
  }

  // Assign selected category IDs to the ids array
  ids.push(...selectedCategories);

  //  Return the array of selected category IDs
  return ids;
}

/**
 * Gets category with as many clues as given in the `NUMBER_OF_CLUES` constant.
 * Returns the below data structure:
 *  {
 *    "id": <category ID>
 *    "title": <category name>
 *    "clues": [
 *      {
 *        "id": <clue ID>,
 *        "value": <value of the question>,
 *        "question": <question>,
 *        "answer": <answer to the question>
 *      },
 *      ... more clues
 *    ]
 *  }
 *
 * Hints:
 * - You need to call this function for each category ID returned from the `getCategoryIds` function.
 * - Use /category endpoint of the API.
 * - In the API, not all clues have a value. You can assign your own value or skip that clue.
 */
async function getCategoryData(categoryId) {
  const categoryWithClues = {
    id: categoryId,
    title: undefined, // todo set after fetching
    clues: [], // todo set after fetching
  };

  // todo fetch the category with NUMBER_OF_CLUES_PER_CATEGORY amount of clues
  // Fetch the category data from the API, including its clues.
  const response = await axios.get(
    `https://rithm-jeopardy.herokuapp.com/api/category?id=${categoryId}`
  );

  // Extract the data from the response
  const categoryData = await response.data;
  // Set category title
  // Assign the fetched category title to the categoryWithClues object.
  categoryWithClues.title = categoryData.title;

  // Filter, limit, and process clues
  categoryWithClues.clues = categoryData.clues
    .filter(function (clue) {
      // Only include clues that have a non-null value.
      return clue.value !== null;
    })
    // Limit the number of clues to the defined constant.
    .slice(0, NUMBER_OF_CLUES_PER_CATEGORY)
    .map((clue) => ({
      id: clue.id,
      value: clue.value !== null ? clue.value : 100, // Assign 100 if value is null
      question: clue.question,
      answer: clue.answer,
    }));

  // Return the processed category data with clues.
  return categoryWithClues;
}

/**
 * Fills the HTML table using category data.
 *
 * Hints:
 * - You need to call this function using an array of categories where each element comes from the `getCategoryData` function.
 * - Table head (thead) has a row (#categories).
 *   For each category, you should create a cell element (th) and append that to it.
 * - Table body (tbody) has a row (#clues).
 *   For each category, you should create a cell element (td) and append that to it.
 *   Besides, for each clue in a category, you should create a row element (tr) and append it to the corresponding previously created and appended cell element (td).
 * - To this row elements (tr) should add an event listener (handled by the `handleClickOfClue` function) and set their IDs with category and clue IDs. This will enable you to detect which clue is clicked.
 */
function fillTable(categories) {
  // todo
  // Get the table head and body elements
  const tableHead = document.getElementById("categories");
  const tableBody = document.getElementById("clues");

  // Clear any existing content in the table head and body to reset the table

  tableHead.innerHTML = "";
  tableBody.innerHTML = "";
  console.log(categories);

  // Create a table header cell (th) for each category
  categories.forEach((category) => {
    // Create a new table header element
    const tHead = document.createElement("th");
    // Set the text content to the category title
    tHead.textContent = category.title;

    // Append the header element to the table head
    tableHead.appendChild(tHead);
  });

  // Create a table body cell (td) for each category
  categories.forEach((category) => {
    // Create a new table cell element
    const tCell = document.createElement("td");
    // Append the table cell to the table body
    tableBody.appendChild(tCell);

    // Create a table row for each clue in the category
    category.clues.forEach((clue) => {
      // Create a new table row element
      const tr = document.createElement("tr");
      // Set the row's ID to a unique combination of category and clue ID
      tr.id = `category-${category.id}-clue-${clue.id}`;
      // Set the text content to the clue's value (in dollars)
      tr.textContent = `$${clue.value}`;
      // Add an event listener to handle clue clicks
      tr.addEventListener("click", handleClickOfClue);
      // Append the row element to the table cell
      tCell.appendChild(tr);
    });
  });
}

$(".clue").on("click", handleClickOfClue);

/**
 * Manages the behavior when a clue is clicked.
 * Displays the question if there is no active question.
 *
 * Hints:
 * - Control the behavior using the `activeClueMode` variable.
 * - Identify the category and clue IDs using the clicked element's ID.
 * - Remove the clicked clue from categories since each clue should be clickable only once. Don't forget to remove the category if all the clues are removed.
 * - Don't forget to update the `activeClueMode` variable.
 *
 */
function handleClickOfClue(event) {
  // todo find and remove the clue from the categories

  // Get the clicked element
  const clickedElement = event.target;
  console.log(clickedElement);

  // Extract ID parts (category and clue IDs) from the clicked element's ID and convert them to numbers
  const idParts = clickedElement.id.split("-");
  console.log(idParts);
  // Get the category ID (second part of the ID)
  const categoryId = parseInt(idParts[1], 10);
  console.log(categoryId);
  // Get the clue ID (fourth part of the ID)
  const clueId = parseInt(idParts[3], 10);

  // Find the category and the specific clue based on the IDs
  const category = categories.find((c) => c.id === categoryId);
  const clue = category?.clues.find((c) => c.id === clueId);

  if (!clue) return; // Exit if clue not found

  // Set the active clue and remove it from the list
  activeClue = clue;
  category.clues = category.clues.filter((c) => c.id !== clueId);

  // Remove the category if no clues left
  if (category.clues.length === 0) {
    categories = categories.filter((c) => c.id !== categoryId);
  }

  // todo mark clue as viewed (you can use the class in style.css), display the question at #active-clue

  // Mark the clue as viewed
  clickedElement.classList.add("viewed");

  // Display the question
  document.getElementById("active-clue").textContent = activeClue.question;

  // Update the mode
  activeClueMode = 1;
}

$("#active-clue").on("click", handleClickOfActiveClue);

/**
 * Manages the behavior when a displayed question or answer is clicked.
 * Displays the answer if currently displaying a question.
 * Clears if currently displaying an answer.
 *
 * Hints:
 * - Control the behavior using the `activeClueMode` variable.
 * - After clearing, check the categories array to see if it is empty to decide to end the game.
 * - Don't forget to update the `activeClueMode` variable.
 */
function handleClickOfActiveClue(event) {
  // todo clear if displaying an answer
  // todo after clear end the game when no clues are left

  // todo display answer if displaying a question
  if (activeClueMode === 1) {
    // Switch to answer mode
    activeClueMode = 2;
    // Display the answer in the HTML element
    // display answer if displaying a question
    $("#active-clue").html(activeClue.answer);
  } else if (activeClueMode === 2) {
    activeClueMode = 0;
    // Clear the clue display
    $("#active-clue").html(null);
    // Check if the game should end (if no more categories or clues are left)
    if (categories.length === 0) {
      //  Enable the play button for restarting
      isPlayButtonClickable = true;
      $("#play").text("Restart the Game!");
      // end the game when no clues are left
      $("#active-clue").html("The End!");
    }
  }
}
