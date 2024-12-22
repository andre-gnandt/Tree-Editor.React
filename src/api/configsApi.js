const postOptions =  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: ""
}

const putOptions =  {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: ""
}

const baseURL = "http://localhost:11727";

async function GetCountries(){
    return await fetch(baseURL+"/api/ConfigTypes/Countries").then(res => res.json()).then(
        (result) => { 
          return result;
        }
    );   
};

export {GetCountries}