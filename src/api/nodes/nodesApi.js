const putOptions = {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    type: 'PUT',
    body: ""
}

export async function updateNode(id, node){
    putOptions.body = JSON.stringify(node);
    await fetch("http://localhost:11727/api/Nodes/"+id, putOptions)
    .then((response)=>response.json())
    .then((responseJson)=>{return responseJson});
};

export function GetNode(id){
    let value = null;
    fetch("http://localhost:11727/api/Nodes/"+id).then(res=> res.json()).then(
        result => {
          value = result;
        }
    )
    return value;
};

export default async function GetTrees(){
    await fetch("http://localhost:11727/api/Nodes/Trees").then(res => res.json()).then(
        result => { return result;}
    );
    return null;
};
