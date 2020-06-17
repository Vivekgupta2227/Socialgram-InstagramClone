import React from "react";
import { useFollowSuggestionsStyles } from "../../styles";
import {Link} from "react-router-dom"; 
import { Typography,Avatar } from "@material-ui/core";
import {LoadingLargeIcon} from "../../icons";
import Slider from "react-slick";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import FollowButton from "../shared/FollowButton";
import {useQuery} from "@apollo/react-hooks";
import { SUGGEST_USERS } from "../../graphql/queries";
import { UserContext } from "../../App";

function FollowSuggestions({hideHeader}) {
  const classes=useFollowSuggestionsStyles();
  const {followerIds,me} = React.useContext(UserContext)
  const variables = {
    limit:20,
    followerIds,
    createdAt:me.created_at
  }
  const {data,loading} = useQuery(SUGGEST_USERS,{variables})
  // let loading =false;
  return (
    <div className={classes.container}>
      {!hideHeader && <Typography
      color="textSecondary"
      variant="subtitle2"
      className={classes.typography} >
        Suggestions for You
      </Typography>}
      {loading?(<LoadingLargeIcon/>):(<Slider
      className={classes.slide}
      dots={false}
      infinite
      speed={1000}
      touchThreshold={1000}
      variableWidth
      swipeToSlide
      arrows
      slidesToScroll={3}
      easing="ease-in-out">
        {data.users.map(user=>(
          <FollowSuggestionsItem key={user.id} user={user}/>
        ))}
      </Slider>)}
    </div>
  );
}

function FollowSuggestionsItem({user}){
  const classes= useFollowSuggestionsStyles();
  const {name,username,profile_image,id}=user

  return (
    <div>
      <div className={classes.card}>
        <Link to={`/${username}`}>
          <Avatar
          src={profile_image}
          alt={`${username}'s profile`}
          classes={{
            root:classes.avatar,
            img:classes.avatarImg
          }} />
        </Link>
        <Link to={`/${username}`}>
          <Typography
          variant="subtitle2"
          className={classes.text}
          align="center" >
            {username}
          </Typography>
        </Link>
        <Typography
        color="textSecondary"
        variant="body2"
        className="classes.text"
        align="center" >
          {name}
        </Typography>
        <FollowButton side={false} id={id} />
      </div>
    </div>
  )
}

export default FollowSuggestions;
