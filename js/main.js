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
    Get a URL query string parameter by its key. Return null if non-existent.
*/
function fetchQueryParamByKey(key) {
    // get the querystring from the url bar and parse parameters
    var query_string = window.location.search;
    var url_params = new URLSearchParams(query_string);
    return url_params.get(key);
}

/*
    Append a key-value pair to the page URL query string
*/
function setPairInQuery(key, value) {
    // get the querystring from the url bar and parse parameters
    var query_string = window.location.search;
    var url_params = new URLSearchParams(query_string);
    // append the given key-value pair to the query
    url_params.set(key, value);
    // place the amended query string at the browser address bar
    var new_params = '?' + url_params.toString();
    window.history.replaceState(null, null, new_params);
}


/*
    Claimed offers list operations
*/

/*
    Get the list of offers for a specific user
*/
async function fetchClaimedOffers(userID) {
    try {
        // call the API to get the user's claimed offers
        const userClaimedOffers = await api.getClaimedOffers(userID);

        // if no claimed offers, return null
        if (userClaimedOffers.length === 0) {
            return null;
        }
        else {
            // populate the sidebar with user's claimed offers
            displayClaimedOffers(userClaimedOffers, userID);

            // return the first offer ID as selection default
            return userClaimedOffers[0]['offer_id'];
        }
    }
    catch (e) {
        console.log(e);
        console.log(window.location.search);
    }
}

/*
    Display the given list of claimed offers
*/
function displayClaimedOffers(offers, userID) {
    removeAllLoanOffers();
    for (const offer of offers) {
        addOfferToContainer(
            userID, offer['offer_id'], offer['brand'], offer['model'], offer['year'],
            offer['interest_rate'], offer['term_mo'], offer['total_sum']
        );
    }
}

/*
    Add a loan offer to the loan offers container
*/
function addOfferToContainer(
    user_id, offer_id, make, model, year, interest_rate, loan_term, total_sum
) {
    // get render target
    let offersContainer = document.getElementById('loanOffersContainer');

    // get mustache template
    const tmpl_LoanOffer = document.getElementById('tmpl_LoanOffer').innerHTML;

    // render loan offer info
    const loanOfferData = {
        user_id: user_id,
        offer_id: offer_id,
        make: make,
        model: model,
        year: year,
        payment_mo: Math.round((total_sum / loan_term) * 100) / 100,
        loan_term: loan_term,
        interest_rate: Math.round(interest_rate * 100) / 100
    };
    const loanOfferRendered = Mustache.render(tmpl_LoanOffer, loanOfferData);

    // append loan offer element to offers container
    offersContainer.innerHTML += loanOfferRendered;
}

/*
    Remove all loan offers in the claimed offers container.
*/
function removeAllLoanOffers() {
    let loanOffersContainer = document.getElementById('loanOffersContainer');
    loanOffersContainer.innerHTML = '';
}
