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
    // display loading text in the cars/offers container
    setCarsOffersLoading();

    // configure their default search preferences if none provided in URL
    // configure default sort key
    setSortBy();
    // configure default sort order
    let sortAscURL = fetchQueryParamByKey('sort_asc');
    if (sortAscURL === null) {
        setPairInQuery('sort_asc', 'true');
    }

    // check for user ID on page load, and log in if present
    const userIDCurr = fetchQueryParamByKey('user_id');
    if (userIDCurr === null) {
        // initialize empty user_id, downpayment, monthly budget for the car display search
        setPairInQuery('downpayment', '');
        setPairInQuery('budget_mo', '');
        setPairInQuery('user_id', '');
        submitSearch();
    }
    else {
        // log in the user
        await userLogin();
        // fetch and display the user's claimed offers, if there is any
        const userOffer = await fetchClaimedOffers(fetchQueryParamByKey('user_id'));
        if (userOffer !== null) {
            const offersDetailsLink = document.getElementById('offersDetailsLink');
            offersDetailsLink.style.visibility = 'visible';
        }
    }
}


/*
    Login/agreement feature
*/
async function userLogin() {
    // check whether an existing user_id is given; generte a new user ID if none provided
    let userID = fetchQueryParamByKey('user_id');
    if (userID === null || userID === '') {
        userID = genNewUserID();
        setPairInQuery('user_id', userID);
    }

    // set the link of the offers details page with userID
    const offersDetailsLink = document.getElementById('offersDetailsLink');
    offersDetailsLink.href = './details.html?user_id=' + userID;

    // try to log in the user and fetch their financial information
    try {
        // call the API to log in the user
        const userParams = await api.login(userID);

        // update user budget if not given
        let budgetMo = fetchQueryParamByKey('budget_mo');
        if (budgetMo === null || budgetMo === '') {
            budgetMo = userParams["budget_mo"];
        }
        setPairInQuery('budget_mo', budgetMo);
        document.querySelector('input[name="budget_mo"]').value = budgetMo;

        // update user down payment if not given
        let downPayment = fetchQueryParamByKey('downpayment');
        if (downPayment === null || downPayment === '') {
            downPayment = userParams["down_payment"];
        }
        setPairInQuery('downpayment', downPayment);
        document.querySelector('input[name="down_payment"]').value = downPayment;
    }
    catch (e) {
        console.log(e);
    }

    // after loggin in, show the loan offers available to this user
    await displayLoggedInView();
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
    await submitSearch();

    // display the claimed offers widget
    const claimOffers = document.getElementById('claimedOffersWidget');
    claimOffers.style.display = 'flex';
}

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
    Search features
*/

/*
    Toggle search result sort order between true and false
*/
function toggleSortOrder() {
    const sortIcon = document.getElementById('sortIcon');
    if (fetchQueryParamByKey('sort_asc') == 'false') {
        // for ascending order, flip icon vertically
        sortIcon.style.transform = 'scaleY(-1)';
        // configure the search params to set ascending search order to true
        setPairInQuery('sort_asc', 'true');
    }
    else {
        // for ascending order, do not flip icon
        sortIcon.style.transform = 'none';
        // configure the search params to set ascending search order to false
        setPairInQuery('sort_asc', 'false');
    }
}

/*
    Set search result sort key according to input selection
*/
function setSortBy() {
    // fetch input sort-by value
    const sortBySelect = document.getElementById('sortBy');
    const sortByVal = sortBySelect.options[sortBySelect.selectedIndex].value;
    // configure the search params to set desired sort-by value
    setPairInQuery('sort_by', sortByVal);
}

/*
    Search for cars/offers from the backend API
*/
async function submitSearch() {
    // show that cars are loading
    setCarsOffersLoading();

    // retrieve and update finanical info
    const formFinancials = document.getElementById('form-finanicals');
    const financialInfo = new FormData(formFinancials);
    setPairInQuery('downpayment', financialInfo.get('down_payment'));
    setPairInQuery('budget_mo', financialInfo.get('budget_mo'));

    // attempt to send the search query to the backend API
    try {
        // DEBUG: log search string
        console.log(window.location.search);

        // make the API call
        let results = await api.search(window.location.search);
        // display the results if successful
        displayCarsOrOffers(results);
    }
    catch (e) {
        console.log(e);
        console.log(window.location.search);
    }
}


/*
    Cars and loan offers (left side results) operations
*/

/*
    Accept a list of cars/offers returned from the backend and call addCarToContainer()
    on each item.
*/
function displayCarsOrOffers(listings) {
    removeAllCarsOffers();

    // add all car/loan offer listings to the container
    for (const item of listings) {
        addCarToContainer(
            item['offer_id'], item['brand'], item['model'], item['year'], item['kms'],
            item['price'], item['apr'], item['payment_mo'], item['term_length'],
            item['total_sum']
        )
    }

    // if there is an odd number of cars, add an invisible entry for visual pleasantness
    if (listings.length % 2 !== 0) {
        let carsContainer = document.getElementById('carsContainer');
        carsContainer.innerHTML += '<div class="car-offer card border-thin" style="visibility: hidden;"></div>';
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
            apr: Math.round(apr * 100) / 100,
            payment_mo: Math.round(payment_mo * 100) / 100,
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
    Put loading text in cars/offers container.
*/
function setCarsOffersLoading() {
    let carsContainer = document.getElementById('carsContainer');
    carsContainer.innerHTML = '<center style="font-size: 2rem;">Loading...</center>';
}


/*
    Claimed loan offers operations
*/

/*

*/


/*
    TODO: claim a given loan offer
*/
async function claimOffer(id) {
    console.log('Claiming ' + id);
}


// always call this function on page load
onPageLoad();
