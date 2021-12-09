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
    Object containing methods related to calling the backend API.
*/
var api = {
    // The URL root of the API backend
    API_URL: "https://api.autodirect.tech",

    login: async function(userID) {
        // send the search query to the backend API
        const response = await fetch(this.API_URL + '/login?user_id=' + userID);

        // retrieve the returned cars/offers
        const results = await response.json();

        if (response.status == 200) {
            return results;
        }
        else {
            console.log(response);
            throw "HTTP status: " + response.status;
        }
    },

    search: async function(searchQueryStr) {
        // send the search query to the backend API
        const response = await fetch(this.API_URL + '/search' + searchQueryStr);

        // retrieve the returned cars/offers
        const results = await response.json();

        if (response.status == 200) {
            return results;
        }
        else {
            console.log(response);
            throw "HTTP status: " + response.status;
        }
    },

    getClaimedOffers: async function(userID) {
        // send the search query to the backend API
        const response = await fetch(this.API_URL + '/getClaimedOffers?user_id=' + userID);

        // retrieve the returned cars/offers
        const results = await response.json();

        if (response.status == 200) {
            return results;
        }
        else {
            console.log(response);
            throw "HTTP status: " + response.status;
        }
    },

    getOfferDetails: async function(userID, OfferID) {
        // send the search query to the backend API
        const response = await fetch(
            this.API_URL + '/getOfferDetails?user_id=' + userID + '&offer_id=' + OfferID
        );

        // retrieve the returned cars/offers
        const results = await response.json();

        if (response.status == 200) {
            return results;
        }
        else {
            console.log(response);
            throw "HTTP status: " + response.status;
        }
    },

    claimOffer: async function(userID, OfferID) {
        // send the search query to the backend API
        const response = await fetch(
            this.API_URL + '/claimOffer?user_id=' + userID + '&offer_id=' + OfferID
        );

        if (response.status == 200) {
            return;
        }
        else {
            console.log(response);
            throw "HTTP status: " + response.status;
        }
    },

    unclaimOffer: async function(userID, OfferID) {
        // send the search query to the backend API
        const response = await fetch(
            this.API_URL + '/unclaimOffer?user_id=' + userID + '&offer_id=' + OfferID
        );

        if (response.status == 200) {
            return;
        }
        else {
            console.log(response);
            throw "HTTP status: " + response.status;
        }
    }
};
