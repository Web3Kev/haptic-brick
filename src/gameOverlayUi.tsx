import { useState } from 'react';
import { useSoundStore } from './store/soundStore';
import { useStore } from './store/store';




const GameOverlayUI = () => {





    const [showInfo, setShowInfo] = useState<boolean>(false);

    const { playSound } = useSoundStore();

    const {gameStarted, setGameStarted} = useStore()


    const buttonVibrate = () =>{
       if (navigator.haptic) {
      navigator.haptic([
        { intensity: 0.7, sharpness: 0.1 },
        // { intensity: 0.8, sharpness: 0.3, duration: 100 }
      ]);
    } else if('vibrate' in navigator) {
      navigator.vibrate(10); 
      }
    }


  
    const handleClick = () => {
        setGameStarted(true); 
        playSound("life");
        buttonVibrate();
    };




  return (
    <div id='interface' >

      {/* <div className="vertical-right-column-topbased ">
     

        <button 
          className="icon-right"
          onClick={()=>{toggleMute(); buttonVibrate();}}
          style={{
            background: isMuted?"rgba(232, 137, 55,0.5)":"rgba(164, 169, 169,0.5)",
          }}
        >
          {isMuted ? 
          ((<img 
            src="soundoff.png"  
            alt="audio off"
            style={{
              width: "45px", 
              height: "45px",
              objectFit: "contain",
            }}/>)) : ((<img 
              src="soundon.png"  
              alt="audio on"
              style={{
                width: "45px", 
                height: "45px",
                objectFit: "contain",
              }}/>))}

        </button>
      </div> */}
       
      <div className="vertical-right-column-topbased ">

        {/* INFO BUTTON */}
        {<button 
          className="icon-right"
          onClick={()=>{setShowInfo(!showInfo); buttonVibrate();}}
        >
          <img 
            src="info.png"  
            alt="info"
            style={{
              width: "45px", 
              height: "45px",
              objectFit: "contain",
            }}/>
        
        </button>}        

      </div>

      

       <div className="vertical-right-column-bottombased">

        {/* RELOAD BUTTON */}
        {(gameStarted) &&<button 
          className="icon-right"
          onClick={()=>{setGameStarted(false); buttonVibrate();}}
        >
          <img 
            src="reload.png"  
            alt="reload"
            style={{
              width: "45px", 
              height: "45px",
              objectFit: "contain",
            }}/>
        
        </button>}
        

      </div>
      
      

      {/* INTRO SCREEN */}
      {!gameStarted && !showInfo &&(
      <div className="intro">
        
        <div className="intro-header">
          <h2>Haptic Brick</h2>
        </div>
         <br></br>
        <p>Demolish this Lego Castle<br></br><br></br> Tap or click to throw cannon balls</p>
        <br></br>
        <button className="replay-button" onClick={()=>handleClick()}>
          Start
        </button>
        
      </div>
      )}


      {/* INFO */}
      {showInfo && (
        <div className="credits">
           <div className="close-button"><button onClick={()=>{setShowInfo(false); buttonVibrate();}}>✖</button></div>
           <>
            <h2>Haptic Brick</h2>
            <p >made by</p>
            
            {/* <p style={{ color: "orange", textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)", fontSize:"20px", margin:"0" }}>Kevin Thien</p>
     */}
            <a
              href="https://bsky.app/profile/webxr.bsky.social"
              target="_blank"
              rel="noopener noreferrer"
              className="invisible-link"
            >
              Kevin Thien
            </a>
            <p>using</p>
            <p style={{ color: "indianred", textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)", fontSize:"20px", margin:"0" }}>R3F</p>
            <p style={{ color: "indianred", textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)", fontSize:"20px", margin:"0" }}>Rapier</p>
            <p>3D Model:</p>
            <p style={{ color: "indianred", textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)", fontSize:"20px", margin:"0" }}>"2x2 Lego Brick"</p>
            <p>by:</p>
            <p style={{ color: "teal", textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)", fontSize:"20px", margin:"0" }}>Aleks P</p>
            <p>This mini project is to illustrate the use of navigation.vibrate and especially its custom integration in the vibration enabling Brrrowser app on iOS</p>

          </>
        </div>
        )}

    </div>

  );
};

export default GameOverlayUI;