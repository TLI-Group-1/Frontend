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

    // configure default sort key
    let sortByURL = fetchQueryParamByKey('sort_by');
    if (sortByURL === null) {
        setPairInQuery('sort_by', 'price');
    } else {
        // change the input element selected value to reflect URL selection
        const sortBySelect = document.getElementById('sortBy');
        let options = sortBySelect.options;
        for (let opt, i = 0; (opt = options[i]); i++) {
            if (opt.value == sortByURL) {
                sortBySelect.selectedIndex = i;
                break;
            }
        }
    }

    // configure default sort order
    let sortAscURL = fetchQueryParamByKey('sort_asc');
    if (sortAscURL === null) {
        setPairInQuery('sort_asc', 'true');
    } else if (sortAscURL == 'false') {
        document.getElementById('sortIcon').style.transform = 'none';
    }

    // check for user ID on page load, and log in if present
    const userIDCurr = fetchQueryParamByKey('user_id');
    if (userIDCurr === null || userIDCurr === '') {
        // initialize empty user_id, downpayment, monthly budget for the car display search
        setPairInQuery('downpayment', '');
        setPairInQuery('budget_mo', '');
        setPairInQuery('user_id', '');
        submitSearch();
    } else {
        // log in the user
        await userLogin();
        // fetch and display the user's claimed offers, if there is any
        await updateClaimedOffers(fetchQueryParamByKey('user_id'));
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
            budgetMo = userParams['budget_mo'];
        }
        setPairInQuery('budget_mo', budgetMo);
        document.querySelector('input[name="budget_mo"]').value = budgetMo;

        // update user down payment if not given
        let downPayment = fetchQueryParamByKey('downpayment');
        if (downPayment === null || downPayment === '') {
            downPayment = userParams['down_payment'];
        }
        setPairInQuery('downpayment', downPayment);
        document.querySelector('input[name="down_payment"]').value =
            downPayment;
    } catch (e) {
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

    // show more sort options
    const sortByContainer = document.getElementById('sortBy');
    sortByContainer.innerHTML +=
        document.getElementById('tmpl_SortOptions').innerHTML;

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
    } else {
        // for ascending order, do not flip icon
        sortIcon.style.transform = 'none';
        // configure the search params to set ascending search order to false
        setPairInQuery('sort_asc', 'false');
    }
    // trigger a search
    submitSearch();
}

/*
    Set search result sort key according to input selection
*/
function setSortByFromElement() {
    // fetch input sort-by value
    const sortBySelect = document.getElementById('sortBy');
    const sortByVal = sortBySelect.options[sortBySelect.selectedIndex].value;
    // configure the search params to set desired sort-by value
    setPairInQuery('sort_by', sortByVal);
    // trigger a search
    submitSearch();
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
        // make the API call
        let results = await api.search(window.location.search);
        if (results.length == 0) {
            // clear out the cars/offers container
            removeAllCarsOffers();
            // show the user an error
            let carsContainer = document.getElementById('carsContainer');
            carsContainer.innerHTML +=
                '<p class="error-message">' +
                'You are not offered a loan! ' +
                'Your credit score, monthly budget, or down payment is too low.</p>';
        } else {
            // display the results if successful
            displayCarsOrOffers(results);
        }

        // update the list of claimed offers upon every search after login
        const userID = fetchQueryParamByKey('user_id');
        if (userID !== '' && userID !== null) {
            updateClaimedOffers(userID);
        }
    } catch (e) {
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
    // clear out the cars/offers container
    removeAllCarsOffers();

    // add all car/loan offer listings to the container
    for (const item of listings) {
        if ('mileage' in item) {
            item['kms'] = item['mileage'];
        }
        addCarToContainer(
            item['offer_id'],
            item['brand'],
            item['model'],
            item['year'],
            item['kms'],
            item['price'],
            item['interest_rate'],
            item['payment_mo'],
            item['term_mo'],
            item['total_sum']
        );

        // check to see if the offer is claimed
        if (item['claimed'] === true) {
            // set the claim button to claimed
            let claimButton = document.querySelector(
                'button.claim-btn[name="' + item['offer_id'] + '"]'
            );
            toggleButtonClaimed(claimButton);
        }
    }

    // if there is an odd number of cars, add an invisible entry for visual pleasantness
    if (listings.length % 2 !== 0) {
        let carsContainer = document.getElementById('carsContainer');
        carsContainer.innerHTML +=
            '<div class="car-offer card border-thin" style="visibility: hidden;"></div>';
    }
}

