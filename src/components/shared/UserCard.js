import React from "react";
import {Link} from "react-router-dom";
import { useUserCardStyles } from "../../styles";
import { Avatar, Typography } from "@material-ui/core";

function UserCard({user, avatarSize=44,location}) {
  const classes= useUserCardStyles({avatarSize});
  const { name , profile_image, username } = user

  return (
    <div className={classes.wrapper}>
      <Link to={`/${username}`}>
        <Avatar
        src={profile_image}
        alt="User Avatar"
        className={classes.avatar} />
      </Link>
      <div className={classes.nameWrapper}>
        <Link to={`/${username}`}>
          <Typography variant="subtitle2" className={classes.typography} >
            {username}
          </Typography>
          </Link>  
          <Typography color="textSecondary" variant="body2" className={classes.typography} >
            {location || name}
          </Typography>
      </div>
    </div>
  );
}

export default UserCard;
