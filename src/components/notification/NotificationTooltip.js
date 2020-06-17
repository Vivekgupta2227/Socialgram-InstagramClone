import React from "react";
import { useNavbarStyles } from "../../styles";
import { Typography } from "@material-ui/core";


function NotificationTooltip({notifications}) {
  const classes=useNavbarStyles();
  const followCount=countNotifications('follow');
  const likeCount=countNotifications('like');

  function countNotifications(notificationType){
    return notifications.filter(({type})=> type === notificationType).length;
  }

  return( <div className={classes.tooltipContainer}>
    {followCount > 0 && <div className={classes.tooltip}>
      <span aria-label="Followers" className={classes.followers}/>
        <Typography>
          {followCount}
        </Typography>
    </div>}
    {likeCount > 0 && <div className={classes.tooltip}>
      <span aria-label="Likes" className={classes.likes}/>
        <Typography>
          {likeCount}
        </Typography>
    </div>}
  </div>);
}

export default NotificationTooltip;
