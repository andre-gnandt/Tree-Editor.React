const HeaderInfo = ({middleText = null}) => {
    
    
    return (
        <div style = {{display: 'flex', height: '4vw',width: '100vw', fontSize: '2vw', color: 'white', backgroundColor: 'black'}}>
            <div>
                Creator: Andre Gnandt
            </div>

            { (middleText) && 
                (
                    <div style = {{textAlign: 'center', justifyContent: 'center', position: 'absolute', left: '25vw', fontSize: '1.2vw', width: '50vw'}}>
                        {middleText}
                    
                    </div>
                )
            }
        </div>
    );
}
export default HeaderInfo 