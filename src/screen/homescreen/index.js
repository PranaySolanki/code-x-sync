import "./index.scss";
import { RightComponent } from "./Rightcomponent";

export const HomeScreen = () => {
    return(
         < div className="home-container"> 
            <div className="left-container">
                <div className="item-container">
                    <img src="logo.png" alt="logo"/>
                    <h1> CodeXsync</h1>
                    <h2>code.compile.debug</h2>
                    <button>
                        <span className="material-icons"> add </span>
                        <span>  Create Project </span>
                    </button>
                 </div>
            </div>
            <RightComponent />
         </div>

    );
         
      
       

 
}