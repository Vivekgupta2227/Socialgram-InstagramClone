import React from "react";
import { useProfilePageStyles } from "../styles";
import Layout from "../components/shared/Layout";
import { Hidden, Card, CardContent, Button,Typography, Dialog,Zoom,DialogTitle,Avatar,Divider } from "@material-ui/core";
import ProfilePicture from "../components/shared/ProfilePicture";
import { Link,useHistory, useParams } from "react-router-dom";
import { GearIcon } from "../icons";
import ProfileTabs from "../components/profile/ProfileTabs";
import { AuthContext } from "../auth";
import { useQuery, useMutation, useApolloClient } from "@apollo/react-hooks";
import { GET_USER_PROFILE } from "../graphql/queries";
import LoadingScreen from "../components/shared/LoadingScreen";
import { UserContext } from "../App";
import { FOLLOW_USER, UNFOLLOW_USER } from "../graphql/mutations";

function ProfilePage() {
  const classes = useProfilePageStyles();
  const {username} = useParams()
  const {currentUserId}= React.useContext(UserContext)
  const [showOptionsMenu,setOptionsMenu] = React.useState(false);
  const variables = {username}
  const {data,loading} = useQuery(GET_USER_PROFILE,{
    variables,
    fetchPolicy:"no-cache"
  }) 
  if(loading)return <LoadingScreen/>
  const [user] = data.users;
  // console.log({user});
  
  const isOwner= user.id === currentUserId

  function handleOptionsMenuClick(){
    setOptionsMenu(true);
  }
  function handleCloseMenuClick(){
    setOptionsMenu(false);
  }
  
  return (
    <Layout title={`${user.name}(@${user.username})`}>
      <div className={classes.container}>
        <Hidden smUp>
          <Card className={classes.cardSmall}>
            <CardContent>
              <section className={classes.sectionSmall}>
                <ProfilePicture size={77} isOwner={isOwner} image={user.profile_image} />
                <ProfileNameSection user={user} isOwner={isOwner} handleOptionsMenuClick={handleOptionsMenuClick}/>
              </section>
              <MakeBioSection user={user}/>
            </CardContent>
            <PostCountSection user={user}/> 
          </Card>
        </Hidden>
        <Hidden xsDown>
          <Card className={classes.cardLarge}>
            <ProfilePicture isOwner={isOwner} image={user.profile_image} />
            <CardContent className={classes.cardContentLarge}>
              <ProfileNameSection user={user} isOwner={isOwner} handleOptionsMenuClick={handleOptionsMenuClick} />
              <PostCountSection user={user}/>
              <MakeBioSection user={user}/>
            </CardContent>
          </Card>
        </Hidden>
        {showOptionsMenu && <OptionsMenu handleCloseMenuClick={handleCloseMenuClick}/>}
        <ProfileTabs user={user} isOwner={isOwner} />
      </div>
    </Layout>
  );
}

function ProfileNameSection({user , isOwner , handleOptionsMenuClick}){
  const classes = useProfilePageStyles();
  const [showUnfollowDialog,setUnfollowDialog ]=React.useState(false)
  const {currentUserId,followingIds,followerIds} = React.useContext(UserContext)
  let followButton;
  const isAlreadyFollowing = followingIds.some(id => id===user.id)
  const [isFollowing,setFollowing] = React.useState(isAlreadyFollowing)
  const isFollower = !isFollowing && followerIds.some(id=>id===user.id)
  
  const [followUser] = useMutation(FOLLOW_USER);

  function handleFollowUser(){
    const variables={
      userIdToFollow:user.id,
      currentUserId
    }
    setFollowing(true)
    followUser({variables})
  }

  const onUnfollowUser = React.useCallback(()=>{
    setUnfollowDialog(false)
    setFollowing(false)
  },[])

  if(isFollowing){
    followButton=(
      <Button onClick={()=>setUnfollowDialog(true)} variant="outlined" className={classes.button}>
        Following
      </Button>
    )
  } else if(isFollower){
    followButton=(
      <Button onClick={handleFollowUser} variant="contained" color="primary" className={classes.button}>
        Follow Back
      </Button>
    )
  } else{
    followButton=(
      <Button onClick={handleFollowUser} variant="contained" color="primary" className={classes.button}>
        Follow
      </Button>
    )
  }
  
  return (
    <>
    <Hidden xsDown>
      <section className={classes.usernameSection}>
        <Typography className={classes.username}>
          {user.username}
        </Typography>
        {isOwner ? (
          <>
          <Link to="/accounts/edit">
            <Button variant="outlined">Edit Profile</Button>
          </Link>
          <div onClick={handleOptionsMenuClick} className={classes.settingsWrapper}>
            <GearIcon className={classes.settings}/>
          </div>
          </>
        ): (
          <>
          {followButton}
          </>
        )}
      </section>
    </Hidden>
      
    <Hidden smUp>
    <section>
        <div className={classes.usernameDivSmall}>
          <Typography className={classes.username}>
            {user.username}
          </Typography>
          {isOwner && (
            <div onClick={handleOptionsMenuClick} className={classes.settingsWrapper}>
            <GearIcon className={classes.settings}/>
          </div>
          )}
        </div>
        {isOwner ? (
          <Link to="/accounts/edit">
          <Button variant="outlined" style={{width:"100%"}} >Edit Profile</Button>
        </Link>
        ): followButton}
      </section>
    </Hidden>
    {showUnfollowDialog && <UnfollowDialog onUnfollowUser={onUnfollowUser} user={user} onClose={()=>setUnfollowDialog(false)} />}
    </>
  )
}

