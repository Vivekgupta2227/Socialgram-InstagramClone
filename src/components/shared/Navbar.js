import React from "react";
import {useNProgress} from "@tanem/react-nprogress";
import { useNavbarStyles,WhiteTooltip,RedTooltip } from "../../styles";
import { AppBar, Hidden, InputBase, Avatar, Typography,Grid,Fade,Zoom } from "@material-ui/core";
import {Link ,useHistory} from "react-router-dom";
import logo from "../../images/logo.png";
import { LoadingIcon,AddIcon,LikeIcon,LikeActiveIcon,ExploreIcon,ExploreActiveIcon,HomeIcon,HomeActiveIcon } from "../../icons";
import NotificationTooltip from "../notification/NotificationTooltip";
import NotificationList from "../notification/NotificationList";
import { useLazyQuery } from "@apollo/react-hooks";
import {SEARCH_USERS} from "../../graphql/queries";
import {UserContext} from "../../App";
import AddPostDialog from "../post/AddPostDialog";
import {isAfter} from "date-fns";

function Navbar({minimalNavbar}) {
  const classes=useNavbarStyles();
  const [isLoadingPage,setLoadingPage]=React.useState(true)
  const history= useHistory()
  const path = history.location.pathname
  React.useEffect(()=>{
    setLoadingPage(false);
  },[path])

  return (
    <>
    <Progress isAnimating={isLoadingPage}/>
    <AppBar className={classes.appBar}>
      <section className={classes.section}>
        <Logo />
        {!minimalNavbar && (
          <>
          <Search/>
          <Links path={path}/>
          </>
        )}
      </section>
    </AppBar>
    </>
  );
}

function Logo() {
  const classes=useNavbarStyles();
  return (
    <div className={classes.logoContainer}>
      <Link to="/">
        <div className={classes.logoWrapper}>
          <img src={logo} alt="Socialgram" className={classes.logo}></img>
        </div>
      </Link>
    </div>
  )
}

function Search(){
  const classes=useNavbarStyles();
  const [results,setResults]=React.useState([])
  const [loading,setLoading]=React.useState(false);
  const [query,setQuery]=React.useState('')
  const [searchUsers,{data}] = useLazyQuery(SEARCH_USERS)

  const hasResults=Boolean(query)&&results.length>0
  React.useEffect(() => {
    if(!query.trim()) return;
    setLoading(true)
    const variables = {query:`%${query}%`}
    searchUsers({variables})
    if(data){
      setResults(data.users)
      setLoading(false)
    }
    // setResults(Array.from({length:5},()=>getDefaultUser()))
  }, [query,data,searchUsers])

  function handleClearInput(){
    setQuery("");
  }

  return (
    <Hidden xsDown>
      <WhiteTooltip
      arrow
      interactive
      TransitionComponent={Fade}
      open={hasResults}
      title={
        hasResults&&(
          <Grid className={classes.resultContainer} container>
             {results.map(result=>(
               <Grid key={result.id}
               item
               className={classes.resultLink}>
                 <Link to={`/${result.username}`}>
                 <div className={classes.resultWrapper}>
                    <div className={classes.avatarWrapper}>
                      <Avatar src={result.profile_image} alt="user avatar"/>
                    </div>
                    <div className={classes.nameWrapper}>
                    <Typography variant="body1">
                        {result.username}
                      </Typography>
                      <Typography variant="body1">
                        {result.name}
                      </Typography>
                    </div> 
                 </div>
                 </Link>
               </Grid>
             ))} 
          </Grid>
        )
      }>
      <InputBase
      className={classes.input}
      onChange={event=>setQuery(event.target.value)}
      startAdornment={<span className={classes.searchIcon}/>}
      endAdornment={loading?
        (
        <LoadingIcon/>):(
      <span className={classes.clearIcon} onClick={handleClearInput}></span>
      )}
      placeholder="Search"
      value={query} />
      </WhiteTooltip>
    </Hidden>
  )
}

function Links({path}){
  const classes = useNavbarStyles();
  const {me,currentUserId} = React.useContext(UserContext)
  const newNotifications = me.notifications.filter(({created_at})=>
    isAfter(new Date(created_at),new Date(me.last_checked))
  )
  const hasNotifications = newNotifications.length > 0;
  
  const [showList,setList]=React.useState(false)
  const [showTooltip,setTooltip]=React.useState(hasNotifications)
  const inputRef = React.useRef()
  const [media,setMedia] = React.useState(null)
  const [showAddPostDialog,setAddPostDialog] = React.useState(false)

  React.useEffect(()=>{
    const timeout=setTimeout(handleHideTooltip,5000)
    return ()=>{clearTimeout(timeout);};
  },[])

  function handleToggleList(){
    setList(prev=>!prev)
  }
  function handleHideTooltip(){
    setTooltip(false)
  }

  function handleHideList(){
    setList(false)
  }

  function openFileInput(){
    inputRef.current.click();
  }

  function handleAddPost(event){
    setMedia(event.target.files[0]);
    setAddPostDialog(true);
  }

  function handleClose(){
    setAddPostDialog(false)
  }

  return (
    <div className={classes.linksContainer}>
      {showList && <NotificationList notifications={me.notifications} handleHideList={handleHideList} currentUserId={currentUserId} />}
      <div className={classes.linksWrapper}> 
      {showAddPostDialog && (
        <AddPostDialog media={media} handleClose={handleClose} />
      )} 
          <input
          type="file"
          style={{display:"none"}}
          ref={inputRef}
          onChange={handleAddPost} />
          <AddIcon onClick={openFileInput}/>
        <Link to="/">{path==="/"?<HomeActiveIcon/>:<HomeIcon/>}</Link>
        <Link to="/explore">{path==="/explore"?<ExploreActiveIcon/>:<ExploreIcon/>}</Link>
        <RedTooltip
        arrow
        open={showTooltip}
        onOpen={handleHideTooltip}
        TransitionComponent={Zoom}
        title={<NotificationTooltip notifications={newNotifications} />}
        >
        <div className={hasNotifications ? classes.notifications : ""} onClick={handleToggleList}>
          {showList?<LikeActiveIcon/>:<LikeIcon/>}
        </div>
        </RedTooltip>
        <Link to={`/${me.username}`}>
        <div className={path===`/${me.username}`?classes.profileActive:""}>
        </div>
        <Avatar
        src={me.profile_image}
        className={classes.profileImage}/>
        </Link>
      </div>
    </div>
  )
}

function Progress({isAnimating}){
  const classes = useNavbarStyles();
  const {animationDuration,isFinished,progress}=useNProgress({isAnimating})
  return (
    <div className={classes.progressContainer} style={{
      opacity:isFinished?0:1,
      transition:`opacity ${animationDuration}ms linear`
    }}>
      <div className={classes.progressBar} style={{
        marginLeft:`${(-1+progress)*100}%`,
        transition:`margin-left ${animationDuration}ms linear`
      }}>
        <div className={classes.progressBackground}/>
      </div>
    </div>
  )
}

export default Navbar;
