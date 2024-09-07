import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { cloneNode, updateNodeData, updateNodeNumber } from './nodeSlice'
//import { InputText } from 'primereact/inputtext';
import './DetailsList.css';

const NodeDetails = input => {
    const props = input.props
    const node = useSelector(state => state.node);
    const dispatch = useDispatch();
    dispatch(cloneNode(input));
    
   // render() {
        
   
        return(
            <div>
                <div>
                    <h1>{props.title}</h1>
                </div>
                <div>
                    Data: <input value = {props.data} />
                </div>
                    Number: <input onChange={(value) => dispatch(updateNodeNumber(value.target.values))} value = {node.number ? node.number : ""} />
                <div>
                    <button > Save </button>
                    <button > Reset </button>
                </div>
            </div> );
    //};
    
      /*
    return(
        <div>
            <div>
                <h1>{props.props.title}</h1>
            </div>
            <div>
                Data: <input value = {props.data} />
            </div>
                Number: <input value = {props.number ? props.number : ""} />
            <div>
                <button > Save </button>
                <button > Reset </button>
            </div>
        </div> );
    */
}

export default NodeDetails 