function UnfollowDialog({onClose,user,onUnfollowUser}){
  const classes = useProfilePageStyles();
  const {currentUserId} = React.useContext(UserContext)
  const [unfollowUser] = useMutation(UNFOLLOW_USER);

  function handleUnfollowUser(){
    const variables={
      userIdToFollow:user.id,
      currentUserId
    }
    unfollowUser({variables})
    onUnfollowUser()
  }

  return (
    <Dialog
    open
    classes={{
      scrollPaper:classes.unfollowDialogScrollPaper
    }}
    onClose={onClose}
    TransitionComponent={Zoom} >
      <div className={classes.wrapper}>
        <Avatar
        src = {user.profile_image}
        alt={`${user.username}'s avatar`}
        className={classes.avatar} />
      </div>
      <Typography align = "center" className={classes.unfollowDialogText} variant="body2">
        Unfollow @{user.username}
      </Typography>
      <Divider/>
      <Button onClick={handleUnfollowUser} className={classes.unfollowButton}>
        Unfollow
      </Button>
      <Divider/>
      <Button className={classes.cancelButton} onClick={onClose}>
        Cancel
      </Button>
    </Dialog>
  )
}


function PostCountSection({user}){
  const classes = useProfilePageStyles();
  const options= ["posts","followers","following"];
  return (
    <>
    <Hidden smUp>
      <Divider/>
    </Hidden>
    <section className={classes.followingSection}>
      {options.map(option => (
        <div key={option} className={classes.followingText}>
          <Typography className={classes.followingCount}>
            {user[`${option}_aggregate`].aggregate.count}
          </Typography>
          <Hidden xsDown>
            <Typography>
              {option}
            </Typography>
            </Hidden>  
          <Hidden smUp>  
            <Typography color="textSecondary">
              {option}
            </Typography>  
          </Hidden>
        </div>
      ))}
    </section>
    <Hidden smUp>
      <Divider/>
    </Hidden>
  </>  
  )
}


function MakeBioSection({user}){
  const classes=useProfilePageStyles()

  return (
    <>
    <section className={classes.section}>
      <Typography className={classes.typography}>{user.name}</Typography>
      <Typography>{user.bio}</Typography>
  <a href={user.website} target="_blank" rel="noopener noreferrer">{user.website}</a>
    </section>
    </>
  )
}

function OptionsMenu({handleCloseMenuClick}){
  const classes = useProfilePageStyles();
  const [showLogoutMessage,setLogoutMessage]=React.useState(false)
  const {signOut} = React.useContext(AuthContext)
  const history = useHistory();
  const client = useApolloClient();

  function handleLogoutClick(){
    setLogoutMessage(true);
    setTimeout(async ()=>{
      await client.clearStore();
      signOut();
      history.push('/accounts/login');
    },2000)
  }

  return (
    <Dialog 
    open
    classes={{
      scrollPaper:classes.dialogScrollPaper,
      paper:classes.dialogPaper
    }}
    TransitionComponent={Zoom} >
      {showLogoutMessage ? (
        <DialogTitle className={classes.dialogTitle}>
          Logging Out
          <Typography color="textSecondary">
            You need to log back in to continue using Socialgram.
          </Typography>
        </DialogTitle>
      ):
      (<>
      <OptionsItem text="Change Password"/>
      <OptionsItem text="Nametag"/>
      <OptionsItem text="Authorized Apps"/>
      <OptionsItem text="Notifications"/>
      <OptionsItem text="Privacy and Security"/>
      <OptionsItem text="Logout" onClick={handleLogoutClick}/>
      <OptionsItem text="Cancel" onClick={handleCloseMenuClick} />
      </>)}
    </Dialog>
  )
}

function OptionsItem({text,onClick}){
  return(
    <>
    <Button style={{padding:"12px 8px"}} onClick={onClick}>
      {text}
    </Button>
    </>
  )
}

export default ProfilePage;
