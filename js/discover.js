/*
Copyright (c) 2021 Ruofan Chen, Samm Du, Nada Eldin, Shalev Lifshitz

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at:

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/*
    Always called when the discovery page is loaded.
*/
async function onPageLoad() {
    // check for user ID on page load, and log in if present
    const userIDCurr = fetchQueryParamByKey("user_id");
    if (userIDCurr === null) {
        demoAddDummyCarsNoLoan();
    }
    else {
        displayLoggedInView();
    }
}

/*
    Login/agreement feature
*/
async function userLogin() {
    // check and possibly generate user ID
    const userIDCurr = fetchQueryParamByKey("user_id");
    if (userIDCurr === null) {
        const userIDNew = genNewUserID();
        appendPairToQuery("user_id", userIDNew);
    }

    displayLoggedInView();

    // DEMO CODE: REMOVE WHEN NO LONGER NEEDED
    console.log("login");
}

/*
    Display the view appropriate for after the user has logged in
*/
async function displayLoggedInView() {
    // hide agreement and reveil financial form parameters
    const agreementContent = document.getElementById("side-agreement");
    agreementContent.style.display = "none";
    const financialParams = document.getElementById("side-params");
    financialParams.style.display = "block";

    // remove all cars without loan info and add cars with loan info
    let carsContainer = document.getElementById("carsContainer");
    carsContainer.innerHTML = "";

    // add cars with loan offer info
    // DEMO CODE: REMOVE WHEN NO LONGER NEEDED
    demoAddDummyCarsWithLoan();
}

/*
    Search bar features
*/

function setSortOrder() {
    const sortIcon = document.getElementById("sortIcon");
    if (sortIcon.style.transform == "none") {
        sortIcon.style.transform = "scaleY(-1)";

        // DEMO CODE: REMOVE WHEN NO LONGER NEEDED
        console.log("toggle sort order: ASC");
    }
    else {
        sortIcon.style.transform = "none";

        // DEMO CODE: REMOVE WHEN NO LONGER NEEDED
        console.log("toggle sort order: DESC");
    }
}

function setSortBy() {
    const sortBySelect = document.getElementById("sortBy");
    const sortByVal = sortBySelect.options[sortBySelect.selectedIndex].value;

    // DEMO CODE: REMOVE WHEN NO LONGER NEEDED
    console.log("set sort by: " + sortByVal);
}

/*
    Can be called either by the search bar or by "Find your car"
*/
async function submitSearch() {
    const searchBox = document.getElementById("searchBox");
    const searchVal = searchBox.value;

    // DEMO CODE: REMOVE WHEN NO LONGER NEEDED
    console.log("search: " + searchVal);
}

/*
    Get cars and loan offers
*/

// DEMO CODE: REMOVE WHEN NO LONGER NEEDED
function demoAddDummyCarsNoLoan() {
    for (let i = 0; i < 10; i++) {
        addCarToContainer("Honda", "Civic", 15000, "");
    }
}

// DEMO CODE: REMOVE WHEN NO LONGER NEEDED
function demoAddDummyCarsWithLoan() {
    for (let i = 0; i < 10; i++) {
        addCarToContainer("Honda", "Civic", 15000, 5.2, 250, 12, 21050);
    }
}

/*
    Generate a new user ID randomly, with the last three digits being the credit score
*/
function genNewUserID() {
    const cs_min = 300; // minimum credit score, VantageScore 3.0
    const cs_max = 850; // maximum credit score, VantageScore 3.0
    const utc_string = JSON.stringify(new Date().getTime()); // current UTC timestamp
    const rand_credit_score = JSON.stringify(
        Math.floor(Math.random() * (cs_max - cs_min)) + cs_min
    );
    return "u" + utc_string + rand_credit_score;
}


/*
    Add a car offer card to the car offers container.
    - if all parameters provided, then construct an available car offer
        - this option should be used after agreement/login
    - if the apr field is null or "", then construct an unavailable car offer with
      car info only
        - this option should be used before agreement/login
*/
function addCarToContainer(
    make, model, price, apr, payment_mo, loan_term, total_sum
) {
    // get render target
    let carsContainer = document.getElementById("carsContainer");

    // get mustache templates
    const tmpl_CarOffer = document.getElementById("tmpl_CarOffer").innerHTML;
    const tmpl_CarOfferCarInfo = document.getElementById("tmpl_CarOfferCarInfo").innerHTML;
    const tmpl_CarOfferLoanInfo = document.getElementById("tmpl_CarOfferLoanInfo").innerHTML;

    // render car info
    const carData = {
        make: make,
        model: model,
        price: price
    };
    const carInfoRendered = Mustache.render(tmpl_CarOfferCarInfo, carData);

    // if given loan data, render loan info with available button
    if ((apr !== "") && (apr !== null)) {
        const loanData = {
            apr: apr,
            payment_mo: payment_mo,
            loan_term: loan_term,
            total_sum: total_sum
        };
        var loanInfoRendered = Mustache.render(tmpl_CarOfferLoanInfo, loanData);
        var carOfferBtn = document.getElementById("tmpl_CarOfferBtnAvailable").innerHTML;
    }
    // otherwise, provide empty loan info and an unavailable button
    else {
        var loanInfoRendered = "";
        var carOfferBtn = document.getElementById("tmpl_CarOfferBtnUnavailable").innerHTML;
    }

    // assemble car offer
    const carOfferData = {
        car_info: carInfoRendered,
        loan_info: loanInfoRendered,
        button: carOfferBtn
    }
    const carOfferRendered = Mustache.render(tmpl_CarOffer, carOfferData);

    // append car offer element to cars container
    carsContainer.innerHTML += carOfferRendered;
}

// always call this function on page load
onPageLoad();
