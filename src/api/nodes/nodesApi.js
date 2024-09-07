const nodesApi = () => {

    const putOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: ""
    }

    function updateNode(id, node){
        putOptions.body = JSON.stringify(node);
        fetch("http://localhost:11727/api/Nodes/"+id, putOptions);
    };
}

  export default nodesApi;