import React from "react";
import {AuthContext} from "./auth";
import {useHistory,useLocation, Switch , Route ,Redirect } from "react-router-dom";
import Feedpage from "./pages/feed";
import Explorepage from "./pages/explore";
import Profilepage from './pages/profile';
import EditProfilePage from './pages/edit-profile';
import Loginpage from './pages/login';
import NotFoundpage from './pages/not-found';
import PostPage from './pages/post';
import Signuppage from './pages/signup';
import PostModal from "./components/post/PostModal";
import {useSubscription} from "@apollo/react-hooks";
import { ME } from "./graphql/subscriptions";
import LoadingScreen from "./components/shared/LoadingScreen";

export const UserContext = React.createContext();

function App() {
  const {authState} = React.useContext(AuthContext);
  const isAuth = authState.status === 'in';
  const userId = isAuth ? authState.user.uid : null;
  const variables ={userId}
  const {data,loading} = useSubscription(ME , {variables});
  const history = useHistory()
  const location = useLocation()
  const prevLocation = React.useRef(location);
  const modal = location.state?.modal;
  

  React.useEffect(()=>{
    if(history.action !=='POP' && !modal){
      prevLocation.current=location;
    }
  },[location,modal,history.action])

  if(loading)return <LoadingScreen/>

  if(!isAuth){
    return (
    <Switch>
      <Route path="/accounts/login" component={Loginpage}/>
      <Route path="/accounts/signup" component={Signuppage}/>
      <Redirect to="/accounts/login"/>
    </Switch>
    )
  }

  const isModalOpen = modal && prevLocation!==location; 
  const me =isAuth && data ? data.users[0] : null;
  const currentUserId = me.id;
  const followingIds = me.following.map(({user})=>user.id)
  const followerIds = me.followers.map(({user})=>user.id)
  const feedIds = [...followingIds,currentUserId]

  
  return (
      <>
      <UserContext.Provider value={{me,currentUserId,followingIds,followerIds,feedIds}}>
      <Switch location={isModalOpen?prevLocation.current:location} >
        <Route exact path="/" component={Feedpage}></Route>
        <Route path="/explore" component={Explorepage}></Route>
        <Route path="/accounts/edit" component={EditProfilePage}></Route>
        <Route path="/accounts/login" component={Loginpage}></Route>
        <Route path="/accounts/signup" component={Signuppage}></Route>
        <Route exact path="/:username" component={Profilepage}></Route>
        <Route exact path="/p/:postId" component={PostPage}></Route>
        <Route path="*" component={NotFoundpage}></Route>
        </Switch> 
        {isModalOpen && <Route exact path="/p/:postId" component={PostModal} />}
        </UserContext.Provider>
      </>  
  );
}

export default App;
