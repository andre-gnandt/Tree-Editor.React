import { Loading, DoneLoading, error } from "../../features/utils/Functions";

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

async function deleteTree(id){
    return  await fetch(baseURL+"/api/Trees/"+id, {method: 'DELETE'})
    .then((response)=>response.json())
    .then((responseJson)=>{return responseJson});
};

async function createTree(tree){
    const options = {...postOptions};
    options.body = JSON.stringify(tree);
    return await fetch(baseURL+"/api/Trees/", options)
    .then((response)=>response.json())
    .then((responseJson)=>{return responseJson});;
};

async function updateTree(id, input){
    const tree = {...input};
    delete tree['rootId'];
    
    const options = {...putOptions};
    options.body = JSON.stringify(tree);
    return await fetch(baseURL+"/api/Trees/"+id, options)
    .then((response)=>response.json())
    .then((responseJson)=>{return responseJson});
};

async function GetFullTree(id){
    Loading();

    try{
        return await fetch(baseURL+"/api/Trees/FullTree/"+id).then(res => res.json()).then(
            result => { 
            DoneLoading();
            return result;
            }
        );   
    }
    catch(error)
    {

    }

    DoneLoading();
    //error();
    return null;
};

async function GetTreeList(){
    Loading();
    return await fetch(baseURL+"/api/Trees").then(res => res.json()).then(
        (result) => { 
          DoneLoading();
          return result;
        }
    );   
};

export{GetFullTree, GetTreeList, deleteTree,  createTree, updateTree}