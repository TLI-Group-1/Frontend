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
    // DEMO
    // for (let i = 0; i != 20; i++) {
    //     addOfferToContainer(
    //         "offer123", "Honda", "Civic", 2018, 250, 320, 3.2
    //     );
    // }
    fetchClaimedOffers();
}

/*
    Claimed offers list operations
*/

/*
    Get the list of offers for a specific user
*/
async function fetchClaimedOffers() {
    // fetch the user_id from the URL
    let userID = fetchQueryParamByKey('user_id');

    try {
        // call the API to get the user's claimed offers
        const userClaimedOffers = await api.getClaimedOffers(userID);

        // populate the sidebar with user's claimed offers
        displayClaimedOffers(userClaimedOffers, userID);

        // highlight the specified offer
        highlightOffer(fetchQueryParamByKey('offerSelected'));
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
        // DEMO
        // console.log(offer);
        offer['brand'] = 'Honda';
        offer['model'] = 'Civic';
        offer['year'] = 2018;

        addOfferToContainer(
            userID, offer['offerId'], offer['brand'], offer['model'], offer['year'],
            offer['interestRate'], offer['termMo'], offer['totalSum']
        );
    }
}

/*
    Highlight an offer (purely cosmetically)
*/
function highlightOffer(offer_id) {
    // give the offer a "selected" style
    const offerEntry = document.querySelector('li[name="' + offer_id +'"]');
    offerEntry.className += " offer-selected";
    // scroll the offer entry into view (if not already in-view)
    offerEntry.scrollIntoView(false);
}


/*
    Highlight an offer and display its details
*/
async function showOfferDetails() {

}


/*
    Offer details operations
*/

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
