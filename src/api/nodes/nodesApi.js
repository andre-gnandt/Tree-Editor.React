const putOptions = {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    type: 'PUT',
    body: ""
}

export async function updateNode(id, node){
    putOptions.body = JSON.stringify(node);
    await fetch("https://treeeditor-private-old-hill-8065.fly.dev/api/Nodes/"+id, putOptions)
    .then((response)=>response.json())
    .then((responseJson)=>{return responseJson});
};

export function GetNode(id){
    let value = null;
    fetch("https://treeeditor-private-old-hill-8065.fly.dev/api/Nodes/"+id).then(res=> res.json()).then(
        result => {
          value = result;
        }
    )
    return value;
};

export default async function GetTrees(){
    await fetch("https://treeeditor-private-old-hill-8065.fly.dev/api/Nodes/Trees").then(res => res.json()).then(
        result => { return result;}
    );
    return null;
};
