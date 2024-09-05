import React, { useState, useEffect } from 'react'
//import { InputText } from 'primereact/inputtext';
import './DetailsList.css';

class NodeDetails extends React.Component {


    render() {
        return(
            <div>
                <div>
                    <h1>{this.props.title}</h1>
                </div>
                <div>
                    Data: <input value = {this.props.node.data} />
                </div>
                    Number: <input value = {this.props.node.number ? this.props.node.number : ""} />
                <div>
                    <button > Save </button>
                    <button > Reset </button>
                </div>
            </div> );
    }
}

export default NodeDetails 