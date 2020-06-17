import React from "react";
import { useEditProfilePageStyles } from "../styles";
import { IconButton, Hidden,Drawer, List, ListItemText,ListItem, TextField, Typography, Button,Snackbar,Slide } from "@material-ui/core";
import {Menu} from "@material-ui/icons";
import Layout from "../components/shared/Layout";
import ProfilePicture from "../components/shared/ProfilePicture";
import { UserContext } from "../App";
import { GET_EDIT_USER_PROFILE } from "../graphql/queries";
import LoadingScreen from "../components/shared/LoadingScreen";
import {useQuery,useMutation} from "@apollo/react-hooks";
import {useForm} from "react-hook-form";
import isURL from "validator/lib/isURL";
import isEmail from "validator/lib/isEmail";
import isMobilePhone from "validator/lib/isMobilePhone";
import { EDIT_USERS , EDIT_USERS_IMAGE} from "../graphql/mutations";
import {AuthContext} from "../auth";
import handleImageUpload from "../utils/handleImageUpload";

function EditProfilePage({history}) {
  const {currentUserId} = React.useContext(UserContext)
  const variables={id:currentUserId};
  const {data,loading}=useQuery(GET_EDIT_USER_PROFILE , {variables})
  const classes = useEditProfilePageStyles();
  const path = history.location.pathname
  const [showDrawer,setDrawer] = React.useState(false)

  if(loading)return<LoadingScreen/>

  function handleToggleDrawer(){
    setDrawer(prev => !prev)
  }

  function handleListClick(index){
    switch(index){
      case 0:
        history.push('/accounts/edit')
    }
  }

  function handleSelected(index){
   
    switch(index){
      case 0:
        return path.includes('edit')
      default:
        break;  
    }
  }

  const options =[
    "Edit Profile",
    "Change Password",
    "Apps and Websites",
    "Email and SMS",
    "Push Notifications",
    "Manage Contacts",
    "Privacy and Security",
    "Login Activity",
    "Emails from Socialgram"
  ]

  const drawer = (
    <List>
      {options.map((option,index)=>(
        <ListItem
        key={option}
        button
        selected={handleSelected(index)}
        onClick={()=>handleListClick(index)}
        classes={{
          selected:classes.listItemSelected,
          button:classes.listItemButton
        }} >
          <ListItemText primary={option} />
        </ListItem>
      ))}
    </List>
  )

  return (
    <Layout title="Edit-Profile">
      <section className={classes.section}>
        <IconButton edge="start"
        onClick={handleToggleDrawer}
        className={classes.menuButton} >
          <Menu />
        </IconButton>
        <nav>
          <Hidden smUp implementation="css">
            <Drawer
            variant="temperory"
            anchor="left"
            open={showDrawer}
            onClose={handleToggleDrawer}
            classes={{
              paperAnchorLeft:classes.temperoryDrawer
            }} >
              {drawer}
            </Drawer>
          </Hidden>
          <Hidden xsDown implementation="css"
          className={classes.permanentDrawerRoot} >
            <Drawer
            variant="permanent"
            open
            classes={{
              paper:classes.permanentDrawerPaper,
              root:classes.permanentDrawerRoot
            }} >
              {drawer}
            </Drawer>
          </Hidden>
        </nav>
        <main>
            {path.includes('edit')&&<EditUserInfo user={data.users_by_pk} />}
        </main>
      </section>
    </Layout>
  );
}

const DEFAULT_ERROR = {type:"",message:""}

