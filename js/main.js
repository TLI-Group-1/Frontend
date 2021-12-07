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
