import "@/screen/homescreen/index.scss";
import  RightComponent  from "@/screen/homescreen/Rightcomponent/index.js";
import Image from 'next/image';

const HomeScreen = () => {
    return(
         < div className="home-container"> 
            <div className="left-container">
                <div className="item-container">
                    <Image src="/logo.png" alt="logo" width={200} height={200}/>
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
export default HomeScreen;