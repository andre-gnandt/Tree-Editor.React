const putOptions = {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    type: 'PUT',
    body: ""
}

export function updateNode(id, node){
    putOptions.body = JSON.stringify(node);
    fetch("http://localhost:11727/api/Nodes/"+id, putOptions);
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