/*
    Add a car offer card to the car offers container.
    - if all parameters provided, then construct an available car offer
        - this option should be used after agreement/login
    - if the interest_rate field is null or '', then construct an unavailable car offer with
      car info only
        - this option should be used before agreement/login
*/
function addCarToContainer(
    id,
    make,
    model,
    year,
    kms,
    price,
    interest_rate,
    payment_mo,
    loan_term,
    total_sum
) {
    // get render target
    let carsContainer = document.getElementById('carsContainer');

    // get mustache templates
    const tmpl_CarOffer = document.getElementById('tmpl_CarOffer').innerHTML;
    const tmpl_CarOfferCarInfo = document.getElementById(
        'tmpl_CarOfferCarInfo'
    ).innerHTML;
    const tmpl_CarOfferLoanInfo = document.getElementById(
        'tmpl_CarOfferLoanInfo'
    ).innerHTML;

    // render car info
    const carData = {
        make: make,
        model: model,
        year: year,
        kms: Math.round(kms),
        price: Math.round(price * 100) / 100,
    };
    const carInfoRendered = Mustache.render(tmpl_CarOfferCarInfo, carData);

    // if given loan data, render loan info with available button
    if (
        interest_rate !== '' &&
        interest_rate !== null &&
        interest_rate !== undefined
    ) {
        const loanData = {
            interest_rate: Math.round(interest_rate * 100) / 100,
            payment_mo: Math.round(payment_mo * 100) / 100,
            loan_term: loan_term,
            total_sum: total_sum,
        };
        var loanInfoRendered = Mustache.render(tmpl_CarOfferLoanInfo, loanData);
        var carOfferBtn = document.getElementById(
            'tmpl_CarOfferBtnAvailable'
        ).innerHTML;
    }
    // otherwise, provide empty loan info and an unavailable button
    else {
        var loanInfoRendered = '';
        var carOfferBtn = document.getElementById(
            'tmpl_CarOfferBtnUnavailable'
        ).innerHTML;
    }

    // assemble car offer
    const carOfferData = {
        car_info: carInfoRendered,
        loan_info: loanInfoRendered,
        button: Mustache.render(carOfferBtn, {id: id}),
    };
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
    carsContainer.innerHTML =
        '<center style="font-size: 2rem;">Loading...</center>';
}

/*
    Claimed loan offers operations
*/

/*
    Update the list of claimed offers and associated display
*/
async function updateClaimedOffers(userID) {
    const userOffer = await fetchClaimedOffers(userID);
    const offersDetailsLink = document.getElementById('offersDetailsLink');
    if (userOffer !== null) {
        offersDetailsLink.style.visibility = 'visible';
    } else {
        removeAllLoanOffers();
        offersDetailsLink.style.visibility = 'hidden';
    }
}

/*
    Visually toggle the specified claim button between claimed and unclaimed
*/
function toggleButtonClaimed(claimButton) {
    for (let part of claimButton.children) {
        // modify the text component
        if (part.className.includes('claim-text')) {
            // unclaimed state
            if (part.className.includes('btn-dark-blue')) {
                part.className = part.className.replace(
                    'btn-dark-blue',
                    'btn-red'
                );
                part.textContent = 'Offer claimed';
            }
            // claimed state
            else {
                part.className = part.className.replace(
                    'btn-red',
                    'btn-dark-blue'
                );
                part.textContent = 'Claim this offer';
            }
        }
        // modify the heart component
        if (part.className.includes('claim-heart')) {
            // unclaimed state
            if (part.className.includes('bg-heart-empty')) {
                part.className = part.className.replace(
                    'bg-heart-empty',
                    'bg-heart-filled'
                );
                part.className = part.className.replace(
                    'btn-red',
                    'btn-dark-blue'
                );
            }
            // claimed state
            else {
                part.className = part.className.replace(
                    'bg-heart-filled',
                    'bg-heart-empty'
                );
                part.className = part.className.replace(
                    'btn-dark-blue',
                    'btn-red'
                );
            }
        }
    }
}

/*
    Claim a given loan offer
*/
async function toggleClaimOffer(id) {
    let claimButton = document.querySelector(
        'button.claim-btn[name="' + id + '"]'
    );
    const userID = fetchQueryParamByKey('user_id');
    // attempt to claim the specified offer at the backend API
    try {
        // offer is unclaimed, so claim it
        if (claimButton.innerHTML.includes('Claim this offer')) {
            await api.claimOffer(userID, id);
        }
        // offer is claimed, so unclaim it
        else {
            await api.unclaimOffer(userID, id);
        }

        // set the claim button to claimed
        toggleButtonClaimed(claimButton);

        // update the claimed offers widget, fetch and display the user's claimed offers
        await updateClaimedOffers(userID);
    } catch (e) {
        console.log(e);
    }
}

// always call this function on page load
onPageLoad();
