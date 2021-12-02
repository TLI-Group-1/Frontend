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
    const userIDCurr = fetchQueryParamByKey('user_id');
    if (userIDCurr === null) {
        submitSearch();
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
    const userIDCurr = fetchQueryParamByKey('user_id');
    if (userIDCurr === null) {
        const userIDNew = genNewUserID();
        appendPairToQuery('user_id', userIDNew);
    }

    displayLoggedInView();

    // DEMO CODE: REMOVE WHEN NO LONGER NEEDED
    console.log('login');
}

/*
    Display the view appropriate for after the user has logged in
*/
async function displayLoggedInView() {
    // hide agreement and reveil financial form parameters
    const agreementContent = document.getElementById('side-agreement');
    agreementContent.style.display = 'none';
    const financialParams = document.getElementById('side-params');
    financialParams.style.display = 'block';

    // add cars with loan offer info
    // submitSearch();
    demoAddDummyCarsWithLoan();

    // display the claimed offers widget
    const claimOffers = document.getElementById('claimedOffersWidget');
    claimOffers.style.display = 'flex';
}

// DEMO CODE: REMOVE WHEN NO LONGER NEEDED
function demoAddDummyCarsWithLoan() {
    removeAllCarsOffers();
    for (let i = 0; i < 10; i++) {
        addCarToContainer(123, "Honda", "Civic", 2019, 0, 15000, 5.2, 250, 8, 21050);
    }
}


/*
    Search bar features
*/

var searchParams = new URLSearchParams();
searchParams.set('down_payment', '');
searchParams.set('budget_mo', '');
searchParams.set('sort_by', 'apr');
searchParams.set('sort_asc', 'true');
searchParams.set('keywords', '');

function toggleSortOrder() {
    const sortIcon = document.getElementById('sortIcon');
    if (searchParams.get('sort_asc') == 'false') {
        searchParams.set('sort_asc', 'true');
        sortIcon.style.transform = 'scaleY(-1)';

        // DEMO CODE: REMOVE WHEN NO LONGER NEEDED
        console.log('toggle sort order: ASC');
    }
    else {
        searchParams.set('sort_asc', 'false');
        sortIcon.style.transform = 'none';

        // DEMO CODE: REMOVE WHEN NO LONGER NEEDED
        console.log('toggle sort order: DESC');
    }
}

function setSortBy() {
    const sortBySelect = document.getElementById('sortBy');
    const sortByVal = sortBySelect.options[sortBySelect.selectedIndex].value;
    searchParams.set('sort_by', sortByVal);

    // DEMO CODE: REMOVE WHEN NO LONGER NEEDED
    console.log('set sort by: ' + searchParams.get('sort_by'));
}

/*
    Search for cars/offers from the backend API
*/
async function submitSearch() {
    // retrieve search keywords
    const searchBox = document.getElementById('searchBox');
    searchParams.set('keywords', searchBox.value);

    // retrieve and update finanical info
    const formFinancials = document.getElementById('form-finanicals');
    const financialInfo = new FormData(formFinancials);
    searchParams.set('down_payment', financialInfo.get('down_payment'));
    searchParams.set('budget_mo', financialInfo.get('budget_mo'));

    // create a search query by inclduing the user_id
    let searchQuery = new URLSearchParams(searchParams.toString());
    searchQuery.set('user_id', fetchQueryParamByKey('user_id'));

    try {
        // POST the search query to the backend API
        const response = await fetch(API_URL + '/search?' + searchQuery.toString());

        // retrieve the returned cars/offers
        const results = await response.json();

        // display the results
        displayCarsOrOffers(results.slice(100, 110));
    }
    catch (e) {
        console.log(e);
        console.log(searchQuery.toString());
    }
}


/*
    Get cars and loan offers
*/

/*
    Generate a new user ID randomly, with the last three digits being the credit score
*/
function genNewUserID() {
    const cs_min = 300; // minimum credit score
    const cs_max = 900; // maximum credit score
    const utc_string = JSON.stringify(new Date().getTime()); // current UTC timestamp
    // generate a random number between cs_min and cs_max
    const rand_credit_score = JSON.stringify(
        Math.floor(Math.random() * (cs_max - cs_min)) + cs_min
    );
    return 'u' + utc_string + rand_credit_score;
}

/*
    Accept a list of cars/offers returned from the backend and call addCarToContainer()
    on each item.
*/
function displayCarsOrOffers(listings) {
    removeAllCarsOffers();
    for (const item of listings) {
        addCarToContainer(
            item['id'],
            item['brand'],
            item['model'],
            item['year'],
            item['kms'],
            item['price'],
            item['apr']
        )
    }
}

/*
    Add a car offer card to the car offers container.
    - if all parameters provided, then construct an available car offer
        - this option should be used after agreement/login
    - if the apr field is null or '', then construct an unavailable car offer with
      car info only
        - this option should be used before agreement/login
*/
function addCarToContainer(
    id, make, model, year, kms, price, apr, payment_mo, loan_term, total_sum
) {
    // get render target
    let carsContainer = document.getElementById('carsContainer');

    // get mustache templates
    const tmpl_CarOffer = document.getElementById('tmpl_CarOffer').innerHTML;
    const tmpl_CarOfferCarInfo = document.getElementById('tmpl_CarOfferCarInfo').innerHTML;
    const tmpl_CarOfferLoanInfo = document.getElementById('tmpl_CarOfferLoanInfo').innerHTML;

    // render car info
    const carData = {
        make: make,
        model: model,
        year: year,
        kms: Math.round(kms),
        price: Math.round(price * 100) / 100
    };
    const carInfoRendered = Mustache.render(tmpl_CarOfferCarInfo, carData);

    // if given loan data, render loan info with available button
    if ((apr !== '') && (apr !== null) && (apr !== undefined)) {
        const loanData = {
            apr: apr,
            payment_mo: payment_mo,
            loan_term: loan_term,
            total_sum: total_sum
        };
        var loanInfoRendered = Mustache.render(tmpl_CarOfferLoanInfo, loanData);
        var carOfferBtn = document.getElementById('tmpl_CarOfferBtnAvailable').innerHTML;
    }
    // otherwise, provide empty loan info and an unavailable button
    else {
        var loanInfoRendered = '';
        var carOfferBtn = document.getElementById('tmpl_CarOfferBtnUnavailable').innerHTML;
    }

    // assemble car offer
    const carOfferData = {
        car_info: carInfoRendered,
        loan_info: loanInfoRendered,
        button: Mustache.render(carOfferBtn, {id: id})
    }
    const carOfferRendered = Mustache.render(tmpl_CarOffer, carOfferData);

    // append car offer element to cars container
    carsContainer.innerHTML += carOfferRendered;
}

/*
    Remove all cars in the cars/offers container.
*/
function removeAllCarsOffers() {
    let carsContainer = document.getElementById('carsContainer');
    carsContainer.innerHTML = '';
}


/*
    Claim loan offers
*/

async function claimOffer(id) {
    console.log('Claiming ' + id);
}


// always call this function on page load
onPageLoad();
