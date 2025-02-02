import { Saving, error, DoneSaving, Success } from "../../features/utils/Functions";

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

const deleteOptions = {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: ""
}

const removeBase64 = (files) =>
{
    files.forEach(file => {
        file.base64 = null;
    });
}

const baseURL = "http://localhost:11727";

async function DeleteSingle(parentId, deleteNode){
    Saving();
    const options = {...deleteOptions}
    options.body = JSON.stringify(deleteNode);;
    try{
        return await fetch(baseURL+"/api/Nodes/Delete-One/"+parentId, options)
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

async function updateNode(id, input){
        Saving();
        const node = structuredClone(input);
        removeBase64(node.files);
        const options = {...putOptions};
        options.body = JSON.stringify(node);
        try{
            return await fetch(baseURL+"/api/Nodes/"+id, options)
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
    const options = {...postOptions};
    options.body = JSON.stringify(node);

    Saving();
    try{
        return await fetch(baseURL+"/api/Nodes/", options)
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
    const options = {...postOptions};
    options.body = JSON.stringify(node);
    Saving();
    try{
        return await fetch(baseURL+"/api/Nodes/Root", options)
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

async function updateManyNodes(treeId, nodeList){
    const options = {...putOptions};
    options.body = JSON.stringify(nodeList);
    Saving();
    try{
      return await fetch(baseURL+"/api/Nodes/Many/"+treeId, options)
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