function EditUserInfo({user}){
  const classes = useEditProfilePageStyles();
  const {register,handleSubmit} = useForm({mode:"onBlur"})
  const {updateEmail} = React.useContext(AuthContext)
  const [editUser]=useMutation(EDIT_USERS)
  const [editUsersImage]=useMutation(EDIT_USERS_IMAGE)
  const [error,setError] = React.useState(DEFAULT_ERROR)
  const [open,setOpen] = React.useState(false)
  const [profileImage,setProfileImage] = React.useState(user.profile_image)

  async function onSubmit(data) {
    try {
      setError(DEFAULT_ERROR);
      const variables = { ...data, id: user.id };
      await updateEmail(data.email);
      await editUser({ variables });
      setOpen(true);
    } catch (error) {
      console.error("Error updating profile", error);
      handleError(error);
    }
  }

  function handleError(error) {
    if (error.message.includes("users_username_key")) {
      setError({
        type: "username",
        message: "This username is already taken.",
      });
    } else if (error.code.includes("auth")) {
      setError({ type: "email", message: error.message });
    }
  }

  async function handleUpdateProfilePic(event){
    const url = await handleImageUpload(event.target.files[0],'instagram2');
    // console.log({url});
    const variables={id:user.id,profileImage:url}
    await editUsersImage({variables})
    setProfileImage(url);
    
  }

  return (
    <section className={classes.container}>
      <div className={classes.pictureSectionItem}>
        <ProfilePicture size={38} image={profileImage} />
        <div className={classes.justifySelfStart}>
          <Typography className={classes.typography}>
            {user.username}
          </Typography>
          <input
          accept="image/*"
          id="image"
          type="file"
          style={{display:"none"}}
          onChange={handleUpdateProfilePic}
          />
          <label htmlFor="image">
          <Typography color="primary" variant="body2" className={classes.typographyChangePic}>
            Change Profile Photo
          </Typography>
          </label>
        </div>
      </div>
      <form className={classes.form} onSubmit={handleSubmit(onSubmit)}> 
        <SectionItem text="Name" formItem={user.name} name="name" inputRef={register({
                required:true,
                minLength:5,
                maxLength:20
              })}  />
        <SectionItem text="Username" formItem={user.username} error={error} name="username" inputRef={register({
                required:true,
                pattern:/^[a-zA-Z0-9]*$/,
                minLength:5,
                maxLength:20
              })}  />
        <SectionItem text="Website" formItem={user.website} name="website" inputRef={register({
                validate: input => Boolean(input) ? isURL(input,{
                  protocols: ['https','http'],
                  require_protocol:true
                }) : true
              })} />
        <div className={classes.sectionItem}>
          <aside>
            <Typography className={classes.bio}>Bio</Typography>
          </aside>
          <TextField variant="outlined"
            name="bio"
            inputRef={register({
              maxLength:120
            })} 
            fullWidth
            multiline
            rowsMax={5}
            rows={3}
            defaultValue={user.bio}
      />
        </div>
        <div className={classes.sectionItem}>
          <div/>
          <Typography className={classes.justifySelfStart} color="textSecondary">Personal Information</Typography>
        </div>
        <SectionItem text="Email" formItem={user.email} type="email" error={error} name="email" inputRef={register({
                required:true,
                validate: input => isEmail(input)
              })}  />
        <SectionItem text="Phone Number" formItem={user.phone_no} name="phoneNo" inputRef={register({
                validate: input => Boolean(input) ? isMobilePhone(input) : true
              })}  />
        <div className={classes.sectionItem}>
          <div/>
          <Button
          type="submit"
          variant="contained"
          color="primary"
          className={classes.justifySelfStart} >
            Submit
          </Button>
        </div>
      </form>
      <Snackbar
      message={<span>Profile Updated</span>}
      open={open}
      autoHideDuration={6000}
      TransitionComponent={Slide}
      onClose={()=>setOpen(false)} />
    </section>
  )
}

function SectionItem({ type = 'text', text ,formItem,inputRef,name,error}){
  const classes= useEditProfilePageStyles()
  return (
    <div className={classes.sectionItemWrapper}>
      <aside>
        <Hidden xsDown>
          <Typography className={classes.typography}
          align="right" >
            {text}
          </Typography>
        </Hidden>
        <Hidden smUp>
        <Typography className={classes.typography} >
            {text}
          </Typography>
        </Hidden>
      </aside>
      <TextField variant="outlined"
      name={name}
      inputRef={inputRef}
      helperText={error?.type === name && error.message}
      fullWidth
      defaultValue={formItem}
      type={type}
      className={classes.textField}
      inputProps={{
        className:classes.textFieldInput
      }} />
    </div>
  )
}

export default EditProfilePage;
