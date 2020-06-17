import React from "react";
import { useProfilePictureStyles } from "../../styles";
import {Person} from "@material-ui/icons";
import {useMutation} from "@apollo/react-hooks";
import handleImageUpload from "../../utils/handleImageUpload";
import {EDIT_USERS_IMAGE} from "../../graphql/mutations";
import {UserContext} from "../../App";

function ProfilePicture({
  size,
  image,
  isOwner
}) {
  const classes =useProfilePictureStyles({size,isOwner});
  const {currentUserId} = React.useContext(UserContext);
  const [editUsersImage] = useMutation(EDIT_USERS_IMAGE);
  const [img,setImg] = React.useState(image)
  const inputRef = React.useRef();
  function openFileInput(){
     inputRef.current.click();
  }

  async function handleUpdateProfilePic(event){
    const url = await handleImageUpload(event.target.files[0],'instagram2');
    // console.log({url});
    const variables={id:currentUserId,profileImage:url}
    await editUsersImage({variables})
    setImg(url);
    
  }

  return (
    <section className={classes.section}>
      <input
      style={{
        display:"none"
      }}
        ref={inputRef}
        type="file"
        onChange={handleUpdateProfilePic} />
      {image ? (
        <div className={classes.wrapper} onClick={isOwner ? openFileInput : ()=> null} >
          <img src={img} alt="user-profile" className={classes.image}/>
        </div>
      ) : (
        <div className={classes.wrapper}>
          <Person className={classes.person} /> 
        </div>
      )}
    </section>
  );
}

export default ProfilePicture;
