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
    /* hide agreement and reveil financial form parameters */
    const agreementContent = document.getElementById("side-agreement");
    agreementContent.style.display = "none";
    const financialParams = document.getElementById("side-params");
    financialParams.style.display = "block";

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
