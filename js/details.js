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
        removeAllLoanOffers();
        for (const offer of userClaimedOffers) {
            console.log(offer);
            // DEMO
            offer['brand'] = 'Honda';
            offer['model'] = 'Civic';
            offer['year'] = 2018;

            addOfferToContainer(
                offer['offerId'], offer['brand'], offer['model'], offer['year'],
                offer['interestRate'], offer['termMo'], offer['totalSum']
            );
        }
    }
    catch (e) {
        console.log(e);
        console.log(window.location.search);
    }
}

/*
    Add a loan offer to the loan offers container
*/
function addOfferToContainer(
    offer_id, make, model, year, apr, loan_term, total_sum
) {
    // get render target
    let offersContainer = document.getElementById('loanOffersContainer');

    // get mustache template
    const tmpl_LoanOffer = document.getElementById('tmpl_LoanOffer').innerHTML;

    // render loan offer info
    const loanOfferData = {
        offer_id: offer_id,
        make: make,
        model: model,
        year: year,
        payment_mo: Math.round((total_sum / loan_term) * 100) / 100,
        loan_term: loan_term,
        apr: Math.round(apr * 100) / 100
    };
    const loanOfferRendered = Mustache.render(tmpl_LoanOffer, loanOfferData);

    // append loan offer element to offers container
    offersContainer.innerHTML += loanOfferRendered;
}

/*
    Remove all loan offers in the claimed offers container.
*/
function removeAllLoanOffers() {
    let carsContainer = document.getElementById('loanOffersContainer');
    carsContainer.innerHTML = '';
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
