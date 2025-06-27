import { useEffect, useState } from 'react';
import { useSoundStore } from './store/soundStore';
import { useStore } from './store/store';
import { animated, useSpring } from '@react-spring/web';




const GameOverlayUI = () => {





    const [showInfo, setShowInfo] = useState<boolean>(false);

    const { playSound } = useSoundStore();

    const {gameStarted, setGameStarted,cannonBallShot,maxCannonBalls, resetGame, setGameOver, minimumDemolition,currentDemolition, gameOver, nextLevel,level} = useStore()


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

    useEffect(()=>{

      if (currentDemolition >= minimumDemolition) {

          setGameOver(true);
      }
    },[currentDemolition, minimumDemolition])



    const [trigger, setTrigger] = useState(false);

     const animation = useSpring({
      transform: trigger ? "scale(2.3)" : "scale(1.2)", 
      config: { tension: 300, friction: 10 },
      reset: true,
      onRest: () => setTrigger(false), 
    });

     useEffect(() => {
      if (gameStarted) {
        setTrigger(true);
      }
    }, [gameStarted, cannonBallShot]);

  
    const handleClick = () => {
        setGameStarted(true); 
        playSound("life");
        buttonVibrate();
    };

    const Reset = ()=>{
      if(!gameOver){setGameOver(true);}
      setGameStarted(false); 

      buttonVibrate();
       startAfter(200, () => {
          resetGame();
      });
       startAfter(500, () => {
        handleClick()
      });
    };

    //  const ResetAll = (e:any)=>{
    //   e.stopPropagation(); 
    //   setGameStarted(false); 
    //   setLevel(0);
    //   resetGame();
    //   buttonVibrate();
    // };

     const Next = (e:any)=>{
      e.stopPropagation(); 
      setGameStarted(false); 
      nextLevel();

      resetGame();
      buttonVibrate();
      startAfter(500, () => {
        handleClick()
      });
    };

    const startAfter = (time: number, callback: () => void) => {
      setTimeout(callback, time);
    };




  return (
    <div id='interface' >
       
      <div className="vertical-right-column-topbased ">

        {/* INFO BUTTON */}
        {<button 
          className="icon-right"
          onClick={(e)=>{
            e.stopPropagation();
            setShowInfo(!showInfo); 
            buttonVibrate();
          }}
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

     {gameStarted &&<div className="demolition-indicator">
      <div>{currentDemolition}%</div>
      <div style={{ fontSize: '1.1rem' }}>Demolished</div>
      <div style={{ fontSize: '1.1rem' }}>({minimumDemolition}% required)</div>
    </div>}

       <div className="vertical-left-column-topbased ">

       {gameStarted && (
          <div className="cannonBalls">
            <div className="cannonBallsRow">
              <div className="cannonBallVisual" />
              <animated.p style={animation}>
                {maxCannonBalls - cannonBallShot}
              </animated.p>
            </div>
          </div>
        )}

      </div>

      

       { (cannonBallShot>=1) && <div className="vertical-right-column-bottombased">

        {/* RELOAD BUTTON */}
        {(gameStarted) &&<button 
          className="icon-right"
          onClick={(e)=>{
            e.stopPropagation(); 
            Reset();
          }}
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
        

      </div>}
      
      

      {/* INTRO SCREEN */}
      {!gameStarted && !showInfo && (level===0) &&
      <div className="intro">
        
        <div className="intro-header">
          <h2>Haptic Brick</h2>
        </div>
         <h3 style={{marginBottom:"5px", color:"rgb(127, 126, 126)"}}>Demolish Lego Castles</h3>
         <br></br>
        <p>Tap or click to throw cannon balls <br></br>Drag left / Right to rotate around</p>

   
        <button className="replay-button" onClick={()=>handleClick()}>
          Start
        </button>
        
      </div>
      }

      {/* GameOVER SCREEN */}
      {gameStarted && !showInfo && gameOver && (
      <div className="intro">
           <h2 style={{marginBottom:"5px", color:"black"}}>Level {level}</h2>
        <div className="intro-header">
          {currentDemolition>=minimumDemolition?(<h2>Congratulations</h2>):(<h2>Game Over</h2>)}
        </div>
     
         <br></br>
        <p style={{marginBottom:"0px",marginTop:"10px", fontSize:"1.1rem"}}>{currentDemolition>minimumDemolition ?("You demolished the Castle with"):("You failed to demolish the Castle")}</p>

         {currentDemolition>=minimumDemolition ? (<><div className='ballFeat'>{cannonBallShot}<div className="cannonBallVisual" /></div>
           <p style={{margin:"0px", fontSize:"1.1rem"}}>cannon ball{cannonBallShot>1?("s"):("")}</p>
         </>) : <br></br>}
        
         <div className='gameOverChoices'>
       
         <button 
          className="replay-button" 
          style={{marginTop:"30px"}} 
          onClick={(e)=>{
            e.stopPropagation(); 
            Reset();
            }
          }>
          Restart
        </button>
          {currentDemolition>=minimumDemolition && <button className="replay-button" style={{marginTop:"30px"}} onClick={(e)=>{Next(e)}}>
          Next
        </button>}
        </div>
        
      </div>
      )}


      {/* INFO */}
      {showInfo && (
        <div className="credits" onClick={(e)=>{ e.stopPropagation();}}>
           <div className="close-button"><button onClick={(e)=>{
            e.stopPropagation();
            setShowInfo(false); 
            buttonVibrate();}}>✖</button></div>
           <>
            <h2>Haptic Brick</h2>
            <p >made by</p>
            
            <a
              href="https://bsky.app/profile/webxr.bsky.social"
              target="_blank"
              rel="noopener noreferrer"
              className="invisible-link"
            >
              Kevin Thien
            </a>
            <p>using</p>
            <p style={{ color: "rgb(127, 126, 126)", textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)", fontSize:"20px", margin:"0" }}>R3F</p>
            <p style={{ color: "rgb(127, 126, 126)", textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)", fontSize:"20px", margin:"0" }}>Rapier</p>
            <p>3D Model:</p>
            <p style={{ color: "rgb(127, 126, 126)", textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)", fontSize:"20px", margin:"0" }}>"2x2 Lego Brick"</p>
            <p  style={{ marginTop:"0"}}>by:</p>
            <p style={{ color: "rgb(127, 126, 126)", textShadow: "1px 1px 2px rgba(0, 0, 0, 0.3)", fontSize:"20px", margin:"0" }}>Aleks P</p>
            <p>This mini project is to illustrate the use of navigation.vibrate() and especially its custom integration in the vibration enabling iOS app  
              <a
              href="https://web3kev.github.io/Brrrowser/"
              target="_blank"
              rel="noopener noreferrer"
              className="invisible-link"
            >
              Brrrowser
            </a> </p>

          </>
        </div>
        )}

    </div>

  );
};

export default GameOverlayUI;