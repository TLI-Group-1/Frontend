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
    Login feature
*/

async function userLogin() {
    // hide agreement and reveil financial form parameters
    const agreementContent = document.getElementById("side-agreement");
    agreementContent.style.display = "none";
    const financialParams = document.getElementById("side-params");
    financialParams.style.display = "block";

    // remove all cars without loan info and add cars with loan info
    let carsContainer = document.getElementById("carsContainer");
    carsContainer.innerHTML = "";
    demoAddDummyCarsWithLoan();

    console.log("login");
}

/*
    Search bar features
*/

function setSortOrder() {
    const sortIcon = document.getElementById("sortIcon");
    if (sortIcon.style.transform == "none") {
        sortIcon.style.transform = "scaleY(-1)";
        console.log("toggle sort order: ASC");
    }
    else {
        sortIcon.style.transform = "none";
        console.log("toggle sort order: DESC");
    }
}

function setSortBy() {
    const sortBySelect = document.getElementById("sortBy");
    const sortByVal = sortBySelect.options[sortBySelect.selectedIndex].value;
    console.log("set sort by: " + sortByVal);
}

async function submitSearch() {
    const searchBox = document.getElementById("searchBox");
    const searchVal = searchBox.value;
    console.log("search: " + searchVal);
}

/*
    Get cars and loan offers
*/

function demoAddDummyCarsNoLoan() {
    for (let i = 0; i < 10; i++) {
        addCarToContainer("Honda", "Civic", 15000, "");
    }
}

function demoAddDummyCarsWithLoan() {
    for (let i = 0; i < 10; i++) {
        addCarToContainer("Honda", "Civic", 15000, 5.2, 250, 12, 21050);
    }
}

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

demoAddDummyCarsNoLoan();
