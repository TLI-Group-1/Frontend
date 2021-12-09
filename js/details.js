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
    Always called when the details page is loaded.
*/
async function onPageLoad() {
    // fetch the user_id from the URL
    let userID = fetchQueryParamByKey('user_id');
    // fetch all claimed offers for this user
    const firstOfferID = await fetchClaimedOffers(userID);

    // find the selected offer for this user
    let offerSelected = fetchQueryParamByKey('offerSelected');
    // select the first offer if none are specified
    if (offerSelected === null || offerSelected === '') {
        offerSelected = firstOfferID;
        setPairInQuery('offerSelected', offerSelected);
    }
    // show details for the specified offer
    await getOfferDetails(userID, offerSelected);
}

/*
    Claimed offers list operations
*/

/*
    Highlight an offer (purely cosmetically)
*/
function highlightOffer(offerID) {
    // give the offer a "selected" style
    const offerEntry = document.querySelector('li[name="' + offerID +'"]');
    offerEntry.className += " offer-selected";
    // scroll the offer entry into view (if not already in-view)
    offerEntry.scrollIntoView(false);
}


/*
    Offer details operations
*/

/*
    Fetch and display an offer's details based on the given offer ID
*/
async function getOfferDetails(userID, offerID) {
    // attempt to fetch the specified offer's details from the backend API
    try {
        // make the API call
        let details = await api.getOfferDetails(userID, offerID);

        // highlight the chosen offer
        highlightOffer(offerID);

        // display the offer details
        renderOfferDetails(
            details['brand'], details['model'], details['year'], details['kms'],
            details['price'], details['loanAmount'], details['interestRate'], details['termMo'],
            details['totalSum']
        )
    }
    catch (e) {
        console.log(e);
        console.log(window.location.search);
    }
}

/*
    Present a given offer's details
*/
function renderOfferDetails(
    make, model, year, kms, price, principal, apr, loan_term, total_sum
) {
    // get render target
    let offerDetailsContainer = document.getElementById('offerDetailsContainer');

    // get mustache template
    const tmpl_offerDetails = document.getElementById('tmpl_LoanDetails').innerHTML;

    // render loan offer info
    const offerDetailsData = {
        make: make,
        model: model,
        year: year,
        kms: Math.round(kms),
        price: Math.round(price * 100) / 100,
        principal: principal,
        apr: Math.round(apr * 100) / 100,
        payment_mo: Math.round((total_sum / loan_term) * 100) / 100,
        loan_term: loan_term,
        total_sum: total_sum
    };
    const offerDetailsRendered = Mustache.render(tmpl_offerDetails, offerDetailsData);

    // append loan offer element to offers container
    offerDetailsContainer.innerHTML = offerDetailsRendered;
}

/*
    Update the loan principal given user input
*/
async function submitNewPrincipal() {
    // retrieve new principal info
    const formNewPrincipal = document.getElementById('form-update-principal');
    const newPrincipal = (new FormData(formNewPrincipal)).get('loan-principal');

    console.log("update principal: " + newPrincipal);
}


// always call this function on page load
onPageLoad();
