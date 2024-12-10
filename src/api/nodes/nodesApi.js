import { Saving, DoneSaving, error, Success } from "../../features/utils/UtilityFunctions";

const putOptions = {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    type: 'PUT',
    body: ""
}

const postOptions =  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: ""
}

const baseURL = "http://localhost:11727";

async function DeleteSingle(parentId, deleteNode){
    Saving();
    putOptions.body = JSON.stringify(deleteNode);;
    try{
        return await fetch(baseURL+"/api/Nodes/Delete-One/"+parentId, putOptions)
        .then((response)=>response.json())
            .then((responseJson)=>{ DoneSaving(); Success(); return responseJson;});
        }
        catch(error)
        {

        }
        DoneSaving();
        error();
        return null;  
};

async function DeleteCascade(id){
    
    Saving();
   
    try{
        return await fetch(baseURL+"/api/Nodes/Delete-Cascade"+id, {method: 'DELETE'})
        .then((response)=>response.json())
            .then((responseJson)=>{ DoneSaving(); Success(); return responseJson;});
        }
        catch(error)
        {

        }
        DoneSaving();
        error();
        return null;  
};

async function updateNode(id, node){
        Saving();
        putOptions.body = JSON.stringify(node);
        try{
            return await fetch(baseURL+"/api/Nodes/"+id, putOptions)
            .then((response)=>response.json())
            .then((responseJson)=>{ DoneSaving(); Success(); return responseJson;});
        }
        catch(error)
        {

        }
        DoneSaving();
        error();
        return null;      
};

async function createNode(node){
    postOptions.body = JSON.stringify(node);

    Saving();
    try{
        return await fetch(baseURL+"/api/Nodes/", postOptions)
        .then((response)=>response.json())
            .then((responseJson)=>{ DoneSaving(); Success(); return responseJson;});
        }
        catch(error)
        {

        }
        DoneSaving();
        error();
        return null;  
    
};

async function createRoot(node){
    postOptions.body = JSON.stringify(node);
    Saving();
    try{
        return await fetch(baseURL+"/api/Nodes/Root", postOptions)
        .then((response)=>response.json())
            .then((responseJson)=>{ DoneSaving(); Success(); return responseJson;});
        }
        catch(error)
        {

        }
        DoneSaving();
        error();
        return null;  
};

async function updateManyNodes(id, nodeList){
    putOptions.body = JSON.stringify(nodeList);
    Saving();
    try{
      return await fetch(baseURL+"/api/Nodes/Many/"+id, putOptions)
      .then((response)=>response.json())
                .then((responseJson)=>{ DoneSaving(); Success(); return responseJson;});
            }
            catch(error)
            {

            }
            DoneSaving();
            error();
            return null;  
  };

export{updateManyNodes, updateNode, DeleteSingle, DeleteCascade, createNode, createRoot}
