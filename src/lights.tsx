const Lights = () => {

    return(
        <>
        <ambientLight intensity={0.6} color={"white"}/>
        <directionalLight position={[-2,2,2]} castShadow/>
 
        <pointLight
        args={[0,2,0]}
        position={[-2,1.5,-2]}
        intensity={80}
        color={"grey"}
        distance={5}
        decay={2}
        />
          <pointLight
        args={[0,2,0]}
        position={[2,1.5,-2]}
        intensity={80}
        color={"grey"}
        distance={5}
        decay={2}
        />
         <pointLight
        args={[0,2,0]}
        position={[-2,1.5,2]}
        intensity={80}
        color={"grey"}
        distance={5}
        decay={2}
        />
          <pointLight
        args={[0,2,0]}
        position={[2,1.5,2]}
        intensity={80}
        color={"grey"}
        distance={5}
        decay={2}
        />
        </>
    );
}

export default Lights;