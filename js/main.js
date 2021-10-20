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

function GetSensoData(){
    fetch("http://worldtimeapi.org/api/timezone/America/Toronto")
        // store response from the API in JSON
        .then(response => response.json())
        // log the response in the browser console
        .then(responseData => {
            // console.log(responseData);
            changeSpan(responseData.datetime);
        });
}

// call the GetSensoData function
GetSensoData()

function changeSpan(content){
    document.getElementById("demo_field").innerHTML=content;
}
