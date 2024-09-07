import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { cloneNode, updateNodeData, updateNodeNumber } from './nodeSlice'
import { InputText } from 'primereact/inputtext';
//import updateNode from '/LocalTreeData.React/src/api/nodes/nodesApi';
import './DetailsList.css';

const NodeDetails = (input) => {
    const firstRender = useRef(true);
    const props = input.props
    const dispatch = useDispatch();
    const node = useSelector(state => state.node);

    if(firstRender.current){
        dispatch(cloneNode(props));
    }

    const handleChange = (value, method) => {
        firstRender.current = false;
        dispatch(method(value));
    }

    const putOptions = {
        method: 'PUT',
        headers: { "Content-type": "application/json; charset=UTF-8"},
        body: null
    }

    function updateNode(id, node){
        putOptions.body = JSON.stringify(node);
        fetch(`http://localhost:11727/api/Nodes/${id}`, putOptions);
    };

        return(
            <div>
                <div>
                    <h1>{node.title}</h1>
                </div>
                <div>
                    Data: <InputText onChange = {(e) => handleChange(e.target.value, updateNodeData)} value = {node.data} />
                </div>
                    Number: <InputText onChange = {(e) => handleChange(e.target.value, updateNodeNumber)} value = {node.number ? node.number : ""} />
                <div>
                    <button onClick = {() => updateNode(node.id, node)}> Save </button>
                    <button onClick = {() => handleChange(props, cloneNode)} > Reset </button>
                </div>
            </div> );
}

export default NodeDetails 