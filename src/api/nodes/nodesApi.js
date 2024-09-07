const putOptions = {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: ""
}

export function updateNode(id, node){
    putOptions.body = JSON.stringify(node);
    fetch("http://localhost:11727/api/Nodes/"+id, putOptions);
};

export function GetNode(id){
    fetch("http://localhost:11727/api/Nodes/"+id).then(res=> res.json()).then(
        result => {
          return result;
        }
    )
};

export function GetTrees(){
    fetch("http://localhost:11727/api/Nodes/Trees").then(res=> res.json()).then(
        result => {
          return result;
        }
    )
};
