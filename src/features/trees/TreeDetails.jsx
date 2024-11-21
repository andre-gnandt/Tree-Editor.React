import React, { useState, useEffect, useRef } from 'react'
import { InputTextarea } from 'primereact/inputtextarea';
import { Dialog } from 'primereact/dialog';
import '../nodes/detailsList.css';
import Draggable from 'react-draggable';

const TreeDetails = ({reRenderList = null, unMount = null, id = null, inputTree, creation  = false}) => {
    const[hideButtons, setHideButtons] = useState(0);
    const changeCount = useRef(0);
    const titlePresent = useRef(true);
    const [titleRequired, setTitleRequired] = useState(titlePresent.current);
    const [deleteOptions, setDeleteOptions] = useState("");
    const [create, setCreate] = useState(creation);
    const [name, setName] = useState(inputTree.name);
    const [description, setDescription] = useState(inputTree.description);

    async function deleteTree(id){
        await fetch("http://localhost:11727/api/Trees/"+id, {method: 'DELETE'})
        .then((response)=>response.json())
        .then((responseJson)=>{return responseJson});
    };

    async function createTree(tree){
        const postOptions =  {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: ""
        }
        postOptions.body = JSON.stringify(tree);
        return await fetch("http://localhost:11727/api/Trees/", postOptions)
        .then((response)=>response.json())
        .then((responseJson)=>{return responseJson});;
    };

    async function updateTree(id, tree){
        const putOptions =  {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: ""
        }
        putOptions.body = JSON.stringify(tree);
        return await fetch("http://localhost:11727/api/Trees/"+id, putOptions)
        .then((response)=>response.json())
        .then((responseJson)=>{return responseJson});
    };

    function CheckValueChange(originalValue, previousValue, newValue)
    {
        console.log("original value: "+originalValue);
        console.log("previous value: "+previousValue);
        console.log("new value: "+newValue);
        if(originalValue != null && String(originalValue).trim().length === 0) originalValue = null;
        if(previousValue != null && String(previousValue).trim().length === 0) previousValue = null;
        if(newValue != null && String(newValue).trim().length === 0) newValue = null;

        const previousChangeCount = changeCount.current;
        if(previousValue == originalValue && newValue != originalValue)
        {
            changeCount.current++;
        }
        else if(previousValue !=  originalValue && newValue == originalValue)
        {
            changeCount.current--;
        }

        console.log("change count: "+changeCount.current);
        if((previousChangeCount == 0 && changeCount.current != 0) || (previousChangeCount != 0 && changeCount.current == 0))
        {
            setHideButtons(changeCount.current);
        }
    }

    const GetConfirmDelete = () =>
        {
            return (
            <>  <Draggable>
                    <Dialog className='alert' showHeader = {false}  style = {{height: '45vh', width: '40vw'}} headerStyle={{backgroundColor: 'coral'}} contentStyle={{backgroundColor: 'coral', overflow: 'hidden'}}  visible = {(deleteOptions === "confirm")} onHide = {() => {setDeleteOptions("")}}>
                        <>  
                        <i onClick={() => {setDeleteOptions("")}} className='pi pi-times' style = {{ marginRight: 'auto', cursor: 'pointer', fontSize: '4.8vh'}}/>                   
                            <div className='alert' style = {{marginLeft: '2.5vw', width: '40vw', height: '45vh'}}>
                                <div className='' style = {{position: 'relative', top: '0vh',  width: '35vw', height: '8vh', textAlign: 'center', fontSize: '3vh' }}>Please confirm that you would like to delete this Tree.</div>
                                <div style = {{position: 'relative', top: '10vh', marginTop: '1vh', display: 'flex', width: '35vw', height: '24vh'}}>
                                    <div style = {{backgroundColor: 'coral', width: '17.5vw', height: '100%', textAlign: 'center'}}>
                                        <button className='text-overflow button' onClick={() => {HandleDeleteTree();}} style = {{height: '12vh', width: '15.5vw', fontSize: '4vh'}}>Yes</button>
                                    </div>
                                    <div style = {{backgroundColor: 'coral', width: '17.5vw', height: '100%', textAlign: 'center'}}>
                                        <button 
                                             onClick={() => {setDeleteOptions(""); }}
                                             className='button text-overflow' style = {{height: '12vh',  width: '15.5vw', fontSize: '4vh'}}>No</button>
                                    </div>
                                </div>
                            </div>
                        </>
                    </Dialog>
                </Draggable>
            </>
            );
        }

    function SetInputTree(tree)
    {
        inputTree['id'] = tree.id;
        inputTree['description'] = tree.description;
        inputTree['rootId'] = tree.rootId;
        inputTree['name'] = tree.name;
        inputTree['isDeleted'] = tree.isDeleted;
    }

    function RenderCreateOrSaveButton()
    {
        if(create)
        {
            return (
                <>Create</>
            );
        }
        
        return (
            <>Save</>
        );
    }

    async function HandleDeleteTree()
    {   
        await deleteTree(id);
        unMount();
    }

    async function HandleSaveOrCreate()
    {
        if(!name || name.trim().length === 0)
        {
            titlePresent.current = false;
            setTitleRequired(false);
        }
        else if(create)
        {

            const newTree = await createTree({name: name, description: description});
            SetInputTree(newTree);
            //reRenderList("create", newTree);
            setCreate(false);
        }
        else
        {   
            inputTree.name = name;
            inputTree.description = description; 
            await updateTree(id, inputTree);
            //reRenderList("update");
        }   

        if(name && name.trim().length > 0)
        {
            changeCount.current = 0;
            setHideButtons(changeCount.current);
        }
    }

    const GetHeader = () => {
        if(create)return <>Create New Tree</>;
        
        return <>Tree Details</>;
    }
     // container: , top: '2.5vw', left: '1.5vw'}}>}
    //style = {{marginBottom: (hideButtons === 0) ? '0vh' : '3.275vh'}}
        return(
        <>  
            <div className='dialog-root'>
                <div id = 'fixed-header' className='fixed-header'>
                    <div style = {{top: '1.5vw', position: 'relative', height: '6.5vh', fontSize: '6vh', display: 'flex', textAlign: 'center', justifyContent: 'center'}}>
                        <i onClick={() => {unMount()}} className='pi pi-times' style = {{ marginRight: 'auto', cursor: 'pointer', fontSize: '6.5vh'}}/>
                        <div className='dialog-header' style = {{fontSize: '5vh', width: '33vw', textAlign: 'center', verticalAlign: 'middle'}}>{GetHeader()}</div>                   
                        <div style = {{marginLeft: 'auto', height: '6.5vh', width: '7vw',  float: 'right' }}>
                        { (!create) && (
                            <> 
                                <button className='button text-overflow' 
                                    style = {{width:'100%', backgroundColor: 'red', height: '6.5vh', maxHeight: '6.5vh', float: 'right', fontSize: '3vh', justifyContent: 'center'}} 
                                    onClick={() => {setDeleteOptions("confirm")}}                       
                                >
                                Delete</button>                   
                                { (deleteOptions === "confirm") && 
                                    (
                                    <>
                                        {GetConfirmDelete()}
                                    </>
                                    )
                                }
                            </>
                            )
                        }
                        </div>
                    </div> 
                </div>
                <div className={(changeCount.current === 0 && titleRequired) ? 'container-2': 'container-shrunk'} style = {{position: 'relative', overflowY: 'hidden'}} > 
                    <div style = {{display: 'flex', height: '44vh', marginBottom: '5.275vh'}}>
                        <div className='title-container'>
                            <InputTextarea 
                                autoResize 
                                rows = {1} 
                                placeholder="Title..." 
                                className= {(titleRequired) ? "title" : "title-required"}
                                spellCheck = {false}
                                onChange = {(e) => {CheckValueChange(inputTree.name, name, e.target.value); setName(e.target.value);}} value = {name ? name : ""} />
                        </div>
                    </div>
                    <div className="entryContainer">
                        <div className = "fullWidthLeft">
                            Description:  
                        </div> 
                        <div className="fullWidthRight" style = {{height: '17vh'}}>
                            <InputTextarea placeholder='Description...' autoResize style = {{height: '17vh'}} rows={5} className = "input" onChange = {(e) => {CheckValueChange(inputTree.description, description, e.target.value); setDescription(e.target.value);}} value = {description ? description : ""} />
                        </div>
                    </div>
                </div> 
                <div hidden = {changeCount.current === 0 && titleRequired} style = {{height: (changeCount.current === 0 && titleRequired)? '0vh':'6.5vh', width: '40vw', position: 'relative', left: '1.5vw', display: 'flex'}}>
                    <div hidden = {changeCount.current === 0}  id = 'node-details-button-container' style = {{ fontSize: '4vh', display: 'flex', height: '100%'}}>
                        <button hidden = {changeCount.current === 0} className='button text-overflow' style = {{height: '100%', width: '16vh', marginRight: '1vh'}} onClick = {() => { HandleSaveOrCreate(); }}> {RenderCreateOrSaveButton()} </button>
                        <button hidden = {changeCount.current === 0} className='button text-overflow' style = {{height: '100%', width: '16vh'}} onClick = {() => {titlePresent.current = true; changeCount.current = 0; setName(inputTree.name); setDescription(inputTree.description); }} > Reset </button>
                    </div>
                    <div className='text-overflow title-required-container'  hidden = {(titleRequired)} style = {{marginLeft: '2vw', width: '100%', color: 'red', textAlign: 'bottom'}}>Title is required!</div>
                </div>
            </div>
        </>    
        );
}

export default TreeDetails 