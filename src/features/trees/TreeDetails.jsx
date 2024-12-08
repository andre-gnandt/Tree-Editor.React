import React, { useState, useEffect, useRef } from 'react'
import { InputTextarea } from 'primereact/inputtextarea';
import { Dialog } from 'primereact/dialog';
import '../nodes/detailsList.css';
import '../trees/tree.css';
import Draggable from 'react-draggable';
import { useNavigate } from 'react-router-dom';
import history from '../../history';

const TreeDetails = ({reRenderList = null, unMount = null, id = null, inputTree, creation  = false}) => {
    const navigate = useNavigate();
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

    async function updateTree(id, input){
        const tree = {...input};
        delete tree['rootId'];
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
        if(originalValue != null && String(originalValue).length === 0) originalValue = null;
        if(previousValue != null && String(previousValue).length === 0) previousValue = null;
        if(newValue != null && String(newValue).length === 0) newValue = null;

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
        //history.push(window.location);
        navigate("/");
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
            reRenderList("create", newTree);
            setCreate(false);
            history.push(window.location);
            navigate("tree/"+newTree.id);
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
                <div className={'container-2'} style = {{position: 'relative', overflowY: 'hidden'}} > 
                    <div style = {{top: '1vh' , width: '36vw', left:'2vw', position: 'relative', display: 'flex', height: '33vh', marginBottom: '5.275vh'}}>
                        <div className='tree-title-container' style = {{justifyContent: 'center', textAlign: 'center', display: 'flex'}}>
                            <InputTextarea 
                                maxLength={50}
                                autoResize 
                                rows = {1} 
                                placeholder="Title..." 
                                className= {(titleRequired) ? "tree-title" : "tree-title-required"}
                                style = {{justifyContent: 'center', textAlign: 'center', display: 'flex'}}
                                spellCheck = {false}
                                onChange = {(e) => {CheckValueChange(inputTree.name, name, e.target.value); setName(e.target.value);}} value = {name ? name : ""} />
                        </div>
                    </div>
                    
                        {/*
                         container:   height: calc(83.5vh - 5vw);
                                        max-height: calc(83.5vh - 5vw); 
                         Title = 39.275vh
                            
                         result: calc(44.225 - 5vw)
                        */}
                        <div className = 'tree-description-container' style = {{justifyContent: 'center', textAlign: 'center', display: 'flex', width: '36vw', position: 'relative', left: '2vw'}}>
                            <InputTextarea 
                                maxLength={1000}
                                placeholder='Description...'   
                                autoResize  
                                rows={6} 
                                className = 'tree-description' 
                                style = {{justifyContent: 'center', verticalAlign: 'middle', textAlign: 'center', display: 'flex'}}
                                onChange = {(e) => {CheckValueChange(inputTree.description, description, e.target.value); setDescription(e.target.value);}} value = {description ? description : ""} />
                        </div>
                  
                </div> 
                <div  style = {{backgroundColor: (changeCount.current === 0 && titleRequired) ? '#F0F0F0' : '#DCDCDC', maxHeight: '6.5vh', height: '6.5vh', width: '40vw', position: 'relative', left: '1.5vw', display: 'flex'}}>
                    <div hidden = {changeCount.current === 0}  id = 'node-details-button-container' style = {{ fontSize: '4vh', display: 'flex',  maxHeight: '6.5vh', height: '6.5vh',}}>
 
                        <button hidden = {changeCount.current === 0} className='button text-overflow' style = {{ maxHeight: '6.5vh', height: '6.5vh', width: '16vh', marginRight: '1vh'}} onClick = {() => { HandleSaveOrCreate(); }}> {RenderCreateOrSaveButton()} </button>
                        <button hidden = {changeCount.current === 0} className='button text-overflow' style = {{ maxHeight: '6.5vh', height: '6.5vh', width: '16vh'}} onClick = {() => {titlePresent.current = true; changeCount.current = 0; setName(inputTree.name); setDescription(inputTree.description); }} > Reset </button>
                    </div>
                    <div className='text-overflow title-required-container'  hidden = {(titleRequired)} style = {{marginLeft: '2vw', width: '100%', color: 'red', textAlign: 'bottom'}}>Title is required!</div>
                </div>
            </div>
        </>    
        );
}

export default TreeDetails 